# resumes/views.py
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, Http404
from .models import Resume
from .serializer import ResumeSerializer, ResumeCreateSerializer
from .utils import process_resume_async
import tempfile
import os

class ResumeListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get(self, request):
        # Students can only see their own resumes
        if request.user.role == 'student':
            resumes = Resume.objects.filter(user=request.user)
        else:
            # Placement team and admin can see all resumes
            resumes = Resume.objects.all()
        
        serializer = ResumeSerializer(resumes, many=True, context={'request': request})
        return Response(serializer.data)
    
    def post(self, request):
        serializer = ResumeCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Get the uploaded file
            uploaded_file = request.FILES.get('file')
            
            # Create the resume object with local file storage
            resume = Resume.objects.create(
                user=request.user,
                file_name=uploaded_file.name,
                file_size=uploaded_file.size,
                file=uploaded_file  # Store locally
            )
            
            print(f"✅ File uploaded locally: {resume.file.name}")
                
            resume.save()
            
            # Trigger background processing
            try:
                process_resume_async(resume.id)
            except Exception as e:
                print(f"Error processing resume: {e}")
            
            # Return full resume data
            response_serializer = ResumeSerializer(resume, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResumeDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        resume = get_object_or_404(Resume, pk=pk)
        
        # Students can only access their own resumes
        if request.user.role == 'student' and resume.user != request.user:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ResumeSerializer(resume, context={'request': request})
        return Response(serializer.data)
    
    def delete(self, request, pk):
        resume = get_object_or_404(Resume, pk=pk)
        
        # Students can only delete their own resumes
        if request.user.role == 'student' and resume.user != request.user:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        resume.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ResumeDownloadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        resume = get_object_or_404(Resume, pk=pk)
        
        # Students can only download their own resumes
        if request.user.role == 'student' and resume.user != request.user:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # Use local file storage
            if resume.file:
                with open(resume.file.path, 'rb') as f:
                    response = HttpResponse(f.read(), content_type='application/pdf')
                    response['Content-Disposition'] = f'attachment; filename="{resume.file_name}"'
                    return response
            else:
                raise Http404("File not found")
                
        except Exception as e:
            print(f"Error downloading file: {str(e)}")
            raise Http404("File not found or cannot be downloaded")

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def resume_stats(request):
    """Get resume statistics for dashboard"""
    if request.user.role == 'student':
        total_resumes = Resume.objects.filter(user=request.user).count()
        processed_resumes = Resume.objects.filter(
            user=request.user, 
            processing_status='processed'
        ).count()
    else:
        total_resumes = Resume.objects.count()
        processed_resumes = Resume.objects.filter(processing_status='processed').count()
    
    return Response({
        'total_resumes': total_resumes,
        'processed_resumes': processed_resumes,
        'pending_resumes': total_resumes - processed_resumes
    })

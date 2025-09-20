# jobs/views.py
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import JobDescription
from .serializers import (
    JobDescriptionSerializer, 
    JobDescriptionCreateSerializer, 
    JobDescriptionUpdateSerializer
)
from .utils import process_job_description_async

class JobDescriptionListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get(self, request):
        # Filter active jobs by default
        jobs = JobDescription.objects.filter(is_active=True)
        
        # Allow filtering by priority, company, etc.
        priority = request.query_params.get('priority')
        company = request.query_params.get('company')
        
        if priority:
            jobs = jobs.filter(priority=priority)
        if company:
            jobs = jobs.filter(company_name__icontains=company)
        
        serializer = JobDescriptionSerializer(jobs, many=True, context={'request': request})
        return Response(serializer.data)
    
    def post(self, request):
        # Only placement team and admin can create jobs
        if request.user.role == 'student':
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = JobDescriptionCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            job = serializer.save()
            # Trigger background processing
            try:
                process_job_description_async(job.id)
            except Exception as e:
                print(f"Error processing job description: {e}")
            
            response_serializer = JobDescriptionSerializer(job, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class JobDescriptionDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        job = get_object_or_404(JobDescription, pk=pk)
        serializer = JobDescriptionSerializer(job, context={'request': request})
        return Response(serializer.data)
    
    def patch(self, request, pk):
        # Only placement team and admin can update jobs
        if request.user.role == 'student':
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        job = get_object_or_404(JobDescription, pk=pk)
        serializer = JobDescriptionUpdateSerializer(job, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            response_serializer = JobDescriptionSerializer(job, context={'request': request})
            return Response(response_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        # Only placement team and admin can delete jobs
        if request.user.role == 'student':
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        job = get_object_or_404(JobDescription, pk=pk)
        job.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def job_stats(request):
    """Get job statistics for dashboard"""
    active_jobs = JobDescription.objects.filter(is_active=True).count()
    high_priority_jobs = JobDescription.objects.filter(
        is_active=True, 
        priority='high'
    ).count()
    
    return Response({
        'active_jobs': active_jobs,
        'high_priority_jobs': high_priority_jobs,
        'total_jobs': JobDescription.objects.count()
    })

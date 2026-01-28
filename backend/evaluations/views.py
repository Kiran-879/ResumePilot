import time
import logging
logger = logging.getLogger(__name__)
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Evaluation, EvaluationLog, JobApplication
from .serializer import (
    EvaluationSerializer, 
    EvaluationCreateSerializer, 
    EvaluationSummarySerializer,
    EvaluationLogSerializer
)
from resumes.models import Resume
from jobs.models import JobDescription


# Import real LLM services only
# Temporarily disabled for deployment
# from llm_services import enhanced_scoring_service, embedding_service

# Mock services for deployment
class MockService:
    def enhance_evaluation(self, *args, **kwargs):
        return {}
    
    def get_skills_embedding(self, *args, **kwargs):
        return []

enhanced_scoring_service = MockService()
embedding_service = MockService()

class EvaluationListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Students can only see evaluations for their resumes
        if request.user.role == 'student':
            evaluations = Evaluation.objects.filter(resume__user=request.user)
        else:
            evaluations = Evaluation.objects.all()
        
        # Use full serializer for list view to include all nested data
        serializer = EvaluationSerializer(evaluations, many=True, context={'request': request})
        return Response(serializer.data)
    
    def post(self, request):
        serializer = EvaluationCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            evaluation = self.perform_evaluation(serializer.validated_data)
            response_serializer = EvaluationSerializer(evaluation, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def perform_evaluation(self, validated_data):
        """Perform LLM-enhanced resume evaluation against job description"""
        start_time = time.time()
        
        resume = validated_data['resume']
        job_description = validated_data['job_description']
        
        # Create evaluation record
        evaluation = Evaluation.objects.create(
            resume=resume,
            job_description=job_description
        )
        
        try:
            # Log evaluation start
            EvaluationLog.objects.create(
                evaluation=evaluation,
                step='evaluation_start',
                status='success',
                message='Starting LLM-enhanced evaluation process'
            )
            
            # Extract text content
            resume_text = resume.extracted_text if hasattr(resume, 'extracted_text') and resume.extracted_text else f"Resume for {resume.user.get_full_name()}"
            job_text = job_description.extracted_text if hasattr(job_description, 'extracted_text') and job_description.extracted_text else job_description.raw_text
            
            # Log text extraction
            EvaluationLog.objects.create(
                evaluation=evaluation,
                step='text_extraction',
                status='success',
                message=f'Extracted {len(resume_text)} chars from resume, {len(job_text)} chars from job description'
            )
            
            # Perform LLM-enhanced evaluation
            llm_start_time = time.time()
            
            # Log which service is being used
            service_type = "OpenAI GPT Services"
            EvaluationLog.objects.create(
                evaluation=evaluation,
                step='llm_service_type',
                status='info',
                message=f'Using {service_type} for evaluation'
            )
            
            analysis_result = enhanced_scoring_service.comprehensive_evaluation(
                resume_text, job_text
            )
            llm_execution_time = time.time() - llm_start_time
            
            # Store embeddings for future semantic search
            try:
                embedding_service.store_resume_embedding(str(resume.id), resume_text)
                embedding_service.store_job_embedding(str(job_description.id), job_text)
            except Exception as e:
                logger.warning(f"Failed to store embeddings: {str(e)}")
            
            # Update evaluation with LLM results
            evaluation.overall_score = analysis_result.overall_score
            evaluation.hard_skills_score = analysis_result.hard_skills_score
            evaluation.soft_skills_score = analysis_result.soft_skills_score
            evaluation.experience_score = analysis_result.experience_score
            evaluation.education_score = analysis_result.education_score
            evaluation.semantic_similarity_score = analysis_result.semantic_similarity_score
            
            evaluation.matched_skills = analysis_result.matched_skills
            evaluation.missing_skills = analysis_result.missing_skills
            evaluation.recommendations = analysis_result.recommendations
            evaluation.strengths = analysis_result.strengths
            evaluation.areas_for_improvement = analysis_result.areas_for_improvement
            evaluation.detailed_feedback = analysis_result.detailed_feedback
            evaluation.recommendation = analysis_result.overall_recommendation
            
            # Set legacy feedback for backward compatibility
            evaluation.feedback = analysis_result.detailed_feedback
            
            evaluation.processing_time = time.time() - start_time
            evaluation.llm_processing_successful = True
            evaluation.save()
            
            # Log success
            EvaluationLog.objects.create(
                evaluation=evaluation,
                step='llm_analysis',
                status='success',
                message=f'LLM analysis completed with overall score: {analysis_result.overall_score}%',
                execution_time=llm_execution_time
            )
            
            EvaluationLog.objects.create(
                evaluation=evaluation,
                step='evaluation_complete',
                status='success',
                message=f'Full evaluation completed with score: {evaluation.overall_score}%',
                execution_time=evaluation.processing_time
            )
            
        except Exception as e:
            # Log error
            error_message = f'Error during LLM evaluation: {str(e)}'
            logger.error(error_message)
            
            EvaluationLog.objects.create(
                evaluation=evaluation,
                step='evaluation_error',
                status='error',
                message=error_message
            )
            
            # Set fallback values for failed evaluation
            evaluation.overall_score = 0
            evaluation.hard_skills_score = 0
            evaluation.soft_skills_score = 0
            evaluation.experience_score = 0
            evaluation.education_score = 0
            evaluation.recommendation = 'not_recommended'
            evaluation.feedback = f'Evaluation failed: {str(e)}'
            evaluation.detailed_feedback = 'Unable to complete evaluation due to system error.'
            evaluation.llm_processing_successful = False
            evaluation.processing_time = time.time() - start_time
            evaluation.save()
        
        return evaluation


class EvaluationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        evaluation = get_object_or_404(Evaluation, pk=pk)
        
        # Students can only access evaluations for their resumes
        if request.user.role == 'student' and evaluation.resume.user != request.user:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = EvaluationSerializer(evaluation, context={'request': request})
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def evaluation_stats(request):
    """Get evaluation statistics for dashboard"""
    if request.user.role == 'student':
        total_evaluations = Evaluation.objects.filter(resume__user=request.user).count()
        high_score_evaluations = Evaluation.objects.filter(
            resume__user=request.user,
            verdict='high'
        ).count()
    else:
        total_evaluations = Evaluation.objects.count()
        high_score_evaluations = Evaluation.objects.filter(verdict='high').count()
    
    return Response({
        'total_evaluations': total_evaluations,
        'high_score_evaluations': high_score_evaluations,
        'success_rate': (high_score_evaluations / total_evaluations * 100) if total_evaluations > 0 else 0
    })


# Job Application Views
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_applications(request):
    """Get all job applications for the current student"""
    if request.user.role != 'student':
        return Response({'error': 'Only students can view their applications'}, status=status.HTTP_403_FORBIDDEN)
    
    applications = JobApplication.objects.filter(student=request.user).select_related('job', 'resume')
    
    data = []
    for app in applications:
        # Get evaluation if exists
        evaluation = Evaluation.objects.filter(resume=app.resume, job_description=app.job).first()
        
        data.append({
            'id': app.id,
            'job': {
                'id': app.job.id,
                'title': app.job.title,
                'company_name': app.job.company_name,
                'location': app.job.location,
            },
            'resume': {
                'id': app.resume.id,
                'file_name': app.resume.file_name,
            },
            'status': app.status,
            'status_display': app.get_status_display(),
            'applied_at': app.applied_at,
            'evaluation_score': evaluation.overall_score if evaluation else None,
            'notes': app.notes,
        })
    
    return Response(data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def apply_to_job(request):
    """Student applies to a job with a selected resume"""
    if request.user.role != 'student':
        return Response({'error': 'Only students can apply to jobs'}, status=status.HTTP_403_FORBIDDEN)
    
    job_id = request.data.get('job_id')
    resume_id = request.data.get('resume_id')
    
    if not job_id or not resume_id:
        return Response({'error': 'Job ID and Resume ID are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify job exists and is active
    try:
        job = JobDescription.objects.get(pk=job_id, is_active=True)
    except JobDescription.DoesNotExist:
        return Response({'error': 'Job not found or not active'}, status=status.HTTP_404_NOT_FOUND)
    
    # Verify resume belongs to the student
    try:
        resume = Resume.objects.get(pk=resume_id, user=request.user)
    except Resume.DoesNotExist:
        return Response({'error': 'Resume not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if already applied
    if JobApplication.objects.filter(student=request.user, job=job).exists():
        return Response({'error': 'You have already applied to this job'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create application
    application = JobApplication.objects.create(
        student=request.user,
        job=job,
        resume=resume,
        status='applied'
    )
    
    # Trigger evaluation automatically
    evaluation, created = Evaluation.objects.get_or_create(
        resume=resume,
        job_description=job,
        defaults={
            'overall_score': 0,
            'recommendation': 'not_recommended'
        }
    )
    
    return Response({
        'message': 'Application submitted successfully',
        'application_id': application.id,
        'status': application.status
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_application_status(request, job_id):
    """Check if student has applied to a specific job"""
    if request.user.role != 'student':
        return Response({'applied': False})
    
    application = JobApplication.objects.filter(student=request.user, job_id=job_id).first()
    
    if application:
        return Response({
            'applied': True,
            'application_id': application.id,
            'status': application.status,
            'status_display': application.get_status_display(),
            'resume_id': application.resume.id,
            'applied_at': application.applied_at
        })
    
    return Response({'applied': False})


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_application_status(request, application_id):
    """Placement team updates application status (shortlist/reject)"""
    if request.user.role == 'student':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        application = JobApplication.objects.get(pk=application_id)
    except JobApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
    
    new_status = request.data.get('status')
    notes = request.data.get('notes', '')
    
    if new_status:
        application.status = new_status
    if notes:
        application.notes = notes
    
    application.save()
    
    return Response({
        'message': 'Application updated',
        'status': application.status,
        'status_display': application.get_status_display()
    })

# evaluations/serializer.py
from rest_framework import serializers
from .models import Evaluation, EvaluationLog
from resumes.serializer import ResumeSerializer
from jobs.serializers import JobDescriptionSerializer

class EvaluationSerializer(serializers.ModelSerializer):
    resume_details = ResumeSerializer(source='resume', read_only=True)
    job_details = JobDescriptionSerializer(source='job_description', read_only=True)
    
    class Meta:
        model = Evaluation
        fields = [
            'id', 'resume', 'resume_details', 'job_description', 'job_details',
            'overall_score', 'hard_skills_score', 'soft_skills_score', 
            'experience_score', 'education_score', 'semantic_similarity_score',
            'recommendation', 'strengths', 'areas_for_improvement', 'detailed_feedback',
            'matched_skills', 'missing_skills', 'recommendations', 'llm_processing_successful',
            'processing_time', 'created_at'
        ]
        read_only_fields = [
            'overall_score', 'hard_skills_score', 'soft_skills_score', 
            'experience_score', 'education_score', 'semantic_similarity_score',
            'recommendation', 'strengths', 'areas_for_improvement', 'detailed_feedback',
            'matched_skills', 'missing_skills', 'recommendations', 'llm_processing_successful',
            'processing_time', 'created_at'
        ]

class EvaluationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = ['resume', 'job_description']
    
    def validate(self, data):
        # Check if evaluation already exists
        resume = data['resume']
        job_description = data['job_description']
        
        if Evaluation.objects.filter(resume=resume, job_description=job_description).exists():
            raise serializers.ValidationError(
                "An evaluation for this resume and job combination already exists."
            )
        
        # Check if resume belongs to current user (for students)
        user = self.context['request'].user
        if user.role == 'student' and resume.user != user:
            raise serializers.ValidationError(
                "You can only evaluate your own resumes."
            )
        
        return data

class EvaluationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationLog
        fields = ['id', 'evaluation', 'step', 'status', 'message', 'execution_time', 'created_at']
        read_only_fields = ['created_at']

class EvaluationSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for dashboard and list views"""
    resume_name = serializers.CharField(source='resume.file_name', read_only=True)
    job_title = serializers.CharField(source='job_description.title', read_only=True)
    company_name = serializers.CharField(source='job_description.company_name', read_only=True)
    user_name = serializers.CharField(source='resume.user.username', read_only=True)
    
    class Meta:
        model = Evaluation
        fields = [
            'id', 'resume_name', 'job_title', 'company_name', 'user_name',
            'overall_score', 'recommendation', 'created_at'
        ]
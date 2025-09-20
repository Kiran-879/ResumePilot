# evaluations/models.py
from django.db import models
from django.contrib.auth import get_user_model
from resumes.models import Resume
from jobs.models import JobDescription

User = get_user_model()

class Evaluation(models.Model):
    VERDICT_CHOICES = [
        ('high', 'High Suitability'),
        ('medium', 'Medium Suitability'),
        ('low', 'Low Suitability'),
    ]
    
    RECOMMENDATION_CHOICES = [
        ('highly_recommended', 'Highly Recommended'),
        ('recommended', 'Recommended'),
        ('conditionally_recommended', 'Conditionally Recommended'),
        ('not_recommended', 'Not Recommended'),
    ]
    
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE)
    job_description = models.ForeignKey(JobDescription, on_delete=models.CASCADE)
    
    # LLM-Enhanced Scoring (0-100 scale)
    overall_score = models.IntegerField(default=0)
    hard_skills_score = models.IntegerField(default=0)
    soft_skills_score = models.IntegerField(default=0)
    experience_score = models.IntegerField(default=0)
    education_score = models.IntegerField(default=0)
    semantic_similarity_score = models.FloatField(default=0.0)  # 0-1 scale
    
    # Skills Analysis
    matched_skills = models.JSONField(default=list)
    missing_skills = models.JSONField(default=list)
    
    # LLM-Generated Analysis
    recommendations = models.JSONField(default=list)  # Specific improvement suggestions
    strengths = models.JSONField(default=list)  # Key strengths identified
    areas_for_improvement = models.JSONField(default=list)  # Areas to improve
    detailed_feedback = models.TextField(blank=True)  # Comprehensive feedback
    
    # Final Recommendation
    recommendation = models.CharField(
        max_length=30, 
        choices=RECOMMENDATION_CHOICES,
        default='not_recommended'
    )
    
    # Legacy fields for backward compatibility
    feedback = models.TextField(blank=True)
    
    # Processing metadata
    processing_time = models.FloatField(default=0.0)  # in seconds
    llm_processing_successful = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.resume.user.username} - {self.job_description.title} - {self.overall_score}%"

    class Meta:
        unique_together = ['resume', 'job_description']
        ordering = ['-overall_score', '-created_at']

    @property
    def recommendation_color(self):
        """Return color code for recommendation"""
        color_map = {
            'highly_recommended': 'success',
            'recommended': 'info', 
            'consider': 'warning',
            'not_recommended': 'error'
        }
        return color_map.get(self.recommendation, 'default')

class EvaluationLog(models.Model):
    """Track evaluation history and debugging"""
    evaluation = models.ForeignKey(Evaluation, on_delete=models.CASCADE)
    step = models.CharField(max_length=50)  # parsing, hard_match, soft_match, etc.
    status = models.CharField(max_length=20)  # success, error, warning
    message = models.TextField()
    execution_time = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.evaluation.id} - {self.step} - {self.status}"
# jobs/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class JobDescription(models.Model):
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    title = models.CharField(max_length=200)
    company_name = models.CharField(max_length=100)
    job_description_file = models.FileField(upload_to='job_descriptions/')
    raw_text = models.TextField(blank=True)  # Extracted text
    
    # Parsed fields
    role_title = models.CharField(max_length=200, blank=True)
    must_have_skills = models.JSONField(default=list)  # List of required skills
    good_to_have_skills = models.JSONField(default=list)  # List of preferred skills
    qualifications = models.JSONField(default=list)  # List of qualifications
    experience_required = models.CharField(max_length=50, blank=True)
    location = models.CharField(max_length=100, blank=True)
    
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.company_name}"

    class Meta:
        ordering = ['-created_at']
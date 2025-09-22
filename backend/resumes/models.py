# resumes/models.py
from django.db import models
from django.contrib.auth import get_user_model
from cloudinary_storage.storage import MediaCloudinaryStorage

User = get_user_model()

class Resume(models.Model):
    STATUS_CHOICES = [
        ('uploaded', 'Uploaded'),
        ('processing', 'Processing'),
        ('processed', 'Processed'),
        ('error', 'Error'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(
        upload_to='resumes/', 
        blank=True, 
        null=True,
        storage=MediaCloudinaryStorage()  # Explicitly use Cloudinary storage
    )
    firebase_filename = models.CharField(max_length=500, blank=True, null=True)  # Firebase path
    firebase_url = models.URLField(blank=True, null=True)  # Firebase public URL
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField()  # in bytes
    
    # Extracted content
    raw_text = models.TextField(blank=True)
    
    # Parsed sections
    personal_info = models.JSONField(default=dict)  # name, email, phone, etc.
    skills = models.JSONField(default=list)  # extracted skills
    experience = models.JSONField(default=list)  # work experience
    education = models.JSONField(default=list)  # education details
    projects = models.JSONField(default=list)  # projects
    certifications = models.JSONField(default=list)  # certifications
    
    processing_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='uploaded')
    error_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.file_name}"

    class Meta:
        ordering = ['-created_at']
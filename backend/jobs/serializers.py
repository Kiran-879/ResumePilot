# jobs/serializers.py
from rest_framework import serializers
from .models import JobDescription
from django.contrib.auth import get_user_model

User = get_user_model()

class JobDescriptionSerializer(serializers.ModelSerializer):
    uploaded_by_details = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = JobDescription
        fields = [
            'id', 'title', 'company_name', 'job_description_file', 'file_url',
            'raw_text', 'role_title', 'must_have_skills', 'good_to_have_skills',
            'qualifications', 'experience_required', 'location', 'priority',
            'uploaded_by', 'uploaded_by_details', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['uploaded_by', 'raw_text', 'role_title', 'must_have_skills',
                           'good_to_have_skills', 'qualifications', 'created_at', 'updated_at']

    def get_uploaded_by_details(self, obj):
        return {
            'id': obj.uploaded_by.id,
            'username': obj.uploaded_by.username,
            'email': obj.uploaded_by.email
        }
    
    def get_file_url(self, obj):
        if obj.job_description_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.job_description_file.url)
        return None

class JobDescriptionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobDescription
        fields = ['title', 'company_name', 'job_description_file', 'experience_required',
                 'location', 'priority']
    
    def validate_job_description_file(self, value):
        # Check file extension
        allowed_extensions = ['.pdf', '.doc', '.docx', '.txt']
        import os
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                "Only PDF, DOC, DOCX, and TXT files are allowed."
            )
        
        # Check file size (max 5MB)
        max_size = 5 * 1024 * 1024  # 5MB
        if value.size > max_size:
            raise serializers.ValidationError(
                "File size cannot exceed 5MB."
            )
        
        return value
    
    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        job = JobDescription.objects.create(**validated_data)
        # TODO: Trigger background processing task to extract text and parse
        return job

class JobDescriptionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobDescription
        fields = ['title', 'company_name', 'experience_required', 'location',
                 'priority', 'is_active', 'must_have_skills', 'good_to_have_skills',
                 'qualifications', 'role_title']
from rest_framework import serializers
from .models import JobDescription

class JobDescriptionSerializer(serializers.ModelSerializer):
    uploaded_by_username = serializers.CharField(source='uploaded_by.username', read_only=True)
    
    class Meta:
        model = JobDescription
        fields = '__all__'
        read_only_fields = ['uploaded_by', 'raw_text', 'role_title', 'must_have_skills', 
                           'good_to_have_skills', 'qualifications']

class JobDescriptionListSerializer(serializers.ModelSerializer):
    uploaded_by_username = serializers.CharField(source='uploaded_by.username', read_only=True)
    
    class Meta:
        model = JobDescription
        fields = ['id', 'title', 'company_name', 'priority', 'location', 
                 'uploaded_by_username', 'is_active', 'created_at']
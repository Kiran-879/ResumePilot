# resumes/serializer.py
from rest_framework import serializers
from .models import Resume
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']

class ResumeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_details = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Resume
        fields = [
            'id', 'user', 'user_details', 'file', 'file_url', 'file_name', 'file_size',
            'raw_text', 'personal_info', 'skills', 'experience', 'education',
            'projects', 'certifications', 'processing_status', 'error_message',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'file_name', 'file_size', 'raw_text', 'personal_info',
                           'skills', 'experience', 'education', 'projects', 'certifications',
                           'processing_status', 'error_message', 'created_at', 'updated_at']

    def get_user_details(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'role': obj.user.role
        }
    
    def get_file_url(self, obj):
        # Prioritize Firebase URL if available
        if obj.firebase_url:
            return obj.firebase_url
        # Fallback to local file URL
        elif obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None

class ResumeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['file']
    
    def validate_file(self, value):
        # Check file extension
        allowed_extensions = ['.pdf', '.doc', '.docx']
        import os
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                "Only PDF, DOC, and DOCX files are allowed."
            )
        
        # Check file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if value.size > max_size:
            raise serializers.ValidationError(
                "File size cannot exceed 10MB."
            )
        
        return value
    
    def create(self, validated_data):
        file = validated_data['file']
        validated_data['file_name'] = file.name
        validated_data['file_size'] = file.size
        validated_data['user'] = self.context['request'].user
        validated_data['processing_status'] = 'uploaded'
        
        resume = Resume.objects.create(**validated_data)
        # TODO: Trigger background processing task here
        return resume
from rest_framework import serializers
from .models import Resume

class ResumeUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['file']

class ResumeSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Resume
        fields = '__all__'
        read_only_fields = ['user', 'file_name', 'file_size', 'raw_text', 
                           'personal_info', 'skills', 'experience', 'education', 
                           'projects', 'certifications', 'processing_status', 'error_message']
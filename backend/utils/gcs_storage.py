# utils/gcs_storage.py
import os
import uuid
from django.conf import settings
from google.cloud import storage
import tempfile
import json

class GoogleCloudStorage:
    def __init__(self):
        self._client = None
        self._bucket = None
        self._initialized = False
        
    def _initialize(self):
        """Initialize Google Cloud Storage client if not already initialized"""
        if self._initialized:
            return True
            
        try:
            # Initialize GCS client
            if hasattr(settings, 'GCS_CREDENTIALS') and settings.GCS_CREDENTIALS:
                # Use JSON credentials
                self._client = storage.Client.from_service_account_info(
                    settings.GCS_CREDENTIALS,
                    project=settings.GCS_PROJECT_ID
                )
            elif hasattr(settings, 'GOOGLE_APPLICATION_CREDENTIALS'):
                # Use service account file
                self._client = storage.Client.from_service_account_json(
                    settings.GOOGLE_APPLICATION_CREDENTIALS,
                    project=settings.GCS_PROJECT_ID
                )
            else:
                # Use default credentials (if running on GCP)
                self._client = storage.Client(project=settings.GCS_PROJECT_ID)
            
            # Get bucket
            self._bucket = self._client.bucket(settings.GCS_BUCKET_NAME)
            self._initialized = True
            print(f"✅ Google Cloud Storage initialized: {settings.GCS_BUCKET_NAME}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to initialize Google Cloud Storage: {str(e)}")
            return False
    
    def upload_file(self, file_obj, filename):
        """Upload a file to Google Cloud Storage"""
        if not self._initialize():
            return None
            
        try:
            # Create a unique filename
            file_extension = os.path.splitext(filename)[1]
            unique_filename = f"resumes/{uuid.uuid4()}{file_extension}"
            
            # Create a blob in the bucket
            blob = self._bucket.blob(unique_filename)
            
            # Upload file
            file_obj.seek(0)  # Reset file pointer
            blob.upload_from_file(file_obj, content_type='application/pdf')
            
            # Make the blob publicly accessible
            blob.make_public()
            
            return {
                'filename': unique_filename,
                'url': blob.public_url,
                'size': blob.size
            }
        except Exception as e:
            print(f"❌ Error uploading file to GCS: {str(e)}")
            return None
    
    def delete_file(self, filename):
        """Delete a file from Google Cloud Storage"""
        if not self._initialize():
            return False
            
        try:
            blob = self._bucket.blob(filename)
            blob.delete()
            print(f"✅ File deleted from GCS: {filename}")
            return True
        except Exception as e:
            print(f"❌ Error deleting file from GCS: {str(e)}")
            return False
    
    def get_file_url(self, filename):
        """Get public URL for a file"""
        if not self._initialize():
            return None
            
        try:
            blob = self._bucket.blob(filename)
            return blob.public_url
        except Exception as e:
            print(f"❌ Error getting file URL from GCS: {str(e)}")
            return None
    
    def download_file(self, filename):
        """Download a file from Google Cloud Storage to temporary file"""
        if not self._initialize():
            return None
            
        try:
            blob = self._bucket.blob(filename)
            
            # Create a temporary file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
            blob.download_to_filename(temp_file.name)
            
            print(f"✅ File downloaded from GCS: {filename}")
            return temp_file.name
        except Exception as e:
            print(f"❌ Error downloading file from GCS: {str(e)}")
            return None
    
    def file_exists(self, filename):
        """Check if a file exists in Google Cloud Storage"""
        if not self._initialize():
            return False
            
        try:
            blob = self._bucket.blob(filename)
            return blob.exists()
        except Exception as e:
            print(f"❌ Error checking file existence in GCS: {str(e)}")
            return False

# Create a global instance
gcs_storage = GoogleCloudStorage()
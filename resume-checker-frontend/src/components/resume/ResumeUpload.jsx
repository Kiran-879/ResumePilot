// src/components/resume/ResumeUpload.jsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Grid
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { resumeService } from '../../services/resumeServices';

const ResumeUpload = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 
                           'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a PDF, DOC, or DOCX file.');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await resumeService.uploadResume(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset form
      setSelectedFile(null);
      setUploading(false);
      
      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(response);
      }

      // Reset progress after success
      setTimeout(() => setUploadProgress(0), 1000);

    } catch (err) {
      setUploading(false);
      setUploadProgress(0);
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 4, 
        textAlign: 'center',
        border: '2px dashed #e0e0e0',
        '&:hover': {
          border: '2px dashed #1976d2',
          backgroundColor: '#f8f9fa'
        }
      }}
    >
      <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      
      <Typography variant="h6" gutterBottom>
        Upload Your Resume
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Supported formats: PDF, DOC, DOCX (Max 10MB)
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <input
        accept=".pdf,.doc,.docx"
        style={{ display: 'none' }}
        id="resume-upload"
        type="file"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      
      <label htmlFor="resume-upload">
        <Button
          variant="outlined"
          component="span"
          disabled={uploading}
          sx={{ mr: 2 }}
        >
          Choose File
        </Button>
      </label>

      {selectedFile && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {selectedFile.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(selectedFile.size)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={uploading}
                fullWidth
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            {uploadProgress}% complete
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ResumeUpload;
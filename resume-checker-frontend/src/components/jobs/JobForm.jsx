// src/components/jobs/JobForm.jsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { jobService } from '../../services/jobServices';

const JobForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    experience_required: '',
    location: '',
    priority: 'medium',
    job_description_file: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 
                           'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                           'text/plain'];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a PDF, DOC, DOCX, or TXT file.');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB.');
        return;
      }

      setFormData(prev => ({
        ...prev,
        job_description_file: file
      }));
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title || !formData.company_name || !formData.job_description_file) {
        setError('Please fill in all required fields and upload a job description file.');
        setLoading(false);
        return;
      }

      const response = await jobService.createJob(formData);
      
      // Reset form
      setFormData({
        title: '',
        company_name: '',
        experience_required: '',
        location: '',
        priority: 'medium',
        job_description_file: null
      });

      // Reset file input
      const fileInput = document.getElementById('job-file-upload');
      if (fileInput) {
        fileInput.value = '';
      }

      if (onSuccess) {
        onSuccess(response);
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create job. Please try again.');
    } finally {
      setLoading(false);
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
    <Paper elevation={2} sx={{ p: 4 }}>
      <Typography variant="h6" gutterBottom>
        Create New Job Posting
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="title"
              label="Job Title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              name="company_name"
              label="Company Name"
              value={formData.company_name}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              name="experience_required"
              label="Experience Required"
              value={formData.experience_required}
              onChange={handleChange}
              fullWidth
              placeholder="e.g., 2-4 years"
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              name="location"
              label="Location"
              value={formData.location}
              onChange={handleChange}
              fullWidth
              placeholder="e.g., Remote, New York, NY"
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                label="Priority"
                disabled={loading}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Box
              sx={{
                border: '2px dashed #e0e0e0',
                borderRadius: 1,
                p: 3,
                textAlign: 'center',
                '&:hover': {
                  border: '2px dashed #1976d2',
                  backgroundColor: '#f8f9fa'
                }
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              
              <Typography variant="body1" gutterBottom>
                Job Description File *
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Supported formats: PDF, DOC, DOCX, TXT (Max 5MB)
              </Typography>

              <input
                accept=".pdf,.doc,.docx,.txt"
                style={{ display: 'none' }}
                id="job-file-upload"
                type="file"
                onChange={handleFileChange}
                disabled={loading}
              />
              
              <label htmlFor="job-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  disabled={loading}
                >
                  Choose File
                </Button>
              </label>

              {formData.job_description_file && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {formData.job_description_file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(formData.job_description_file.size)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => {
                  setFormData({
                    title: '',
                    company_name: '',
                    experience_required: '',
                    location: '',
                    priority: 'medium',
                    job_description_file: null
                  });
                  const fileInput = document.getElementById('job-file-upload');
                  if (fileInput) {
                    fileInput.value = '';
                  }
                }}
                disabled={loading}
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Job'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default JobForm;
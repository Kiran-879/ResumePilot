// src/components/resume/ResumeList.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { resumeService } from '../../services/resumeServices';
import { toast } from 'react-toastify';

const ResumeList = ({ refreshTrigger }) => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, resume: null });

  useEffect(() => {
    loadResumes();
  }, [refreshTrigger]);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const data = await resumeService.getResumes();
      // Ensure data is an array
      setResumes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading resumes:', error);
      toast.error('Failed to load resumes');
      setResumes([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resume) => {
    setDeleteDialog({ open: false, resume: null });
    
    try {
      await resumeService.deleteResume(resume.id);
      setResumes(resumes.filter(r => r.id !== resume.id));
      toast.success('Resume deleted successfully');
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'processed':
        return 'Processed';
      case 'processing':
        return 'Processing';
      case 'error':
        return 'Error';
      case 'uploaded':
        return 'Uploaded';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (resumes.length === 0) {
    return (
      <Alert severity="info">
        No resumes uploaded yet. Upload your first resume to get started.
      </Alert>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {resumes.map((resume) => (
          <Grid item xs={12} md={6} key={resume.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="div" noWrap>
                    {resume.file_name}
                  </Typography>
                  <Chip
                    label={getStatusLabel(resume.processing_status)}
                    color={getStatusColor(resume.processing_status)}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Size: {formatFileSize(resume.file_size)}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Uploaded: {formatDate(resume.created_at)}
                </Typography>

                {resume.skills && resume.skills.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Skills Found:</strong>
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {resume.skills.slice(0, 5).map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                      {resume.skills.length > 5 && (
                        <Chip
                          label={`+${resume.skills.length - 5} more`}
                          variant="outlined"
                          size="small"
                          color="primary"
                        />
                      )}
                    </Box>
                  </Box>
                )}

                {resume.processing_status === 'error' && resume.error_message && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      {resume.error_message}
                    </Typography>
                  </Alert>
                )}
              </CardContent>

              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => window.open(resume.file_url, '_blank')}
                  title="View Resume"
                >
                  <ViewIcon />
                </IconButton>
                
                <IconButton
                  size="small"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = resume.file_url;
                    link.download = resume.file_name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  title="Download Resume"
                >
                  <DownloadIcon />
                </IconButton>

                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setDeleteDialog({ open: true, resume })}
                  title="Delete Resume"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, resume: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.resume?.file_name}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, resume: null })}>
            Cancel
          </Button>
          <Button
            onClick={() => handleDelete(deleteDialog.resume)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResumeList;
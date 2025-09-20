// src/components/evaluations/EvaluationTrigger.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  LinearProgress,
  Grid
} from '@mui/material';
import { PlayArrow as PlayIcon } from '@mui/icons-material';
import { resumeService } from '../../services/resumeServices';
import { jobService } from '../../services/jobServices';
import { evaluationService } from '../../services/evaluationServices';

const EvaluationTrigger = ({ onEvaluationComplete }) => {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resumesData, jobsData] = await Promise.all([
        resumeService.getResumes(),
        jobService.getJobs()
      ]);

      setResumes(Array.isArray(resumesData) ? resumesData : []);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
      setResumes([]);
      setJobs([]);
    }
  };

  const handleEvaluate = async () => {
    if (!selectedResume || !selectedJob) {
      setError('Please select both a resume and a job to evaluate.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await evaluationService.evaluateResume(selectedResume, selectedJob);
      
      setSuccess(`Evaluation completed! Score: ${result.overall_score}%`);
      
      // Reset form
      setSelectedResume('');
      setSelectedJob('');

      // Notify parent component
      if (onEvaluationComplete) {
        onEvaluationComplete(result);
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Evaluation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Run Evaluation
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        Select a resume and job description to perform automated matching and evaluation.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Resume</InputLabel>
            <Select
              value={selectedResume}
              label="Select Resume"
              onChange={(e) => setSelectedResume(e.target.value)}
              disabled={loading}
            >
              {resumes.map((resume) => (
                <MenuItem key={resume.id} value={resume.id}>
                  {resume.user.first_name} {resume.user.last_name} - {resume.user.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Job</InputLabel>
            <Select
              value={selectedJob}
              label="Select Job"
              onChange={(e) => setSelectedJob(e.target.value)}
              disabled={loading}
            >
              {jobs.map((job) => (
                <MenuItem key={job.id} value={job.id}>
                  {job.title} - {job.company_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={<PlayIcon />}
              onClick={handleEvaluate}
              disabled={loading || !selectedResume || !selectedJob}
              size="large"
            >
              {loading ? 'Evaluating...' : 'Run Evaluation'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {(resumes.length === 0 || jobs.length === 0) && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {resumes.length === 0 && jobs.length === 0
            ? 'You need to upload resumes and create job postings before running evaluations.'
            : resumes.length === 0
            ? 'You need to upload some resumes before running evaluations.'
            : 'You need to create some job postings before running evaluations.'
          }
        </Alert>
      )}
    </Paper>
  );
};

export default EvaluationTrigger;
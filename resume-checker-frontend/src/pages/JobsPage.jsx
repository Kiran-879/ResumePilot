// src/pages/JobsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
  Snackbar
} from '@mui/material';
import JobForm from '../components/jobs/JobForm';
import JobList from '../components/jobs/JobList';
import { jobService } from '../services/jobServices';
import { useAuth } from '../context/AuthContext';

const JobsPage = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const [activeTab, setActiveTab] = useState(isStudent ? 0 : 0);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await jobService.getJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError(err.response?.data?.error || 'Failed to load jobs. Please try again.');
      setJobs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleJobCreated = (newJob) => {
    setJobs(prev => [newJob, ...prev]);
    setSnackbar({
      open: true,
      message: 'Job created successfully!',
      severity: 'success'
    });
    setActiveTab(1); // Switch to list tab
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`jobs-tabpanel-${index}`}
      aria-labelledby={`jobs-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );

  const a11yProps = (index) => ({
    id: `jobs-tab-${index}`,
    'aria-controls': `jobs-tabpanel-${index}`,
  });

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {isStudent ? 'Available Jobs' : 'Job Management'}
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" paragraph>
        {isStudent 
          ? 'Browse job openings and check how well your resume matches'
          : 'Manage job postings for resume evaluation and matching'
        }
      </Typography>

      {isStudent ? (
        // Student View - Just show job list
        <Box sx={{ mt: 2 }}>
          <JobList 
            jobs={jobs}
            loading={loading}
            error={error}
            onRefresh={loadJobs}
            isStudentView={true}
          />
        </Box>
      ) : (
        // Placement Team View - Full management
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="job management tabs"
            >
              <Tab label="Create Job" {...a11yProps(0)} />
              <Tab label={`All Jobs (${jobs?.length || 0})`} {...a11yProps(1)} />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <JobForm onSuccess={handleJobCreated} />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <JobList 
              jobs={jobs}
              loading={loading}
              error={error}
              onRefresh={loadJobs}
            />
          </TabPanel>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JobsPage;
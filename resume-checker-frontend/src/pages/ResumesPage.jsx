// src/pages/ResumesPage.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert
} from '@mui/material';
import ResumeUpload from '../components/resume/ResumeUpload';
import ResumeList from '../components/resume/ResumeList';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ResumesPage = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const isPlacementTeam = user?.role === 'placement_team' || user?.role === 'admin';
  const [tabValue, setTabValue] = useState(isPlacementTeam ? 0 : 0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleUploadSuccess = (resume) => {
    toast.success(`Resume "${resume.file_name}" uploaded successfully!`);
    setRefreshTrigger(prev => prev + 1);
    setTabValue(isPlacementTeam ? 0 : 1); // Switch to list tab
  };

  // Placement Team View - Only show student resumes, no upload
  if (isPlacementTeam) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Student Resumes
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          View all student resumes. Students upload their own resumes and you can view evaluations from the Jobs page.
        </Typography>

        <Paper elevation={1} sx={{ p: 3 }}>
          <ResumeList refreshTrigger={refreshTrigger} />
        </Paper>
      </Box>
    );
  }

  // Student View - Upload and view own resumes
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Resume
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        Upload and manage your resume to apply for job opportunities
      </Typography>

      <Paper elevation={1}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Upload Resume" />
          <Tab label="My Resumes" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <ResumeUpload onUploadSuccess={handleUploadSuccess} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ResumeList refreshTrigger={refreshTrigger} />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ResumesPage;
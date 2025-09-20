// src/pages/ResumesPage.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import ResumeUpload from '../components/resume/ResumeUpload';
import ResumeList from '../components/resume/ResumeList';
import { toast } from 'react-toastify';

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
  const [tabValue, setTabValue] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleUploadSuccess = (resume) => {
    toast.success(`Resume "${resume.file_name}" uploaded successfully!`);
    setRefreshTrigger(prev => prev + 1);
    setTabValue(1); // Switch to list tab
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Resume Management
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
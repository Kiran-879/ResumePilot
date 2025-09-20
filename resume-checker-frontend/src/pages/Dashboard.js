// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Button,
  Chip
} from '@mui/material';
import {
  Description as ResumeIcon,
  Work as JobIcon,
  Assessment as EvaluationIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { resumeService } from '../services/resumeServices';
import { jobService } from '../services/jobServices';
import { evaluationService } from '../services/evaluationServices';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    resumes: 0,
    jobs: 0,
    evaluations: 0,
    averageScore: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all data in parallel
      const [resumesRes, jobsRes, evaluationsRes] = await Promise.all([
        resumeService.getResumes(),
        jobService.getJobs(),
        evaluationService.getEvaluations()
      ]);

      const resumes = resumesRes.data || [];
      const jobs = jobsRes.data || [];
      const evaluations = evaluationsRes.data || [];

      // Calculate stats
      const averageScore = evaluations.length > 0
        ? Math.round(evaluations.reduce((sum, evaluation) => sum + evaluation.overall_score, 0) / evaluations.length)
        : 0;

      setStats({
        resumes: resumes.length,
        jobs: jobs.length,
        evaluations: evaluations.length,
        averageScore
      });

      // Prepare recent activity
      const activity = [
        ...resumes.slice(0, 3).map(resume => ({
          type: 'resume',
          title: `Resume uploaded by ${resume.user.first_name} ${resume.user.last_name}`,
          date: resume.created_at,
          icon: <ResumeIcon />,
          color: 'primary'
        })),
        ...jobs.slice(0, 3).map(job => ({
          type: 'job',
          title: `Job posted: ${job.title} at ${job.company_name}`,
          date: job.created_at,
          icon: <JobIcon />,
          color: 'secondary'
        })),
        ...evaluations.slice(0, 3).map(evaluation => ({
          type: 'evaluation',
          title: `Evaluation completed (${evaluation.overall_score}% match)`,
          date: evaluation.created_at,
          icon: <EvaluationIcon />,
          color: 'info'
        }))
      ];

      // Sort by date and take top 5
      activity.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentActivity(activity.slice(0, 5));

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatCard = ({ title, value, icon, color = 'primary', onClick }) => (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 4 } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h3" color={`${color}.main`} fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Box sx={{ color: `${color}.main`, opacity: 0.7 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.username}!
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Here's an overview of your resume checking system
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Resumes"
            value={stats.resumes}
            icon={<ResumeIcon sx={{ fontSize: 40 }} />}
            color="primary"
            onClick={() => navigate('/resumes')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Job Postings"
            value={stats.jobs}
            icon={<JobIcon sx={{ fontSize: 40 }} />}
            color="secondary"
            onClick={() => navigate('/jobs')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Evaluations"
            value={stats.evaluations}
            icon={<EvaluationIcon sx={{ fontSize: 40 }} />}
            color="info"
            onClick={() => navigate('/evaluations')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Score"
            value={`${stats.averageScore}%`}
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Activity</Typography>
              <Button size="small" onClick={() => navigate('/evaluations')}>
                View All
              </Button>
            </Box>
            
            {recentActivity.length > 0 ? (
              <List dense>
                {recentActivity.map((activity, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {activity.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.title}
                      secondary={formatDate(activity.date)}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                No recent activity
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<ResumeIcon />}
                  onClick={() => navigate('/resumes')}
                >
                  Upload Resume
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<JobIcon />}
                  onClick={() => navigate('/jobs')}
                >
                  Create Job Posting
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  fullWidth
                  startIcon={<EvaluationIcon />}
                  onClick={() => navigate('/evaluations')}
                >
                  View Evaluations
                </Button>
              </Grid>
            </Grid>

            {user?.role && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Role:
                </Typography>
                <Chip 
                  label={user.role.replace('_', ' ').toUpperCase()} 
                  size="small" 
                  color="primary" 
                />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
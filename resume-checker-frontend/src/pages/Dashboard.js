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
  Chip,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Description as ResumeIcon,
  Work as JobIcon,
  Assessment as EvaluationIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { resumeService } from '../services/resumeServices';
import { jobService } from '../services/jobServices';
import { evaluationService } from '../services/evaluationServices';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStudent = user?.role === 'student';
  const [stats, setStats] = useState({
    resumes: 0,
    jobs: 0,
    evaluations: 0,
    averageScore: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestEvaluation, setLatestEvaluation] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      console.log('🔍 Loading dashboard data...');

      // Load all data in parallel
      const [resumesRes, jobsRes, evaluationsRes] = await Promise.all([
        resumeService.getResumes().catch(err => {
          console.error('❌ Failed to load resumes:', err);
          return { data: [] };
        }),
        jobService.getJobs().catch(err => {
          console.error('❌ Failed to load jobs:', err);
          return { data: [] };
        }),
        evaluationService.getEvaluations().catch(err => {
          console.error('❌ Failed to load evaluations:', err);
          return { data: [] };
        })
      ]);

      console.log('📊 API Responses:', {
        resumes: resumesRes,
        jobs: jobsRes,
        evaluations: evaluationsRes
      });

      // Handle different response structures
      const resumes = Array.isArray(resumesRes) ? resumesRes : (resumesRes.data || resumesRes.results || []);
      const jobs = Array.isArray(jobsRes) ? jobsRes : (jobsRes.data || jobsRes.results || []);
      const evaluations = Array.isArray(evaluationsRes) ? evaluationsRes : (evaluationsRes.data || evaluationsRes.results || []);

      console.log('📈 Processed data:', {
        resumes: resumes.length,
        jobs: jobs.length,
        evaluations: evaluations.length
      });

      // Calculate stats
      const averageScore = evaluations.length > 0
        ? Math.round(evaluations.reduce((sum, evaluation) => sum + (evaluation.overall_score || 0), 0) / evaluations.length)
        : 0;

      const newStats = {
        resumes: resumes.length,
        jobs: jobs.length,
        evaluations: evaluations.length,
        averageScore
      };

      console.log('📊 New stats:', newStats);
      setStats(newStats);

      // Store latest evaluation for students
      if (evaluations.length > 0) {
        const sortedEvals = [...evaluations].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setLatestEvaluation(sortedEvals[0]);
      }

      // Prepare recent activity
      const activity = [
        ...resumes.slice(0, 3).map(resume => ({
          type: 'resume',
          title: `Resume uploaded: ${resume.file_name || 'Unknown file'}`,
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

  // Student Dashboard - Simplified View
  if (isStudent) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Welcome, {user?.username}! 👋
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Track your resume and job applications
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            onClick={loadDashboardData}
            disabled={loading}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Resume Status Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <ResumeIcon color="primary" />
                  <Typography variant="h6">My Resume</Typography>
                </Box>
                
                {stats.resumes > 0 ? (
                  <Box>
                    <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>
                      You have {stats.resumes} resume{stats.resumes > 1 ? 's' : ''} uploaded
                    </Alert>
                    <Button 
                      variant="contained" 
                      fullWidth
                      onClick={() => navigate('/resumes')}
                    >
                      View My Resumes
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
                      No resume uploaded yet
                    </Alert>
                    <Button 
                      variant="contained" 
                      color="primary"
                      fullWidth
                      onClick={() => navigate('/resumes')}
                    >
                      Upload Resume
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Score Overview Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <TrendingUpIcon color="success" />
                  <Typography variant="h6">My Score</Typography>
                </Box>
                
                {stats.evaluations > 0 ? (
                  <Box textAlign="center">
                    <Typography variant="h2" color={stats.averageScore >= 70 ? 'success.main' : stats.averageScore >= 50 ? 'warning.main' : 'error.main'}>
                      {stats.averageScore}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Average Match Score
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.averageScore} 
                      color={stats.averageScore >= 70 ? 'success' : stats.averageScore >= 50 ? 'warning' : 'error'}
                      sx={{ height: 10, borderRadius: 5, mb: 2 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Based on {stats.evaluations} evaluation{stats.evaluations > 1 ? 's' : ''}
                    </Typography>
                  </Box>
                ) : (
                  <Box textAlign="center" py={2}>
                    <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                      No evaluations yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Upload a resume and apply for jobs to see your match scores
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Available Jobs */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <JobIcon color="secondary" />
                    <Typography variant="h6">Available Jobs</Typography>
                  </Box>
                  <Chip label={stats.jobs} color="secondary" size="small" />
                </Box>
                
                {stats.jobs > 0 ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Browse available job openings and check your resume match
                    </Typography>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      onClick={() => navigate('/jobs')}
                    >
                      Browse Jobs
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                    No job postings available right now
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Evaluations */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <EvaluationIcon color="info" />
                    <Typography variant="h6">My Evaluations</Typography>
                  </Box>
                  <Chip label={stats.evaluations} color="info" size="small" />
                </Box>
                
                {latestEvaluation ? (
                  <Box>
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Latest Evaluation
                      </Typography>
                      <Typography variant="h4" color="primary.main">
                        {latestEvaluation.overall_score}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(latestEvaluation.created_at)}
                      </Typography>
                    </Paper>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      onClick={() => navigate('/evaluations')}
                    >
                      View All Evaluations
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                    Complete job applications to see evaluations
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Tips for Students */}
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 3, bgcolor: 'primary.50' }}>
              <Typography variant="h6" gutterBottom>
                💡 Tips to Improve Your Score
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2">
                    ✅ Keep your resume updated with latest skills
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2">
                    ✅ Match keywords from job descriptions
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2">
                    ✅ Highlight relevant projects and experience
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Placement Team / Admin Dashboard - Full View

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.username}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Here's an overview of your resume checking system
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          onClick={loadDashboardData}
          disabled={loading}
          startIcon={<RefreshIcon />}
        >
          Refresh Data
        </Button>
      </Box>

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
                  variant="contained" 
                  fullWidth
                  color="secondary"
                  startIcon={<JobIcon />}
                  onClick={() => navigate('/jobs')}
                >
                  Create Job Posting
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<ResumeIcon />}
                  onClick={() => navigate('/resumes')}
                >
                  View Student Resumes
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<EvaluationIcon />}
                  onClick={() => navigate('/evaluations')}
                >
                  View All Evaluations
                </Button>
              </Grid>
            </Grid>

            <Box mt={3} p={2} bgcolor="info.50" borderRadius={1}>
              <Typography variant="body2" color="text.secondary">
                💡 <strong>Tip:</strong> Click on "Matched" button in Jobs page to see top candidates for each position
              </Typography>
            </Box>

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
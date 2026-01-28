// src/pages/EvaluationsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  LinearProgress,
  Button,
  Collapse,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  WorkOutline as WorkIcon,
  EmojiEvents as TrophyIcon,
  Info as InfoIcon,
  Visibility as ShowIcon,
  VisibilityOff as HideIcon,
  CheckCircle as ShortlistedIcon,
  Cancel as RejectedIcon,
  HourglassEmpty as PendingIcon,
  Star as SelectedIcon
} from '@mui/icons-material';
import EvaluationList from '../components/evaluations/EvaluationList';
import { evaluationService } from '../services/evaluationServices';
import { useAuth } from '../context/AuthContext';

const EvaluationsPage = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const isPlacementTeam = user?.role === 'placement_team' || user?.role === 'admin';
  const [evaluations, setEvaluations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showEvaluations, setShowEvaluations] = useState(false);

  useEffect(() => {
    loadEvaluations();
    if (isStudent) {
      loadApplications();
    }
  }, [isStudent]);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await evaluationService.getEvaluations();
      setEvaluations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading evaluations:', err);
      setError(err.response?.data?.error || 'Failed to load evaluations. Please try again.');
      setEvaluations([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const data = await evaluationService.getMyApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading applications:', err);
    }
  };

  const handleEvaluationComplete = (newEvaluation) => {
    setEvaluations(prev => [newEvaluation, ...prev]);
    setSnackbar({
      open: true,
      message: 'Evaluation completed successfully!',
      severity: 'success'
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      'applied': { color: 'info', icon: <PendingIcon />, label: 'Applied' },
      'under_review': { color: 'warning', icon: <PendingIcon />, label: 'Under Review' },
      'shortlisted': { color: 'success', icon: <ShortlistedIcon />, label: 'Shortlisted' },
      'rejected': { color: 'error', icon: <RejectedIcon />, label: 'Rejected' },
      'interview': { color: 'primary', icon: <ShortlistedIcon />, label: 'Interview Scheduled' },
      'selected': { color: 'success', icon: <SelectedIcon />, label: 'Selected' },
    };
    const config = statusConfig[status] || statusConfig['applied'];
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  };

  // Calculate statistics
  const statistics = {
    total: evaluations?.length || 0,
    averageScore: evaluations?.length > 0 
      ? Math.round(evaluations.reduce((sum, evaluation) => sum + (evaluation.overall_score || 0), 0) / evaluations.length)
      : 0,
    highlyRecommended: evaluations?.filter(evaluation => evaluation.recommendation === 'highly_recommended').length || 0,
    recommended: evaluations?.filter(evaluation => evaluation.recommendation === 'recommended').length || 0,
    consider: evaluations?.filter(evaluation => evaluation.recommendation === 'consider').length || 0,
    notRecommended: evaluations?.filter(evaluation => evaluation.recommendation === 'not_recommended').length || 0
  };

  // Application statistics for students
  const applicationStats = {
    total: applications.length,
    shortlisted: applications.filter(a => a.status === 'shortlisted' || a.status === 'interview' || a.status === 'selected').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    pending: applications.filter(a => a.status === 'applied' || a.status === 'under_review').length,
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" color={`${color}.main`} fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
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

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {isStudent ? 'My Evaluations' : 'Evaluation Results'}
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" paragraph>
        {isStudent 
          ? 'View how well your resume matches job requirements'
          : 'View and analyze resume evaluation results and matching scores'
        }
      </Typography>

      {/* Student Simplified View */}
      {isStudent ? (
        <>
          {/* Score Overview for Student */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrophyIcon sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h3" color="primary.main" fontWeight="bold">
                    {statistics.averageScore}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your Average Score
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={statistics.averageScore} 
                    color={statistics.averageScore >= 70 ? 'success' : statistics.averageScore >= 50 ? 'warning' : 'error'}
                    sx={{ height: 8, borderRadius: 4, mt: 2 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AssessmentIcon sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
                  <Typography variant="h3" color="info.main" fontWeight="bold">
                    {statistics.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Evaluations
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUpIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="h3" color="success.main" fontWeight="bold">
                    {statistics.highlyRecommended + statistics.recommended}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Good Matches
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* My Applications Section */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon color="primary" />
              My Job Applications
            </Typography>
            
            {/* Application Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                    <Typography variant="h4" color="info.main">{applicationStats.total}</Typography>
                    <Typography variant="caption" color="text.secondary">Total Applied</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                    <Typography variant="h4" color="warning.main">{applicationStats.pending}</Typography>
                    <Typography variant="caption" color="text.secondary">Pending</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                    <Typography variant="h4" color="success.main">{applicationStats.shortlisted}</Typography>
                    <Typography variant="caption" color="text.secondary">Shortlisted</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                    <Typography variant="h4" color="error.main">{applicationStats.rejected}</Typography>
                    <Typography variant="caption" color="text.secondary">Rejected</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Applications Table */}
            {applications.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Job Title</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Resume Used</TableCell>
                      <TableCell align="center">Match Score</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell>Applied On</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2">{app.job.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {app.job.location}
                          </Typography>
                        </TableCell>
                        <TableCell>{app.job.company_name}</TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                            {app.resume.file_name}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {app.evaluation_score !== null ? (
                            <Chip
                              label={`${app.evaluation_score}%`}
                              size="small"
                              color={
                                app.evaluation_score >= 70 ? 'success' :
                                app.evaluation_score >= 50 ? 'warning' : 'error'
                              }
                            />
                          ) : (
                            <Chip label="Pending" size="small" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {getStatusChip(app.status)}
                        </TableCell>
                        <TableCell>
                          {new Date(app.applied_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                You haven't applied to any jobs yet. Go to the Jobs page to browse and apply!
              </Alert>
            )}
          </Paper>

          {/* Evaluation List for Student */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Evaluation History
            </Typography>
            
            <EvaluationList 
              evaluations={evaluations}
              loading={loading}
              error={error}
              onRefresh={loadEvaluations}
              isStudentView={true}
            />
          </Paper>
        </>
      ) : (
        <>
          {/* Statistics Cards - Placement Team View */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Evaluations"
                value={statistics.total}
                icon={<AssessmentIcon sx={{ fontSize: 40 }} />}
                color="primary"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Average Score"
                value={`${statistics.averageScore}%`}
                icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
                color="info"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Highly Recommended"
                value={statistics.highlyRecommended}
                icon={<PeopleIcon sx={{ fontSize: 40 }} />}
                color="success"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Not Recommended"
                value={statistics.notRecommended}
                icon={<WorkIcon sx={{ fontSize: 40 }} />}
                color="error"
              />
            </Grid>
          </Grid>

          {/* Recommendation Breakdown */}
          {(evaluations?.length || 0) > 0 && (
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Recommendation Breakdown
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h5" color="success.main" fontWeight="bold">
                      {statistics.highlyRecommended}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Highly Recommended
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h5" color="info.main" fontWeight="bold">
                      {statistics.recommended}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Recommended
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h5" color="warning.main" fontWeight="bold">
                      {statistics.consider}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Consider
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h5" color="error.main" fontWeight="bold">
                      {statistics.notRecommended}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Not Recommended
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Info for Placement Team */}
          <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>How it works:</strong> Students upload their resumes and evaluations are created when they apply for jobs. 
              View matched candidates per job from the <strong>Jobs</strong> page by clicking on the "Matched" button.
            </Typography>
          </Alert>

          {/* Evaluations List with Show/Hide Toggle */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                All Evaluations ({evaluations?.length || 0})
              </Typography>
              <Button
                variant={showEvaluations ? "outlined" : "contained"}
                color="primary"
                startIcon={showEvaluations ? <HideIcon /> : <ShowIcon />}
                onClick={() => setShowEvaluations(!showEvaluations)}
              >
                {showEvaluations ? 'Hide Evaluations' : 'Show Evaluations'}
              </Button>
            </Box>
            
            {!showEvaluations && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Click "Show Evaluations" to view all individual evaluation details.
              </Alert>
            )}
            
            <Collapse in={showEvaluations}>
              <EvaluationList 
                evaluations={evaluations}
                loading={loading}
                error={error}
                onRefresh={loadEvaluations}
              />
            </Collapse>
          </Paper>
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

export default EvaluationsPage;
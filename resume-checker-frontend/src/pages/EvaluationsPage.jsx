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
  Snackbar
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  WorkOutline as WorkIcon
} from '@mui/icons-material';
import EvaluationList from '../components/evaluations/EvaluationList';
import EvaluationTrigger from '../components/evaluations/EvaluationTrigger';
import { evaluationService } from '../services/evaluationServices';

const EvaluationsPage = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadEvaluations();
  }, []);

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
        Evaluation Results
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" paragraph>
        View and analyze resume evaluation results and matching scores
      </Typography>

      {/* Statistics Cards */}
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

      {/* Evaluation Trigger */}
      <EvaluationTrigger onEvaluationComplete={handleEvaluationComplete} />

      {/* Evaluations List */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          All Evaluations
        </Typography>
        
        <EvaluationList 
          evaluations={evaluations}
          loading={loading}
          error={error}
          onRefresh={loadEvaluations}
        />
      </Paper>

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
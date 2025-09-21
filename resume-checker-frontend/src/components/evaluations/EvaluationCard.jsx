// src/components/evaluations/EvaluationCard.jsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  LinearProgress,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Grid
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledLinearProgress = styled(LinearProgress)(({ theme, color }) => ({
  height: 8,
  borderRadius: 5,
  [`&.MuiLinearProgress-colorPrimary`]: {
    backgroundColor: theme.palette.grey[200],
  },
  [`& .MuiLinearProgress-barColorPrimary`]: {
    borderRadius: 5,
    backgroundColor: color === 'success' ? theme.palette.success.main :
                   color === 'warning' ? theme.palette.warning.main :
                   color === 'error' ? theme.palette.error.main :
                   theme.palette.primary.main,
  },
}));

const EvaluationCard = ({ evaluation, onDownloadReport }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Helper function to get person's name from resume
  const getPersonName = (evaluation) => {
    // Use resume_details from the evaluation (contains full resume data)
    const resume = evaluation?.resume_details;
    
    // Priority: extracted name from resume > user first/last name > username
    if (resume?.personal_info?.name) {
      return resume.personal_info.name;
    }
    
    const firstName = resume?.user?.first_name || '';
    const lastName = resume?.user?.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    return fullName || resume?.user?.username || 'Unknown User';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'highly_recommended':
        return 'success';
      case 'recommended':
        return 'info';
      case 'consider':
        return 'warning';
      case 'not_recommended':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatRecommendation = (recommendation) => {
    return recommendation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

  const parseJsonField = (jsonString) => {
    try {
      return JSON.parse(jsonString || '[]');
    } catch {
      return [];
    }
  };

  const matchedSkills = parseJsonField(evaluation.matched_skills);
  const missingSkills = parseJsonField(evaluation.missing_skills);

  return (
    <Card elevation={2} sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Typography variant="h6" gutterBottom>
              {getPersonName(evaluation)}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {evaluation.job_details?.title || evaluation.job_description?.title} at {evaluation.job_details?.company_name || evaluation.job_description?.company_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Evaluated on {formatDate(evaluation.created_at)}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={formatRecommendation(evaluation.recommendation)}
              color={getRecommendationColor(evaluation.recommendation)}
              size="small"
            />
          </Box>
        </Box>

        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} sm={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
              <AssessmentIcon color="primary" sx={{ mb: 1 }} />
              <Typography variant="h4" color={getScoreColor(evaluation.overall_score)}>
                {evaluation.overall_score}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Overall Score
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={9}>
            <Grid container spacing={1}>
              <Grid item xs={6} md={3}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Hard Skills
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Box flexGrow={1} mr={1}>
                      <StyledLinearProgress
                        variant="determinate"
                        value={evaluation.hard_skills_score || 0}
                        color={getScoreColor(evaluation.hard_skills_score || 0)}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {evaluation.hard_skills_score || 0}%
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={6} md={3}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Soft Skills
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Box flexGrow={1} mr={1}>
                      <StyledLinearProgress
                        variant="determinate"
                        value={evaluation.soft_skills_score || 0}
                        color={getScoreColor(evaluation.soft_skills_score || 0)}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {evaluation.soft_skills_score || 0}%
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={6} md={3}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Experience
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Box flexGrow={1} mr={1}>
                      <StyledLinearProgress
                        variant="determinate"
                        value={evaluation.experience_score || 0}
                        color={getScoreColor(evaluation.experience_score || 0)}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {evaluation.experience_score || 0}%
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={6} md={3}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Education
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Box flexGrow={1} mr={1}>
                      <StyledLinearProgress
                        variant="determinate"
                        value={evaluation.education_score || 0}
                        color={getScoreColor(evaluation.education_score || 0)}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {evaluation.education_score || 0}%
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Enhanced LLM Feedback */}
        {(evaluation.detailed_feedback || evaluation.strengths || evaluation.areas_for_improvement) && (
          <Box mb={2}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              🤖 AI-Powered Analysis
            </Typography>
            
            {evaluation.detailed_feedback && (
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Detailed Feedback:
                </Typography>
                <Typography variant="body2" sx={{ 
                  backgroundColor: 'rgba(25, 118, 210, 0.08)', 
                  p: 2, 
                  borderRadius: 1,
                  border: '1px solid rgba(25, 118, 210, 0.12)'
                }}>
                  {evaluation.detailed_feedback}
                </Typography>
              </Box>
            )}

            <Grid container spacing={2}>
              {evaluation.strengths && parseJsonField(evaluation.strengths).length > 0 && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="success.main" gutterBottom sx={{ fontWeight: 'medium' }}>
                    ✅ Key Strengths:
                  </Typography>
                  <List dense>
                    {parseJsonField(evaluation.strengths).map((strength, index) => (
                      <ListItem key={index} sx={{ pl: 0, py: 0.5 }}>
                        <ListItemText
                          primary={`• ${strength}`}
                          sx={{ 
                            '& .MuiListItemText-primary': { 
                              fontSize: '0.875rem',
                              color: 'text.primary'
                            } 
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )}

              {evaluation.areas_for_improvement && parseJsonField(evaluation.areas_for_improvement).length > 0 && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="warning.main" gutterBottom sx={{ fontWeight: 'medium' }}>
                    🔄 Areas for Improvement:
                  </Typography>
                  <List dense>
                    {parseJsonField(evaluation.areas_for_improvement).map((area, index) => (
                      <ListItem key={index} sx={{ pl: 0, py: 0.5 }}>
                        <ListItemText
                          primary={`• ${area}`}
                          sx={{ 
                            '& .MuiListItemText-primary': { 
                              fontSize: '0.875rem',
                              color: 'text.primary'
                            } 
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Legacy Feedback (for backward compatibility) */}
        {evaluation.feedback && !evaluation.detailed_feedback && (
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Feedback Summary:
            </Typography>
            <Typography variant="body2">
              {evaluation.feedback}
            </Typography>
          </Box>
        )}
      </CardContent>

      <CardActions>
        <Button
          size="small"
          onClick={handleExpandClick}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {expanded ? 'Hide Details' : 'Show Details'}
        </Button>

        <Button
          size="small"
          startIcon={<DownloadIcon />}
          onClick={() => {
            console.log('Download button clicked for evaluation:', evaluation.id);
            console.log('onDownloadReport function:', onDownloadReport);
            if (onDownloadReport) {
              onDownloadReport(evaluation.id);
            } else {
              console.error('onDownloadReport function not provided');
            }
          }}
        >
          Download Report
        </Button>
      </CardActions>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            {/* Matched Skills */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom color="success.main">
                Matched Skills ({matchedSkills.length})
              </Typography>
              {matchedSkills.length > 0 ? (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {matchedSkills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No matched skills found
                </Typography>
              )}
            </Grid>

            {/* Missing Skills */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom color="error.main">
                Missing Skills ({missingSkills.length})
              </Typography>
              {missingSkills.length > 0 ? (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {missingSkills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No missing skills identified
                </Typography>
              )}
            </Grid>

            {/* AI Recommendations */}
            {evaluation.recommendations && parseJsonField(evaluation.recommendations).length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                  🚀 AI-Generated Recommendations
                </Typography>
                <List dense>
                  {parseJsonField(evaluation.recommendations).map((recommendation, index) => (
                    <ListItem key={index} sx={{ pl: 0, alignItems: 'flex-start' }}>
                      <Box
                        sx={{
                          minWidth: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          mr: 1,
                          mt: 0.25
                        }}
                      >
                        {index + 1}
                      </Box>
                      <ListItemText
                        primary={recommendation}
                        sx={{ 
                          '& .MuiListItemText-primary': { 
                            fontSize: '0.875rem',
                            lineHeight: 1.4
                          } 
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}

            {/* Semantic Similarity Score */}
            {evaluation.semantic_similarity_score !== undefined && (
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    🔗 Semantic Match Score
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Box flexGrow={1} mr={1}>
                      <StyledLinearProgress
                        variant="determinate"
                        value={evaluation.semantic_similarity_score * 100}
                        color={getScoreColor(evaluation.semantic_similarity_score * 100)}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {(evaluation.semantic_similarity_score * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Measures how well the resume content matches the job requirements using advanced AI analysis
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* Job and Resume Details */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">Resume Details</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Candidate:</strong> {getPersonName(evaluation)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email: {evaluation.resume_details?.personal_info?.email || 
                           evaluation.resume_details?.user_details?.email || 
                           evaluation.resume_details?.user?.email || 'Not available'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uploaded: {formatDate(evaluation.resume_details?.created_at)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <WorkIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">Job Details</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Experience: {evaluation.job_details?.experience_required || evaluation.job_description?.experience_required || 'Not specified'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Location: {evaluation.job_details?.location || evaluation.job_description?.location || 'Not specified'}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default EvaluationCard;
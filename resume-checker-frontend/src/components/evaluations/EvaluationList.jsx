// src/components/evaluations/EvaluationList.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Pagination,
  Alert,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import EvaluationCard from './EvaluationCard';
import { generateEvaluationReport } from '../../utils/reportGenerator';

const EvaluationList = ({ evaluations, loading, error, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRecommendation, setFilterRecommendation] = useState('');
  const [sortBy, setSortBy] = useState('created_at_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter evaluations
  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch = searchTerm === '' || 
      evaluation.resume.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.resume.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.job_description.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.job_description.company_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRecommendation = filterRecommendation === '' || 
      evaluation.recommendation === filterRecommendation;

    return matchesSearch && matchesRecommendation;
  });

  // Sort evaluations
  const sortedEvaluations = [...filteredEvaluations].sort((a, b) => {
    switch (sortBy) {
      case 'created_at_desc':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'created_at_asc':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'score_desc':
        return b.overall_score - a.overall_score;
      case 'score_asc':
        return a.overall_score - b.overall_score;
      case 'name_asc':
        return `${a.resume.user.first_name} ${a.resume.user.last_name}`.localeCompare(
          `${b.resume.user.first_name} ${b.resume.user.last_name}`
        );
      case 'job_asc':
        return a.job_description.title.localeCompare(b.job_description.title);
      default:
        return 0;
    }
  });

  // Paginate evaluations
  const totalPages = Math.ceil(sortedEvaluations.length / itemsPerPage);
  const paginatedEvaluations = sortedEvaluations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleDownloadReport = (evaluationId) => {
    try {
      console.log('Download report clicked for evaluation:', evaluationId);
      
      // Find the evaluation by ID
      const evaluation = evaluations.find(evaluation => evaluation.id === evaluationId);
      
      if (!evaluation) {
        console.error('Evaluation not found:', evaluationId);
        alert('Evaluation not found. Please try refreshing the page.');
        return;
      }
      
      console.log('Generating PDF report for:', evaluation);
      // Generate and download PDF report
      generateEvaluationReport(evaluation);
      
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Failed to generate report: ' + error.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Filters and Search */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search by name, job, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Filter by Recommendation</InputLabel>
            <Select
              value={filterRecommendation}
              label="Filter by Recommendation"
              onChange={(e) => setFilterRecommendation(e.target.value)}
            >
              <MenuItem value="">All Recommendations</MenuItem>
              <MenuItem value="highly_recommended">Highly Recommended</MenuItem>
              <MenuItem value="recommended">Recommended</MenuItem>
              <MenuItem value="consider">Consider</MenuItem>
              <MenuItem value="not_recommended">Not Recommended</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="created_at_desc">Newest First</MenuItem>
              <MenuItem value="created_at_asc">Oldest First</MenuItem>
              <MenuItem value="score_desc">Highest Score</MenuItem>
              <MenuItem value="score_asc">Lowest Score</MenuItem>
              <MenuItem value="name_asc">Name A-Z</MenuItem>
              <MenuItem value="job_asc">Job Title A-Z</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Results Summary */}
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Showing {paginatedEvaluations.length} of {filteredEvaluations.length} evaluations
        {searchTerm || filterRecommendation ? ' (filtered)' : ''}
      </Typography>

      {/* Evaluation Cards */}
      {filteredEvaluations.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No evaluations found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || filterRecommendation 
              ? 'Try adjusting your search or filter criteria.'
              : 'Evaluations will appear here once resumes are matched with job descriptions.'
            }
          </Typography>
        </Box>
      ) : (
        <>
          {paginatedEvaluations.map((evaluation) => (
            <EvaluationCard
              key={evaluation.id}
              evaluation={evaluation}
              onDownloadReport={handleDownloadReport}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default EvaluationList;
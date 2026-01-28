// src/components/jobs/JobList.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Chip,
  Tooltip,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Stack,
  ButtonGroup,
  FormControl,
  InputLabel,
  Select,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  FileDownload as ExcelIcon,
  CheckCircle as MatchedIcon,
  Group as AppliedIcon,
  Star as StarIcon,
  Send as ApplyIcon,
  CheckCircleOutline as AppliedCheckIcon
} from '@mui/icons-material';
import { jobService } from '../../services/jobServices';
import { evaluationService } from '../../services/evaluationServices';
import { resumeService } from '../../services/resumeServices';

const JobList = ({ jobs, loading, error, onRefresh, isStudentView = false }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  // State for matched candidates dialog
  const [candidatesDialog, setCandidatesDialog] = useState(false);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [matchedCandidates, setMatchedCandidates] = useState(null);
  
  // State for first round shortlisting
  const [shortlistCount, setShortlistCount] = useState('');
  const [shortlistRound, setShortlistRound] = useState('First Round');
  
  // State for student apply feature
  const [applyDialog, setApplyDialog] = useState(false);
  const [applyingJob, setApplyingJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applicationStatuses, setApplicationStatuses] = useState({});
  
  // Load student's resumes and application statuses
  useEffect(() => {
    if (isStudentView) {
      loadStudentData();
    }
  }, [isStudentView, jobs]);
  
  const loadStudentData = async () => {
    try {
      // Load student's resumes
      const resumeData = await resumeService.getResumes();
      setResumes(Array.isArray(resumeData) ? resumeData : []);
      
      // Check application status for each job
      const statuses = {};
      for (const job of jobs) {
        try {
          const status = await evaluationService.checkApplicationStatus(job.id);
          statuses[job.id] = status;
        } catch (e) {
          statuses[job.id] = { applied: false };
        }
      }
      setApplicationStatuses(statuses);
    } catch (err) {
      console.error('Error loading student data:', err);
    }
  };
  
  const handleApplyClick = (job) => {
    setApplyingJob(job);
    setSelectedResume('');
    setApplyDialog(true);
  };
  
  const handleApplySubmit = async () => {
    if (!selectedResume || !applyingJob) return;
    
    setApplyLoading(true);
    try {
      await evaluationService.applyToJob(applyingJob.id, selectedResume);
      setApplyDialog(false);
      // Update application status
      setApplicationStatuses(prev => ({
        ...prev,
        [applyingJob.id]: { applied: true, status: 'applied', status_display: 'Applied' }
      }));
      alert('Application submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setApplyLoading(false);
    }
  };

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.experience_required?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate jobs
  const paginatedJobs = filteredJobs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event, job) => {
    setAnchorEl(event.currentTarget);
    setSelectedJob(job);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedJob(null);
  };

  const handleDelete = async () => {
    if (!selectedJob) return;

    setDeleteLoading(true);
    try {
      await jobService.deleteJob(selectedJob.id);
      handleMenuClose();
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete job:', error);
      // Handle error (could show a snackbar)
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewDetails = () => {
    if (!selectedJob) return;
    // Implementation for viewing job details
    console.log('View job details:', selectedJob.id);
    handleMenuClose();
  };

  const handleEdit = () => {
    if (!selectedJob) return;
    // Implementation for editing job
    console.log('Edit job:', selectedJob.id);
    handleMenuClose();
  };

  const handleDownloadFile = async () => {
    if (!selectedJob || !selectedJob.job_description_file) return;

    try {
      const response = await jobService.downloadJobFile(selectedJob.id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedJob.title}_job_description.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
    handleMenuClose();
  };

  // View matched candidates
  const handleViewCandidates = async (job) => {
    setCandidatesDialog(true);
    setCandidatesLoading(true);
    try {
      const data = await jobService.getMatchedCandidates(job.id);
      setMatchedCandidates(data);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    } finally {
      setCandidatesLoading(false);
    }
    handleMenuClose();
  };

  const handleCloseCandidatesDialog = () => {
    setCandidatesDialog(false);
    setMatchedCandidates(null);
  };

  // Export to Excel
  const handleExportExcel = async (job, type = 'all', limit = null, roundName = null) => {
    setExportLoading(true);
    try {
      const minScore = type === 'matched' || type === 'shortlist' ? 50 : 0;
      const blob = await jobService.exportCandidatesExcel(job.id, type, minScore, limit, roundName);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      let filename;
      if (type === 'shortlist' && roundName) {
        filename = `${job.title.replace(/\s+/g, '_')}_${roundName.replace(/\s+/g, '_')}_shortlist.xlsx`;
      } else {
        filename = `${job.title.replace(/\s+/g, '_')}_${type}_candidates.xlsx`;
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export Excel:', error);
    } finally {
      setExportLoading(false);
    }
  };
  
  const handleShortlistExport = () => {
    if (!shortlistCount || !matchedCandidates?.job) return;
    handleExportExcel(matchedCandidates.job, 'shortlist', parseInt(shortlistCount), shortlistRound);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'warning';
    return 'error';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
    <Paper elevation={2}>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Job Postings ({filteredJobs.length})
          </Typography>
          
          <TextField
            placeholder="Search jobs..."
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
            sx={{ minWidth: 250 }}
          />
        </Box>

        {filteredJobs.length === 0 ? (
          <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
            No jobs found
          </Typography>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Job Title</TableCell>
                    <TableCell>Company</TableCell>
                    {!isStudentView && <TableCell align="center">Positions</TableCell>}
                    {!isStudentView && <TableCell align="center">Applied</TableCell>}
                    {!isStudentView && <TableCell align="center">Matched (50%+)</TableCell>}
                    <TableCell>Priority</TableCell>
                    {!isStudentView && <TableCell align="center">Export</TableCell>}
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedJobs.map((job) => (
                    <TableRow key={job.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {job.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {job.location || 'Location not specified'} • {job.experience_required || 'Exp not specified'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {job.company_name}
                        </Typography>
                      </TableCell>
                      
                      {!isStudentView && (
                        <TableCell align="center">
                          <Chip
                            label={job.positions_required || 1}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                      )}

                      {!isStudentView && (
                        <TableCell align="center">
                          <Tooltip title="Total students who applied">
                            <Chip
                              icon={<AppliedIcon />}
                              label={job.applied_candidates_count || 0}
                              size="small"
                              color="info"
                              variant="outlined"
                            />
                          </Tooltip>
                        </TableCell>
                      )}
                      
                      {!isStudentView && (
                        <TableCell align="center">
                          <Tooltip title="Click to view matched candidates">
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<MatchedIcon />}
                              onClick={() => handleViewCandidates(job)}
                            >
                              {job.matched_candidates_count || 0}
                            </Button>
                          </Tooltip>
                        </TableCell>
                      )}
                      
                      <TableCell>
                        <Chip
                          label={job.priority}
                          size="small"
                          color={getPriorityColor(job.priority)}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>

                      {!isStudentView && (
                        <TableCell align="center">
                          <Tooltip title="Export candidates to Excel">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleExportExcel(job, 'all')}
                              disabled={exportLoading || (job.applied_candidates_count || 0) === 0}
                            >
                              <ExcelIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                      
                      <TableCell align="center">
                        {isStudentView ? (
                          applicationStatuses[job.id]?.applied ? (
                            <Chip
                              icon={<AppliedCheckIcon />}
                              label={applicationStatuses[job.id]?.status_display || 'Applied'}
                              color={
                                applicationStatuses[job.id]?.status === 'shortlisted' ? 'success' :
                                applicationStatuses[job.id]?.status === 'rejected' ? 'error' :
                                applicationStatuses[job.id]?.status === 'selected' ? 'success' :
                                'info'
                              }
                              variant="filled"
                            />
                          ) : (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              startIcon={<ApplyIcon />}
                              onClick={() => handleApplyClick(job)}
                              disabled={resumes.length === 0}
                            >
                              Apply
                            </Button>
                          )
                        ) : (
                          <Tooltip title="More options">
                            <IconButton
                              onClick={(e) => handleMenuOpen(e, job)}
                              size="small"
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredJobs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        
        {selectedJob?.job_description_file && (
          <MenuItem onClick={handleDownloadFile}>
            <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
            Download File
          </MenuItem>
        )}
        
        <MenuItem onClick={handleDelete} disabled={deleteLoading}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          {deleteLoading ? 'Deleting...' : 'Delete'}
        </MenuItem>
      </Menu>

      {/* Matched Candidates Dialog */}
      <Dialog
        open={candidatesDialog}
        onClose={handleCloseCandidatesDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">
                Matched Candidates
              </Typography>
              {matchedCandidates?.job && (
                <Typography variant="body2" color="text.secondary">
                  {matchedCandidates.job.title} at {matchedCandidates.job.company_name}
                </Typography>
              )}
            </Box>
            <IconButton onClick={handleCloseCandidatesDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {candidatesLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : matchedCandidates ? (
            <Box>
              {/* Summary Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="primary.main">
                        {matchedCandidates.job?.positions_required || 1}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Positions Required
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="info.main">
                        {matchedCandidates.total_candidates}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Applicants
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="success.main">
                        {matchedCandidates.candidates?.filter(c => c.overall_score >= 70).length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        High Match (70%+)
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* First Round Shortlisting Section */}
              {matchedCandidates.candidates?.length > 0 && (
                <Card variant="outlined" sx={{ mb: 3, bgcolor: 'primary.50', border: '2px solid', borderColor: 'primary.main' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StarIcon color="primary" />
                      First Round Shortlisting
                    </Typography>
                    
                    {/* Alert when matched students are less than required */}
                    {matchedCandidates.candidates.length < (matchedCandidates.job?.positions_required || 1) && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>Note:</strong> Only {matchedCandidates.candidates.length} matched candidate(s) available, 
                          but {matchedCandidates.job?.positions_required || 1} position(s) required. 
                          All matched candidates will be shortlisted.
                        </Typography>
                      </Alert>
                    )}
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Enter the number of students to shortlist for the interview. Top candidates will be selected based on their match scores.
                    </Typography>
                    
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Round Name"
                          value={shortlistRound}
                          onChange={(e) => setShortlistRound(e.target.value)}
                          size="small"
                          placeholder="e.g., First Round, Technical Round"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Number of Students to Shortlist"
                          type="number"
                          value={shortlistCount}
                          onChange={(e) => {
                            // Auto-limit to available candidates
                            const maxAvailable = matchedCandidates.candidates.length;
                            const value = parseInt(e.target.value) || 0;
                            setShortlistCount(value > maxAvailable ? maxAvailable.toString() : e.target.value);
                          }}
                          size="small"
                          inputProps={{ min: 1, max: matchedCandidates.candidates.length }}
                          placeholder={`Max: ${matchedCandidates.candidates.length}`}
                          helperText={
                            shortlistCount 
                              ? `Top ${Math.min(parseInt(shortlistCount) || 0, matchedCandidates.candidates.length)} candidates will be shortlisted` 
                              : `${matchedCandidates.candidates.length} candidates available`
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Stack direction="column" spacing={1}>
                          <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            startIcon={<ExcelIcon />}
                            onClick={handleShortlistExport}
                            disabled={!shortlistCount || exportLoading}
                            size="small"
                          >
                            {exportLoading ? 'Exporting...' : 'Export Shortlist'}
                          </Button>
                          <Button
                            fullWidth
                            variant="outlined"
                            color="secondary"
                            size="small"
                            onClick={() => setShortlistCount(matchedCandidates.candidates.length.toString())}
                          >
                            Select All ({matchedCandidates.candidates.length})
                          </Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Candidates List */}
              {matchedCandidates.candidates?.length > 0 ? (
                <List>
                  {matchedCandidates.candidates.map((candidate, index) => (
                    <React.Fragment key={candidate.id}>
                      <ListItem
                        sx={{
                          borderRadius: 1,
                          mb: 1
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1">
                              {candidate.resume?.user_details?.username || 'Unknown Student'}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {candidate.resume?.file_name || 'Resume'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Recommendation: {candidate.recommendation?.replace('_', ' ')}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < matchedCandidates.candidates.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No candidates have applied yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Students need to upload their resumes and evaluations will be performed automatically
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Alert severity="error">Failed to load candidates</Alert>
          )}
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'space-between', px: 3 }}>
          <Box>
            {matchedCandidates?.candidates?.length > 0 && (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<ExcelIcon />}
                  onClick={() => matchedCandidates?.job && handleExportExcel(matchedCandidates.job, 'all')}
                  disabled={exportLoading}
                  size="small"
                >
                  Export All to Excel
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ExcelIcon />}
                  onClick={() => matchedCandidates?.job && handleExportExcel(matchedCandidates.job, 'matched')}
                  disabled={exportLoading}
                  size="small"
                >
                  Export Matched (50%+)
                </Button>
              </Stack>
            )}
          </Box>
          <Button onClick={handleCloseCandidatesDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Apply to Job Dialog - For Students */}
      <Dialog
        open={applyDialog}
        onClose={() => setApplyDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">Apply for Job</Typography>
              {applyingJob && (
                <Typography variant="body2" color="text.secondary">
                  {applyingJob.title} at {applyingJob.company_name}
                </Typography>
              )}
            </Box>
            <IconButton onClick={() => setApplyDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {resumes.length === 0 ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You don't have any resumes uploaded. Please upload a resume first before applying.
            </Alert>
          ) : (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Select the resume you want to submit for this job:
              </Typography>
              
              <RadioGroup
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
              >
                {resumes.map((resume) => (
                  <Card 
                    key={resume.id} 
                    variant="outlined" 
                    sx={{ 
                      mb: 1, 
                      cursor: 'pointer',
                      border: selectedResume === String(resume.id) ? '2px solid' : '1px solid',
                      borderColor: selectedResume === String(resume.id) ? 'primary.main' : 'divider',
                      bgcolor: selectedResume === String(resume.id) ? 'primary.50' : 'transparent'
                    }}
                    onClick={() => setSelectedResume(String(resume.id))}
                  >
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box display="flex" alignItems="center">
                        <FormControlLabel
                          value={String(resume.id)}
                          control={<Radio />}
                          label=""
                          sx={{ mr: 0 }}
                        />
                        <Box flex={1}>
                          <Typography variant="subtitle2">
                            {resume.file_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Uploaded: {new Date(resume.uploaded_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </RadioGroup>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setApplyDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ApplyIcon />}
            onClick={handleApplySubmit}
            disabled={!selectedResume || applyLoading}
          >
            {applyLoading ? 'Submitting...' : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default JobList;
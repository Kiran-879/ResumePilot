// src/components/jobs/JobList.jsx
import React, { useState } from 'react';
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
  CircularProgress
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { jobService } from '../../services/jobServices';

const JobList = ({ jobs, loading, error, onRefresh }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
                    <TableCell>Experience</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Created Date</TableCell>
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
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {job.company_name}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {job.experience_required || 'Not specified'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {job.location || 'Not specified'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={job.priority}
                          size="small"
                          color={getPriorityColor(job.priority)}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(job.created_at)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Tooltip title="More options">
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, job)}
                            size="small"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
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
    </Paper>
  );
};

export default JobList;
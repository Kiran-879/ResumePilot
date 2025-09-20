// src/services/jobServices.js
import api from './api';

export const jobService = {
  createJob: async (jobData) => {
    const formData = new FormData();
    Object.keys(jobData).forEach(key => {
      formData.append(key, jobData[key]);
    });
    
    const response = await api.post('/jobs/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getJobs: async () => {
    const response = await api.get('/jobs/');
    return response.data;
  },

  getJobById: async (id) => {
    const response = await api.get(`/jobs/${id}/`);
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const formData = new FormData();
    Object.keys(jobData).forEach(key => {
      if (jobData[key] !== null) {
        formData.append(key, jobData[key]);
      }
    });

    const response = await api.patch(`/jobs/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}/`);
    return response.data;
  },

  downloadJobFile: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/download/`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
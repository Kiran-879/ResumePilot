// src/services/evaluationServices.js
import api from './api';

export const evaluationService = {
  evaluateResume: async (resumeId, jobId) => {
    const response = await api.post('/evaluations/', {
      resume: resumeId,
      job_description: jobId
    });
    return response.data;
  },

  getEvaluations: async (filters = {}) => {
    const response = await api.get('/evaluations/', { params: filters });
    return response.data;
  },

  getEvaluationById: async (id) => {
    const response = await api.get(`/evaluations/${id}/`);
    return response.data;
  },

  downloadReport: async (evaluationId) => {
    const response = await api.get(`/evaluations/${evaluationId}/download/`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Job Application Services
  getMyApplications: async () => {
    const response = await api.get('/evaluations/applications/');
    return response.data;
  },

  applyToJob: async (jobId, resumeId) => {
    const response = await api.post('/evaluations/applications/apply/', {
      job_id: jobId,
      resume_id: resumeId
    });
    return response.data;
  },

  checkApplicationStatus: async (jobId) => {
    const response = await api.get(`/evaluations/applications/check/${jobId}/`);
    return response.data;
  },

  updateApplicationStatus: async (applicationId, status, notes = '') => {
    const response = await api.patch(`/evaluations/applications/${applicationId}/update/`, {
      status,
      notes
    });
    return response.data;
  }
};
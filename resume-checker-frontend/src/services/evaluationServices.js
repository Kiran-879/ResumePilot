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
  }
};
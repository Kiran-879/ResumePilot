// src/services/resumeServices.js
import api from './api';

export const resumeService = {
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/resumes/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getResumes: async () => {
    const response = await api.get('/resumes/');
    return response.data;
  },

  getResumeById: async (id) => {
    const response = await api.get(`/resumes/${id}/`);
    return response.data;
  },

  updateResume: async (id, resumeData) => {
    const formData = new FormData();
    Object.keys(resumeData).forEach(key => {
      if (resumeData[key] !== null) {
        formData.append(key, resumeData[key]);
      }
    });

    const response = await api.patch(`/resumes/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteResume: async (id) => {
    const response = await api.delete(`/resumes/${id}/`);
    return response.data;
  },

  downloadResumeFile: async (resumeId) => {
    const response = await api.get(`/resumes/${resumeId}/download/`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
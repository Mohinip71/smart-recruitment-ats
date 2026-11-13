import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


export const getCandidateApplications = () => api.get('/candidate/profile');
export const updateCandidateProfile = (data) => api.put('/candidate/profile', data);


export const scheduleInterview = (data) => api.post('/interviews', data);
export const updateInterview = (id, data) => api.put(`/interviews/${id}`, data);
export const submitFeedback = (id, data) => api.post(`/interviews/${id}/feedback`, data);


export const createOffer = (data) => api.post('/offers', data);
export const updateOfferStatus = (id, status) => api.patch(`/offers/${id}/status`, { status });


export const getHiringAnalytics = () => api.get('/analytics');

export default api;
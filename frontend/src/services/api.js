import axios from 'axios';

// Base API URL.
// - Development (CRA dev server, NODE_ENV=development): call the backend cross-origin.
// - Production build (NODE_ENV=production): same-origin "/api" because the backend
//   serves the built frontend, so the auth cookie stays same-site.
// - Override either case with REACT_APP_API_URL (e.g. for a split-origin deploy).
const API_BASE_URL = process.env.REACT_APP_API_URL
  || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send the httpOnly auth cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ---------------------------- Auth ---------------------------- */

export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');

/* ---------------------------- Jobs ---------------------------- */

export const getJobs = () => api.get('/jobs');
export const getJob = (id) => api.get(`/jobs/${id}`);
export const createJob = (data) => api.post('/jobs', data);
export const publishJob = (id) => api.patch(`/jobs/${id}/publish`);
export const closeJob = (id) => api.patch(`/jobs/${id}/close`);

/* ------------------------- Applications ----------------------- */

export const getMyApplications = () => api.get('/applications/my');
export const applyToJob = (jobId) => api.post('/applications', { jobId });
export const getApplicationsByJob = (jobId) =>
  api.get(`/applications/job/${jobId}`);
export const updateApplicationStatus = (applicationId, status) =>
  api.patch(`/applications/${applicationId}/status`, { status });

/* ----------------------- Candidate profile -------------------- */

// GET /profile/me  -> { message, profile }
export const getCandidateProfile = () => api.get('/profile/me');
// PUT /profile/me  body { phone, location, bio, skills }
export const updateCandidateProfile = (data) => api.put('/profile/me', data);

/* -------------------------- Interviews ------------------------ */

// POST /interviews  body { applicationId, scheduledAt, type, meetingLink, location, notes }
export const scheduleInterview = (data) => api.post('/interviews', data);
export const getMyInterviews = () => api.get('/interviews/my');
export const getInterviewsByJob = (jobId) =>
  api.get(`/interviews/job/${jobId}`);
export const updateInterviewStatus = (id, status) =>
  api.patch(`/interviews/${id}/status`, { status });

/* ---------------------------- Offers ------------------------- */

// POST /offers  body { applicationId, salary, joiningDate, expiryDate, notes }
export const createOffer = (data) => api.post('/offers', data);
export const getMyOffers = () => api.get('/offers/my');
export const updateOfferStatus = (id, status) =>
  api.patch(`/offers/${id}/status`, { status });

/* ------------------------ Analytics --------------------------- */

// GET /analytics/dashboard -> { message, dashboard: {...} }
export const getHiringAnalytics = () => api.get('/analytics/dashboard');

/* ---------------------- Notifications ------------------------- */

export const getMyNotifications = () => api.get('/notifications/my');
export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`);

/* ------------------------- Onboarding ------------------------- */

export const getMyOnboarding = () => api.get('/onboarding/my');

export default api;

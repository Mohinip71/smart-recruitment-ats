import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Jobs from './pages/candidate/Jobs';
import ApplicationHistory from './pages/candidate/ApplicationHistory';
import CandidateProfile from './pages/candidate/CandidateProfile';
import MyOffers from './pages/candidate/MyOffers';
import JobManagement from './pages/hr/JobManagement';
import Interviewmanagement from './pages/hr/Interviewmanagement';
import OfferManagement from './pages/hr/OfferManagement';
import AnalyticsDashboard from './pages/hr/AnalyticsDashboard';
import './App.css';

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const linkStyle = (path) => ({
    color: location.pathname === path ? '#3498db' : '#fff',
    textDecoration: 'none',
    fontWeight: 'bold',
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const candidateLinks = (
    <>
      <Link to="/candidate/jobs" style={linkStyle('/candidate/jobs')}>Browse Jobs</Link>
      <Link to="/candidate/applications" style={linkStyle('/candidate/applications')}>My Applications</Link>
      <Link to="/candidate/offers" style={linkStyle('/candidate/offers')}>My Offers</Link>
      <Link to="/candidate/profile" style={linkStyle('/candidate/profile')}>Profile</Link>
    </>
  );

  const recruiterLinks = (
    <>
      <Link to="/hr/jobs" style={linkStyle('/hr/jobs')}>Jobs</Link>
      <Link to="/hr/interviews" style={linkStyle('/hr/interviews')}>Schedule Interviews</Link>
      <Link to="/hr/offers" style={linkStyle('/hr/offers')}>Manage Offers</Link>
      <Link to="/hr/analytics" style={linkStyle('/hr/analytics')}>Analytics</Link>
    </>
  );

  return (
    <nav style={{ padding: '15px 30px', background: '#2c3e50', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <span style={{ color: '#3498db', fontWeight: 'bold', fontSize: '18px' }}>Smart ATS</span>
        <span style={{ color: '#95a5a6', fontSize: '13px' }}>{user?.role}</span>
        <div style={{ display: 'flex', gap: '18px' }}>
          {user?.role === 'CANDIDATE' && candidateLinks}
          {(user?.role === 'RECRUITER' || user?.role === 'ADMIN') && recruiterLinks}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
        <span style={{ color: '#bdc3c7', fontSize: '14px' }}>{user?.name}</span>
        <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
          Sign out
        </button>
      </div>
    </nav>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#7f8c8d' }}>Loading…</div>;
  }

  // Not signed in -> only auth pages are reachable
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const isCandidate = user.role === 'CANDIDATE';
  const home = isCandidate ? '/candidate/jobs' : '/hr/jobs';

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#f8f9fa' }}>
      <NavBar />
      <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
        <Routes>
          {/* Candidate */}
          <Route path="/candidate/jobs" element={<Jobs />} />
          <Route path="/candidate/applications" element={<ApplicationHistory />} />
          <Route path="/candidate/profile" element={<CandidateProfile />} />
          <Route path="/candidate/offers" element={<MyOffers />} />
          {/* Recruiter / Admin */}
          <Route path="/hr/jobs" element={<JobManagement />} />
          <Route path="/hr/interviews" element={<Interviewmanagement />} />
          <Route path="/hr/offers" element={<OfferManagement />} />
          <Route path="/hr/analytics" element={<AnalyticsDashboard />} />
          <Route path="/login" element={<Navigate to={home} replace />} />
          <Route path="/" element={<Navigate to={home} replace />} />
          <Route path="*" element={<Navigate to={home} replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

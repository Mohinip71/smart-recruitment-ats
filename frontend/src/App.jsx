import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ApplicationHistory from './pages/candidate/ApplicationHistory';
import Interviewmanagement from './pages/hr/Interviewmanagement';
import OfferManagement from './pages/hr/OfferManagement';
import AnalyticsDashboard from './pages/hr/AnalyticsDashboard';
import './App.css';

export default function App() {
  return (
    <Router>
      <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#f8f9fa' }}>
        {/* Navigation Bar */}
        <nav style={{ padding: '15px 30px', background: '#2c3e50', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#3498db' }}>Smart ATS Portal</h2>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link to="/candidate/applications" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Candidate Applications</Link>
            <Link to="/hr/interviews" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Schedule Interviews</Link>
            <Link to="/hr/offers" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Manage Offers</Link>
            <Link to="/hr/analytics" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Analytics Dashboard</Link>
          </div>
        </nav>

        {/* Content Area */}
        <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
          <Routes>
            <Route path="/candidate/applications" element={<ApplicationHistory />} />
            <Route path="/hr/interviews" element={<Interviewmanagement />} />
            <Route path="/hr/offers" element={<OfferManagement />} />
            <Route path="/hr/analytics" element={<AnalyticsDashboard />} />
            <Route path="*" element={<ApplicationHistory />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
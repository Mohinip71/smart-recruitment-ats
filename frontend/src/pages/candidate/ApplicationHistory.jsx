import React, { useState, useEffect } from 'react';

export default function ApplicationHistory() {
  const [applications, setApplications] = useState([
    { id: 101, job_id: 'DEV-01', status: 'OFFERED', applied_date: '2026-10-15' },
    { id: 102, job_id: 'AI-02', status: 'INTERVIEW_SCHEDULED', applied_date: '2026-10-18' },
    { id: 103, job_id: 'FS-03', status: 'UNDER_REVIEW', applied_date: '2026-10-20' }
  ]);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>My Job Applications & Status</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {applications.map((app) => (
          <div key={app.id} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>Application ID: #{app.id}</h3>
              <p style={{ margin: '2px 0', color: '#7f8c8d', fontSize: '14px' }}>Job Position ID: #{app.job_id}</p>
              <p style={{ margin: '2px 0', color: '#95a5a6', fontSize: '12px' }}>Applied on: {app.applied_date}</p>
            </div>
            <div>
              <span style={{ 
                padding: '8px 16px', 
                borderRadius: '20px', 
                color: '#fff', 
                fontWeight: 'bold', 
                fontSize: '13px',
                background: app.status === 'OFFERED' ? '#2ecc71' : app.status === 'INTERVIEW_SCHEDULED' ? '#f39c12' : '#3498db'
              }}>
                {app.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Candidate Portal - Prince Karthik
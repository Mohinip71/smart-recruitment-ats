import React, { useEffect, useState } from 'react';
import { getHiringAnalytics } from '../../services/api';

function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHiringAnalytics()
      .then((res) => {
        setAnalytics(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching analytics:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading hiring analytics...</p>;

  const totals = analytics?.totals || {};
  const pipeline = analytics?.pipeline || [];

  return (
    <div>
      <h2>HR Hiring Analytics Dashboard</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#3498db', color: '#fff', padding: '20px', borderRadius: '8px', flex: 1 }}>
          <h3>Total Applications</h3>
          <p style={{ fontSize: '28px', margin: 0, fontWeight: 'bold' }}>{totals.total_applications || 0}</p>
        </div>
        <div style={{ background: '#e67e22', color: '#fff', padding: '20px', borderRadius: '8px', flex: 1 }}>
          <h3>Total Interviews</h3>
          <p style={{ fontSize: '28px', margin: 0, fontWeight: 'bold' }}>{totals.total_interviews || 0}</p>
        </div>
        <div style={{ background: '#2ecc71', color: '#fff', padding: '20px', borderRadius: '8px', flex: 1 }}>
          <h3>Accepted Offers</h3>
          <p style={{ fontSize: '28px', margin: 0, fontWeight: 'bold' }}>{totals.total_accepted_offers || 0}</p>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ccc' }}>
        <h3>Recruitment Pipeline Breakdown</h3>
        <ul style={{ listStyleType: 'none', padding: 0, marginTop: '15px' }}>
          {pipeline.map((stage, index) => (
            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <span style={{ fontWeight: 'bold' }}>{stage.status}</span>
              <span style={{ background: '#f0f0f0', padding: '4px 10px', borderRadius: '4px' }}>{stage.count} candidates</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
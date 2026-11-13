import React, { useEffect, useState } from 'react';
import { getHiringAnalytics } from '../../services/api';

function AnalyticsDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getHiringAnalytics()
      .then((res) => {
        // Backend returns { dashboard: { jobs, applications, interviews, offers, onboarding, performance, monthlyTrends } }
        setDashboard(res.data.dashboard);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Error fetching analytics');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading hiring analytics...</p>;
  if (error) return <p style={{ color: '#c0392b' }}>{error}</p>;

  // Map the backend response onto the cards the UI renders.
  const totalApplications = dashboard?.applications?.total || 0;
  const totalInterviews = dashboard?.interviews?.total || 0;
  const totalAcceptedOffers =
    dashboard?.offers?.byStatus?.find((s) => s.status === 'ACCEPTED')?._count?.id || 0;
  const pipeline =
    dashboard?.applications?.byStatus?.map((s) => ({ status: s.status, count: s._count.id })) || [];

  return (
    <div>
      <h2>HR Hiring Analytics Dashboard</h2>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', marginBottom: '30px' }}>
        <div style={statCard('#3498db')}>
          <h3>Total Applications</h3>
          <p style={statNum}>{totalApplications}</p>
        </div>
        <div style={statCard('#e67e22')}>
          <h3>Total Interviews</h3>
          <p style={statNum}>{totalInterviews}</p>
        </div>
        <div style={statCard('#2ecc71')}>
          <h3>Accepted Offers</h3>
          <p style={statNum}>{totalAcceptedOffers}</p>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ccc' }}>
        <h3>Application Pipeline Breakdown</h3>
        <ul style={{ listStyleType: 'none', padding: 0, marginTop: '15px' }}>
          {pipeline.length === 0 && <li style={{ color: '#7f8c8d' }}>No applications yet.</li>}
          {pipeline.map((stage, index) => (
            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <span style={{ fontWeight: 'bold' }}>{stage.status}</span>
              <span style={{ background: '#f0f0f0', padding: '4px 10px', borderRadius: '4px' }}>{stage.count} candidates</span>
            </li>
          ))}
        </ul>
      </div>

      {dashboard?.performance && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '20px' }}>
          <h3>Performance</h3>
          <p>App → Interview rate: {dashboard.performance.applicationToInterviewRate}%</p>
          <p>Offer acceptance rate: {dashboard.performance.offerAcceptanceRate}%</p>
          <p>Hiring conversion rate: {dashboard.performance.hiringConversionRate}%</p>
          <p>Avg time-to-hire: {dashboard.performance.averageTimeToHireDays} days</p>
        </div>
      )}
    </div>
  );
}

const statCard = (bg) => ({ background: bg, color: '#fff', padding: '20px', borderRadius: '8px', flex: 1 });
const statNum = { fontSize: '28px', margin: 0, fontWeight: 'bold' };

export default AnalyticsDashboard;

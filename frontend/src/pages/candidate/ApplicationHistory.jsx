import React, { useEffect, useState, useCallback } from 'react';
import { getMyApplications } from '../../services/api';

const statusColor = {
  APPLIED: '#3498db',
  SCREENING: '#9b59b6',
  SHORTLISTED: '#f1c40f',
  INTERVIEW: '#e67e22',
  SELECTED: '#2ecc71',
  REJECTED: '#e74c3c',
};

export default function ApplicationHistory() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyApplications();
      setApplications(res.data.applications || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p>Loading your applications…</p>;
  if (error) return <p style={{ color: '#c0392b' }}>{error}</p>;

  return (
    <div>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>My Job Applications</h2>
      {applications.length === 0 && <p style={{ color: '#7f8c8d' }}>You haven&apos;t applied to any jobs yet.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {applications.map((app) => (
          <div key={app.id} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <div>
              <h3 style={{ margin: '0 0 5px', color: '#2c3e50' }}>{app.job?.title || 'Untitled role'}</h3>
              <p style={{ margin: '2px 0', color: '#7f8c8d', fontSize: '14px' }}>
                {app.job?.location || '—'} · {app.job?.employmentType?.replace('_', ' ') || '—'}
              </p>
              <p style={{ margin: '2px 0', color: '#95a5a6', fontSize: '12px' }}>
                Applied on {new Date(app.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span style={{
              padding: '8px 16px', borderRadius: '20px', color: '#fff', fontWeight: 'bold', fontSize: '13px',
              background: statusColor[app.status] || '#3498db',
            }}>
              {app.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Candidate Portal - Prince Karthik

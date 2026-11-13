import React, { useEffect, useState, useCallback } from 'react';
import { getJobs, applyToJob } from '../../services/api';

const statusColor = {
  PUBLISHED: '#2ecc71',
  DRAFT: '#95a5a6',
  CLOSED: '#e67e22',
  ARCHIVED: '#7f8c8d',
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(null); // jobId being applied to

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getJobs();
      setJobs(res.data.jobs || []);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApply = async (jobId) => {
    setMessage('');
    setBusy(jobId);
    try {
      const res = await applyToJob(jobId);
      setMessage(res.data.message || 'Application submitted');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not apply');
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <p>Loading jobs…</p>;

  return (
    <div>
      <h2 style={{ color: '#2c3e50', marginBottom: '16px' }}>Open Jobs</h2>
      {message && <p style={{ color: '#27ae60', fontWeight: 'bold' }}>{message}</p>}
      {jobs.length === 0 && <p style={{ color: '#7f8c8d' }}>No jobs posted yet.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {jobs.map((job) => (
          <div key={job.id} style={{ border: '1px solid #e0e0e0', padding: '18px', borderRadius: '8px', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 6px', color: '#2c3e50' }}>{job.title}</h3>
                <p style={{ margin: '2px 0', color: '#7f8c8d', fontSize: '14px' }}>
                  {job.location || 'Unspecified'} · {job.employmentType?.replace('_', ' ')}
                </p>
                {job.skills && <p style={{ margin: '6px 0 0', color: '#566', fontSize: '14px' }}>Skills: {job.skills}</p>}
                <p style={{ margin: '6px 0 0', color: '#444', fontSize: '14px' }}>{job.description}</p>
              </div>
              <span style={{ background: statusColor[job.status] || '#95a5a6', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                {job.status}
              </span>
            </div>
            <div style={{ marginTop: '12px' }}>
              <button
                onClick={() => handleApply(job.id)}
                disabled={job.status !== 'PUBLISHED' || busy === job.id}
                style={{
                  background: job.status === 'PUBLISHED' ? '#3498db' : '#bdc3c7',
                  color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: job.status === 'PUBLISHED' ? 'pointer' : 'not-allowed',
                }}
              >
                {busy === job.id ? 'Applying…' : job.status === 'PUBLISHED' ? 'Apply Now' : 'Not open'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

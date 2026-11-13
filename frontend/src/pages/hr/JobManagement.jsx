import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getJobs, createJob, publishJob, closeJob, getApplicationsByJob, updateApplicationStatus } from '../../services/api';

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'];

// Valid next statuses for an application (mirrors backend allowedTransitions)
const nextStatuses = {
  APPLIED: ['SCREENING', 'REJECTED'],
  SCREENING: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['SELECTED', 'REJECTED'],
  SELECTED: [],
  REJECTED: [],
};

const emptyForm = { title: '', description: '', location: '', employmentType: 'FULL_TIME', salaryMin: '', salaryMax: '', skills: '' };

export default function JobManagement() {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState({}); // jobId -> applications[]
  const [loadedApps, setLoadedApps] = useState({}); // jobId -> true

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getJobs();
      setJobs(res.data.jobs || []);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        location: form.location || undefined,
        employmentType: form.employmentType,
        salaryMin: form.salaryMin === '' ? undefined : Number(form.salaryMin),
        salaryMax: form.salaryMax === '' ? undefined : Number(form.salaryMax),
        skills: form.skills || undefined,
      };
      const res = await createJob(payload);
      setMessage(res.data.message || 'Job created (saved as DRAFT)');
      setForm(emptyForm);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not create job');
    }
  };

  const handlePublish = async (id) => {
    setMessage('');
    try {
      const res = await publishJob(id);
      setMessage(res.data.message || 'Job published');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Publish failed');
    }
  };

  const handleClose = async (id) => {
    setMessage('');
    try {
      const res = await closeJob(id);
      setMessage(res.data.message || 'Job closed');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Close failed');
    }
  };

  const toggleApplications = async (jobId) => {
    if (loadedApps[jobId]) {
      setExpanded((e) => ({ ...e, [jobId]: !e[jobId] }));
      return;
    }
    try {
      const res = await getApplicationsByJob(jobId);
      setExpanded((e) => ({ ...e, [jobId]: true }));
      setLoadedApps((e) => ({ ...e, [jobId]: true }));
      setApplicationsCache((c) => ({ ...c, [jobId]: res.data.applications || [] }));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not load applications');
    }
  };

  const [applicationsCache, setApplicationsCache] = useState({});

  const refreshApplications = async (jobId) => {
    try {
      const res = await getApplicationsByJob(jobId);
      setApplicationsCache((c) => ({ ...c, [jobId]: res.data.applications || [] }));
    } catch { /* ignore */ }
  };

  const advanceStatus = async (applicationId, status, jobId) => {
    setMessage('');
    try {
      await updateApplicationStatus(applicationId, status);
      await refreshApplications(jobId);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Status update failed');
    }
  };

  return (
    <div>
      <h2 style={{ color: '#2c3e50', marginBottom: '16px' }}>Manage Jobs</h2>
      {message && <p style={{ color: message.match(/fail|not|invalid/i) ? '#c0392b' : '#27ae60', fontWeight: 'bold' }}>{message}</p>}

      {/* Create job */}
      <form onSubmit={handleCreate} style={card}>
        <h3 style={{ marginTop: 0 }}>Post a new job</h3>
        <div style={grid2}>
          <label style={labelStyle}>Title<input name="title" value={form.title} onChange={handleChange} required style={inputStyle} /></label>
          <label style={labelStyle}>Employment type
            <select name="employmentType" value={form.employmentType} onChange={handleChange} style={inputStyle}>
              {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </label>
          <label style={labelStyle}>Location<input name="location" value={form.location} onChange={handleChange} style={inputStyle} /></label>
          <label style={labelStyle}>Skills<input name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node" style={inputStyle} /></label>
          <label style={labelStyle}>Salary min<input name="salaryMin" type="number" value={form.salaryMin} onChange={handleChange} style={inputStyle} /></label>
          <label style={labelStyle}>Salary max<input name="salaryMax" type="number" value={form.salaryMax} onChange={handleChange} style={inputStyle} /></label>
        </div>
        <label style={{ ...labelStyle, display: 'block', marginTop: '8px' }}>Description
          <textarea name="description" value={form.description} onChange={handleChange} required style={{ ...inputStyle, height: '70px' }} />
        </label>
        <button type="submit" style={primaryBtn}>Create job</button>
      </form>

      {/* Job list */}
      <h3 style={{ marginTop: '26px' }}>All jobs</h3>
      {loading ? <p>Loading…</p> : jobs.length === 0 ? <p style={{ color: '#7f8c8d' }}>No jobs yet.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {jobs.map((job) => {
            const mine = job.recruiterId === user?.id;
            const apps = applicationsCache[job.id] || [];
            return (
              <div key={job.id} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '16px' }}>{job.title}</strong>
                    <span style={{ marginLeft: '8px', color: '#7f8c8d', fontSize: '13px' }}>{job.employmentType?.replace('_', ' ')} · {job.location || '—'}</span>
                    {!mine && <span style={{ marginLeft: '8px', color: '#bdc3c7', fontSize: '12px' }}>(another recruiter)</span>}
                  </div>
                  <span style={{ background: statusBadge(job.status), color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{job.status}</span>
                </div>
                <p style={{ color: '#444', fontSize: '14px', margin: '8px 0' }}>{job.description}</p>

                {mine && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {job.status === 'DRAFT' && <button onClick={() => handlePublish(job.id)} style={smallBtn}>Publish</button>}
                    {job.status === 'PUBLISHED' && <button onClick={() => handleClose(job.id)} style={smallBtn}>Close</button>}
                    <button onClick={() => toggleApplications(job.id)} style={smallBtn}>{expanded[job.id] ? 'Hide' : 'View'} applications</button>
                  </div>
                )}

                {mine && expanded[job.id] && (
                  <div style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    {apps.length === 0 ? <p style={{ color: '#7f8c8d', fontSize: '14px' }}>No applications yet.</p> : apps.map((a) => (
                      <div key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span><strong>{a.candidate?.name}</strong> · {a.candidate?.email}</span>
                          <span style={{ color: '#fff', background: statusBadge(a.status), padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>{a.status}</span>
                        </div>
                        <div style={{ color: '#95a5a6', fontSize: '12px', marginTop: '2px' }}>Application ID: <code>{a.id}</code></div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                          {nextStatuses[a.status]?.map((s) => (
                            <button key={s} onClick={() => advanceStatus(a.id, s, job.id)} style={tinyBtn}>{s}</button>
                          ))}
                          {a.status !== 'SELECTED' && nextStatuses[a.status]?.length > 0 && (
                            <Link to={`/hr/interviews?appId=${a.id}`} style={linkBtn}>Schedule interview →</Link>
                          )}
                          {a.status === 'SELECTED' && (
                            <Link to={`/hr/offers?appId=${a.id}`} style={{ ...linkBtn, background: '#2ecc71' }}>Create offer →</Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const statusBadge = (s) => ({ PUBLISHED: '#2ecc71', DRAFT: '#95a5a6', CLOSED: '#e67e22', ARCHIVED: '#7f8c8d', APPLIED: '#3498db', SCREENING: '#9b59b6', SHORTLISTED: '#f1c40f', INTERVIEW: '#e67e22', SELECTED: '#2ecc71', REJECTED: '#e74c3c' }[s] || '#95a5a6');
const card = { background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#34495e' };
const inputStyle = { display: 'block', width: '100%', padding: '7px', marginTop: '3px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontWeight: 'normal' };
const primaryBtn = { marginTop: '12px', background: '#3498db', color: '#fff', padding: '9px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const smallBtn = { background: '#ecf0f1', color: '#2c3e50', padding: '5px 10px', border: '1px solid #d5dbdb', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' };
const tinyBtn = { background: '#ecf0f1', color: '#2c3e50', padding: '3px 8px', border: '1px solid #d5dbdb', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };
const linkBtn = { background: '#3498db', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', textDecoration: 'none' };

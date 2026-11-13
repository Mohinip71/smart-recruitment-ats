import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { scheduleInterview } from '../../services/api';

function Interviewmanagement() {
  const [searchParams] = useSearchParams();
  const prefilledAppId = searchParams.get('appId') || '';
  const [form, setForm] = useState({
    applicationId: prefilledAppId,
    type: 'ONLINE',
    scheduledAt: '',
    meetingLink: '',
    location: '',
    notes: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    // Online interviews need a meeting link; in-person needs a location.
    if (form.type === 'ONLINE' && !form.meetingLink) {
      setMessage('Meeting link is required for online interviews');
      return;
    }
    if (form.type === 'IN_PERSON' && !form.location) {
      setMessage('Location is required for in-person interviews');
      return;
    }
    setLoading(true);
    try {
      // datetime-local is a local time string; the backend parses it with new Date().
      const res = await scheduleInterview({
        applicationId: form.applicationId,
        scheduledAt: form.scheduledAt,
        type: form.type,
        meetingLink: form.meetingLink || undefined,
        location: form.location || undefined,
        notes: form.notes || undefined,
      });
      setMessage(res.data.message || 'Interview scheduled successfully!');
      setForm({ applicationId: '', type: 'ONLINE', scheduledAt: '', meetingLink: '', location: '', notes: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to schedule interview.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>HR Interview Management & Scheduling</h2>
      {message && <p style={{ color: message.toLowerCase().includes('fail') || message.toLowerCase().includes('required') ? '#c0392b' : 'green', fontWeight: 'bold' }}>{message}</p>}

      <form onSubmit={handleSubmit} style={card}>
        <label style={labelStyle}>Application ID
          <input name="applicationId" value={form.applicationId} onChange={handleChange} placeholder="cuid from Job Management" required style={inputStyle} />
        </label>
        <label style={labelStyle}>Interview type
          <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>
            <option value="ONLINE">Online</option>
            <option value="IN_PERSON">In person</option>
          </select>
        </label>
        <label style={labelStyle}>Scheduled date & time
          <input type="datetime-local" name="scheduledAt" value={form.scheduledAt} onChange={handleChange} required style={inputStyle} />
        </label>
        {form.type === 'ONLINE' ? (
          <label style={labelStyle}>Meeting link<input name="meetingLink" value={form.meetingLink} onChange={handleChange} placeholder="https://meet.jit.si/..." required style={inputStyle} /></label>
        ) : (
          <label style={labelStyle}>Location<input name="location" value={form.location} onChange={handleChange} placeholder="Office address" required style={inputStyle} /></label>
        )}
        <label style={labelStyle}>Notes<textarea name="notes" value={form.notes} onChange={handleChange} style={{ ...inputStyle, height: '70px' }} /></label>
        <button type="submit" disabled={loading} style={primaryBtn}>{loading ? 'Scheduling…' : 'Schedule Interview'}</button>
      </form>
    </div>
  );
}

const card = { background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ccc', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '12px' };
const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontWeight: 'normal', marginTop: '3px' };
const primaryBtn = { background: '#3498db', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' };

export default Interviewmanagement;

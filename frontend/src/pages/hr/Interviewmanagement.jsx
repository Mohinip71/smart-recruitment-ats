import React, { useState } from 'react';
import { scheduleInterview } from '../../services/api';

function Interviewmanagement() {
  const [formData, setFormData] = useState({
    application_id: '',
    interviewer_id: '',
    scheduled_at: '',
    meeting_link: '',
    notes: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    scheduleInterview(formData)
      .then(() => {
        setMessage('Interview scheduled successfully!');
        setFormData({ application_id: '', interviewer_id: '', scheduled_at: '', meeting_link: '', notes: '' });
      })
      .catch((err) => {
        console.error('Error scheduling interview:', err);
        setMessage('Failed to schedule interview.');
      });
  };

  return (
    <div>
      <h2>HR Interview Management & Scheduling</h2>
      {message && <p style={{ color: 'green', fontWeight: 'bold' }}>{message}</p>}
      
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ccc', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Application ID:</label>
          <input type="number" name="application_id" value={formData.application_id} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Interviewer User ID:</label>
          <input type="number" name="interviewer_id" value={formData.interviewer_id} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Scheduled Date & Time:</label>
          <input type="datetime-local" name="scheduled_at" value={formData.scheduled_at} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Meeting Link:</label>
          <input type="text" name="meeting_link" value={formData.meeting_link} onChange={handleChange} placeholder="https://meet.jit.si/..." style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Notes:</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} style={{ width: '100%', padding: '8px', height: '80px' }} />
        </div>
        <button type="submit" style={{ background: '#3498db', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          Schedule Interview
        </button>
      </form>
    </div>
  );
}

export default Interviewmanagement;
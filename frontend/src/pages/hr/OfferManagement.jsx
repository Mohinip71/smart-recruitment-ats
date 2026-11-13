import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createOffer } from '../../services/api';

function OfferManagement() {
  const [searchParams] = useSearchParams();
  const prefilledAppId = searchParams.get('appId') || '';
  const [form, setForm] = useState({
    applicationId: prefilledAppId,
    salary: '',
    joiningDate: '',
    expiryDate: '',
    notes: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      // Offers can only be created for a SELECTED application.
      const res = await createOffer({
        applicationId: form.applicationId,
        salary: Number(form.salary),
        joiningDate: form.joiningDate, // <input type="date"> -> YYYY-MM-DD, Date() parses it
        expiryDate: form.expiryDate || undefined, // optional; must be before joiningDate
        notes: form.notes || undefined,
      });
      setMessage(res.data.message || 'Offer created and sent successfully!');
      setForm({ applicationId: '', salary: '', joiningDate: '', expiryDate: '', notes: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to send offer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>HR Offer Management</h2>
      {message && <p style={{ color: message.toLowerCase().includes('fail') ? '#c0392b' : 'green', fontWeight: 'bold' }}>{message}</p>}

      <form onSubmit={handleSubmit} style={card}>
        <label style={labelStyle}>Application ID (must be SELECTED)
          <input name="applicationId" value={form.applicationId} onChange={handleChange} placeholder="cuid from Job Management" required style={inputStyle} />
        </label>
        <label style={labelStyle}>Salary ($)
          <input type="number" name="salary" value={form.salary} onChange={handleChange} required min="1" style={inputStyle} />
        </label>
        <label style={labelStyle}>Joining date
          <input type="date" name="joiningDate" value={form.joiningDate} onChange={handleChange} required style={inputStyle} />
        </label>
        <label style={labelStyle}>Expiry date (optional, must be before joining date)
          <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} style={inputStyle} />
        </label>
        <label style={labelStyle}>Notes<textarea name="notes" value={form.notes} onChange={handleChange} style={{ ...inputStyle, height: '70px' }} /></label>
        <button type="submit" disabled={loading} style={{ ...primaryBtn, background: '#2ecc71' }}>{loading ? 'Sending…' : 'Send Offer Letter'}</button>
      </form>
    </div>
  );
}

const card = { background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ccc', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '12px' };
const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontWeight: 'normal', marginTop: '3px' };
const primaryBtn = { color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' };

export default OfferManagement;

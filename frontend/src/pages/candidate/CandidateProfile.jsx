import React, { useEffect, useState } from 'react';
import { getCandidateProfile, updateCandidateProfile } from '../../services/api';

export default function CandidateProfile() {
  const [form, setForm] = useState({ phone: '', location: '', bio: '', skills: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getCandidateProfile();
        const p = res.data.profile || {};
        setForm({
          phone: p.phone || '',
          location: p.location || '',
          bio: p.bio || '',
          skills: p.skills || '',
        });
      } catch (err) {
        // 404 = no profile yet; fine to show empty form
        if (err.response?.status !== 404) {
          setMessage(err.response?.data?.message || 'Could not load profile');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await updateCandidateProfile(form);
      setMessage(res.data.message || 'Profile updated successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <p>Loading profile…</p>;

  return (
    <div>
      <h2>Candidate Profile Management</h2>
      {message && <p style={{ color: message.includes('fail') ? '#c0392b' : 'green' }}>{message}</p>}
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ccc', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label style={labelStyle}>Phone
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 555 123 4567" style={inputStyle} />
        </label>
        <label style={labelStyle}>Location
          <input name="location" value={form.location} onChange={handleChange} placeholder="City, Country" style={inputStyle} />
        </label>
        <label style={labelStyle}>Skills (comma-separated)
          <input name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node, SQL" style={inputStyle} />
        </label>
        <label style={labelStyle}>Bio
          <textarea name="bio" value={form.bio} onChange={handleChange} style={{ ...inputStyle, height: '80px' }} />
        </label>
        <button type="submit" style={{ background: '#3498db', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Save Profile
        </button>
      </form>
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '8px' };
const inputStyle = { width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' };

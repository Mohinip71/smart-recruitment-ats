import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '380px', margin: '60px auto' }}>
      <h2 style={{ color: '#2c3e50' }}>Sign in to Smart ATS</h2>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required style={inputStyle} />
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required style={inputStyle} />
        <button type="submit" disabled={loading} style={btnPrimary}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p style={{ marginTop: '16px', color: '#7f8c8d' }}>
        New here? <Link to="/register" style={{ color: '#3498db' }}>Create a candidate account</Link>
      </p>
      <div style={{ marginTop: '20px', padding: '12px', background: '#f7f9fc', border: '1px solid #e1e8ed', borderRadius: '6px', fontSize: '13px', color: '#566' }}>
        <strong>Demo accounts</strong><br />
        Recruiter: recruiter@ats.dev / password123<br />
        Candidate: candidate@ats.dev / password123
      </div>
    </div>
  );
}

const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc' };
const btnPrimary = { background: '#3498db', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' };

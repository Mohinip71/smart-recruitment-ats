import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Self-registration creates a CANDIDATE account (the backend defaults new
// users to CANDIDATE). Recruiter/Admin accounts are provisioned via seed data.
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '380px', margin: '60px auto' }}>
      <h2 style={{ color: '#2c3e50' }}>Create a candidate account</h2>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required style={inputStyle} />
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required style={inputStyle} />
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required style={inputStyle} />
        <button type="submit" disabled={loading} style={btnPrimary}>
          {loading ? 'Creating…' : 'Register'}
        </button>
      </form>
      <p style={{ marginTop: '16px', color: '#7f8c8d' }}>
        Already have an account? <Link to="/login" style={{ color: '#3498db' }}>Sign in</Link>
      </p>
    </div>
  );
}

const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc' };
const btnPrimary = { background: '#2ecc71', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' };

import React, { useState } from 'react';
import { updateCandidateProfile } from '../../services/api';

export default function CandidateProfile() {
  const [resumeUrl, setResumeUrl] = useState('');
  const [message, setMessage] = useState('');

  const handleUpdate = (e) => {
    e.preventDefault();
    updateCandidateProfile({ resume_url: resumeUrl })
      .then(() => setMessage('Profile updated successfully!'))
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <h2>Candidate Profile Management</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <form onSubmit={handleUpdate} style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ccc', maxWidth: '400px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Resume Link:</label>
        <input 
          type="text" 
          value={resumeUrl} 
          onChange={(e) => setResumeUrl(e.target.value)} 
          placeholder="https://example.com/my-resume.pdf" 
          style={{ width: '100%', padding: '8px', marginBottom: '15px' }} 
        />
        <button type="submit" style={{ background: '#3498db', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Save Profile
        </button>
      </form>
    </div>
  );
}
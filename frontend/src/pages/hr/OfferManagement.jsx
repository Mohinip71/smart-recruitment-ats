import React, { useState } from 'react';
import { createOffer } from '../../services/api';

function OfferManagement() {
  const [offerData, setOfferData] = useState({
    application_id: '',
    salary_offered: '',
    joining_date: '',
    offer_letter_url: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setOfferData({ ...offerData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createOffer(offerData)
      .then(() => {
        setMessage('Offer created and sent successfully!');
        setOfferData({ application_id: '', salary_offered: '', joining_date: '', offer_letter_url: '' });
      })
      .catch((err) => {
        console.error('Error creating offer:', err);
        setMessage('Failed to send offer.');
      });
  };

  return (
    <div>
      <h2>HR Offer Management</h2>
      {message && <p style={{ color: 'green', fontWeight: 'bold' }}>{message}</p>}

      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ccc', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Application ID:</label>
          <input type="number" name="application_id" value={offerData.application_id} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Salary Offered ($):</label>
          <input type="number" name="salary_offered" value={offerData.salary_offered} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Joining Date:</label>
          <input type="date" name="joining_date" value={offerData.joining_date} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Offer Letter URL:</label>
          <input type="text" name="offer_letter_url" value={offerData.offer_letter_url} onChange={handleChange} placeholder="https://storage.example.com/offer.pdf" style={{ width: '100%', padding: '8px' }} />
        </div>
        <button type="submit" style={{ background: '#2ecc71', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          Send Offer Letter
        </button>
      </form>
    </div>
  );
}

export default OfferManagement;
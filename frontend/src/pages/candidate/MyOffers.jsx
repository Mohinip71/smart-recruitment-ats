import React, { useEffect, useState, useCallback } from 'react';
import { getMyOffers, updateOfferStatus } from '../../services/api';

const statusColor = {
  PENDING: '#f39c12',
  ACCEPTED: '#2ecc71',
  REJECTED: '#e74c3c',
  EXPIRED: '#95a5a6',
};

export default function MyOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyOffers();
      setOffers(res.data.offers || []);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not load offers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const respond = async (offerId, status) => {
    setMessage('');
    try {
      const res = await updateOfferStatus(offerId, status);
      setMessage(res.data.message || `Offer ${status.toLowerCase()}`);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not update offer');
    }
  };

  if (loading) return <p>Loading your offers…</p>;

  return (
    <div>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>My Job Offers</h2>
      {message && <p style={{ color: message.toLowerCase().includes('could') ? '#c0392b' : '#27ae60', fontWeight: 'bold' }}>{message}</p>}
      {offers.length === 0 && <p style={{ color: '#7f8c8d' }}>No offers yet.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {offers.map((offer) => (
          <div key={offer.id} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 5px', color: '#2c3e50' }}>{offer.application?.job?.title || 'Offer'}</h3>
                <p style={{ margin: '2px 0', color: '#2c3e50', fontWeight: 'bold' }}>Salary: ${offer.salary?.toLocaleString()}</p>
                <p style={{ margin: '2px 0', color: '#7f8c8d', fontSize: '14px' }}>
                  Joining: {new Date(offer.joiningDate).toLocaleDateString()}
                  {offer.expiryDate && ` · Expires ${new Date(offer.expiryDate).toLocaleDateString()}`}
                </p>
                {offer.notes && <p style={{ margin: '4px 0 0', color: '#444', fontSize: '14px' }}>{offer.notes}</p>}
              </div>
              <span style={{ background: statusColor[offer.status] || '#95a5a6', color: '#fff', padding: '6px 12px', borderRadius: '16px', fontWeight: 'bold', fontSize: '12px' }}>
                {offer.status}
              </span>
            </div>
            {offer.status === 'PENDING' && (
              <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
                <button onClick={() => respond(offer.id, 'ACCEPTED')} style={acceptBtn}>Accept</button>
                <button onClick={() => respond(offer.id, 'REJECTED')} style={rejectBtn}>Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const acceptBtn = { background: '#2ecc71', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const rejectBtn = { background: '#e74c3c', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

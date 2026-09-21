import { useState, useEffect } from 'react';
import api from '../api';

export default function AdminReplacements() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = () => {
    setLoading(true);
    api.get('/replacements')
      .then(res => setRequests(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await api.patch(`/replacements/${requestId}`, { status: newStatus });
      alert("Status updated successfully!");
      loadRequests();
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading replacements...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>All Replacement Requests</h1>
      {requests.length === 0 && <p>No replacement requests found.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {requests.map(req => (
          <div key={req._id} style={{ border: '1px solid #e0e0e0', padding: '1.5rem', borderRadius: '8px', backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div>
                <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>Request ID: {req._id}</p>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Order ID:</strong> {req.order?._id || req.order}</p>
                <p style={{ margin: 0 }}><strong>User:</strong> {req.user?.name || req.user} ({req.user?.mobile})</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Update Status:</label>
                <select 
                  value={req.status} 
                  onChange={(e) => handleStatusChange(req._id, e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="REPLACED">REPLACED</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Product Details</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {req.product?.image && <img src={req.product.image} alt="product" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />}
                  <p style={{ margin: 0 }}><strong>{req.product?.title || req.product}</strong></p>
                </div>
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: '4px', border: '1px solid #ffeeba' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>Customer Reason:</h4>
                  <p style={{ margin: 0, color: '#856404' }}>{req.reason}</p>
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Damage Image Proof</h4>
                {req.damageImageUrl ? (
                  <a href={req.damageImageUrl} target="_blank" rel="noopener noreferrer">
                    <img src={req.damageImageUrl} alt="damage proof" style={{ width: '100%', maxWidth: '200px', borderRadius: '8px', border: '1px solid #eee' }} />
                  </a>
                ) : (
                  <p>No image provided.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

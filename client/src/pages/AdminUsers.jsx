import { useState, useEffect } from 'react';
import api from '../api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/users/all')
      .then(res => setUsers(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading users...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>All Platform Users</h1>
      {users.length === 0 && <p>No users found.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {users.map(user => (
          <div key={user._id} style={{ border: '1px solid #e0e0e0', padding: '1.5rem', borderRadius: '8px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{user.name}</h3>
              <span style={{ background: user.role === 'admin' ? '#000' : '#e0e0e0', color: user.role === 'admin' ? '#fff' : '#333', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                {user.role}
              </span>
            </div>
            <p style={{ margin: 0, color: '#666' }}>Email: {user.email || 'N/A'}</p>
            <p style={{ margin: 0, color: '#666' }}>Mobile: {user.mobile}</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>ID: {user._id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

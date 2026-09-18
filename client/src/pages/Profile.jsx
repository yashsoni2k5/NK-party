import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    mobile: '',
    house_no: '',
    area: '',
    city: '',
    pincode: ''
  });

  const loadAddresses = () => {
    api.get('/address')
      .then(res => setAddresses(res.data || []))
      .catch(console.error);
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await api.post('/address', newAddress);
      setNewAddress({ name: '', mobile: '', house_no: '', area: '', city: '', pincode: '' });
      loadAddresses();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h1>My Profile</h1>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Mobile:</strong> {user.mobile}</p>
      <p><strong>Role:</strong> {user.role}</p>

      <hr style={{ margin: '2rem 0' }} />

      <h2>My Saved Addresses</h2>
      
      {addresses.length === 0 ? (
        <p>You have no saved addresses.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          {addresses.map(addr => (
            <div key={addr._id} style={{ border: '1px solid #ccc', padding: '1rem' }}>
              <strong>{addr.name}</strong> ({addr.mobile})<br />
              {addr.house_no}, {addr.area}<br />
              {addr.city}, {addr.pincode}
            </div>
          ))}
        </div>
      )}

      {!showAddForm ? (
        <button onClick={() => setShowAddForm(true)} style={{ padding: '0.5rem 1rem' }}>
          Add New Address
        </button>
      ) : (
        <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
          <h3>Add Address</h3>
          <input name="name" placeholder="Full Name" value={newAddress.name} onChange={handleChange} required />
          <input name="mobile" placeholder="Mobile Number" value={newAddress.mobile} onChange={handleChange} required />
          <input name="house_no" placeholder="House Number" value={newAddress.house_no} onChange={handleChange} required />
          <input name="area" placeholder="Area / Locality" value={newAddress.area} onChange={handleChange} required />
          <input name="city" placeholder="City" value={newAddress.city} onChange={handleChange} required />
          <input name="pincode" type="number" placeholder="Pincode" value={newAddress.pincode} onChange={handleChange} required />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" style={{ padding: '0.5rem', background: 'black', color: 'white' }}>Save Address</button>
            <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

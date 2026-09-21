import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await register(name, mobile, email, password);
      alert("Registered successfully! Please login.");
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <input 
          type="text" 
          placeholder="Name" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          required 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password (min 6 characters)" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
        />
        <input 
          type="text" 
          placeholder="Mobile Number" 
          value={mobile} 
          onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} 
          required 
          maxLength={10}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}

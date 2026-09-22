import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#003725]">
      <div className="w-full max-w-md bg-[#011E15] border border-[#E3BA63]/30 rounded-3xl p-8 shadow-2xl text-[#FAF7F0]">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-[#E3BA63]/15 text-[#E3BA63] p-3 rounded-2xl mb-3 border border-[#E3BA63]/30">
            <span className="text-2xl">✨</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#FAF7F0]">Create Account</h1>
          <p className="text-gray-300 text-sm mt-1">Join NKparty to start shopping</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1.5">Full Name</label>
            <input 
              type="text" 
              placeholder="Enter your full name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              className="w-full bg-[#00271a] text-[#FAF7F0] border border-[#E3BA63]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3BA63] placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1.5">Mobile Number</label>
            <input 
              type="text" 
              placeholder="Enter 10-digit mobile number" 
              value={mobile} 
              onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} 
              required 
              maxLength={10}
              className="w-full bg-[#00271a] text-[#FAF7F0] border border-[#E3BA63]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3BA63] placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1.5">Email Address</label>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              className="w-full bg-[#00271a] text-[#FAF7F0] border border-[#E3BA63]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3BA63] placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1.5">Password</label>
            <input 
              type="password" 
              placeholder="At least 6 characters" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              minLength={6}
              className="w-full bg-[#00271a] text-[#FAF7F0] border border-[#E3BA63]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3BA63] placeholder-gray-400"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-[#E3BA63] hover:bg-[#cda24d] text-[#011E15] font-extrabold rounded-xl text-base transition-all duration-200 shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-[#011E15]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-300">
          {"Already have an account?"}{' '}
          <Link to="/login" className="text-[#E3BA63] font-bold hover:underline">
            Login Here
          </Link>
        </div>

      </div>
    </div>
  );
}

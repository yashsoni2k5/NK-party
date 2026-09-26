import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(mobile, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#FAFAFA]">
      <div className="w-full max-w-md bg-white border border-[#AC666D]/30 rounded-3xl p-8 shadow-2xl text-gray-800">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-[#AC666D]/15 text-[#AC666D] p-3 rounded-2xl mb-3 border border-[#AC666D]/30">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800">Welcome Back</h1>
          <p className="text-gray-800 text-sm mt-1">Login to access your NKparty account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-800 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Mobile Number</label>
            <input 
              type="text" 
              placeholder="Enter 10-digit mobile number" 
              value={mobile} 
              onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} 
              required 
              maxLength={10}
              className="w-full bg-white text-gray-800 border border-[#AC666D]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3BA63] placeholder-gray-400"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium text-gray-800">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#AC666D] hover:underline font-semibold"
              >
                Forgot Password?
              </Link>
            </div>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="w-full bg-white text-gray-800 border border-[#AC666D]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3BA63] placeholder-gray-400"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-[#AC666D] hover:bg-[#96555b] text-white font-extrabold rounded-xl text-base transition-all duration-200 shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : (
              'Login to Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-800">
          {"Don't have an account?"}{' '}
          <Link to="/register" className="text-[#AC666D] font-bold hover:underline">
            Create Account
          </Link>
        </div>

      </div>
    </div>
  );
}

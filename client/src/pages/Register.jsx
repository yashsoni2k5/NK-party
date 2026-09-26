import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  
  // OTP Verification State
  const [verificationPending, setVerificationPending] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { register, verifyEmailOTP, resendEmailOTP } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleRegisterSubmit = async (e) => {
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
      const res = await register(name, mobile, email, password);
      if (res.requiresVerification) {
        setVerificationPending(true);
        setResendCooldown(60); // 60 seconds cooldown
        setError(null); // Clear errors
      } else {
        alert("Registered successfully! Please login.");
        navigate('/login');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await verifyEmailOTP(email, otp);
      navigate('/'); // Redirect to home/dashboard on successful verification + login
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    setError(null);
    try {
      await resendEmailOTP(email);
      setResendCooldown(60);
      alert("A new OTP has been sent to your email!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#FAFAFA]">
      <div className="w-full max-w-md bg-white border border-[#AC666D]/30 rounded-3xl p-8 shadow-2xl text-gray-800">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-[#AC666D]/15 text-[#AC666D] p-3 rounded-2xl mb-3 border border-[#AC666D]/30">
            <span className="text-2xl">{verificationPending ? '📧' : '✨'}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800">
            {verificationPending ? 'Verify Email' : 'Create Account'}
          </h1>
          <p className="text-gray-800 text-sm mt-2">
            {verificationPending 
              ? `We've sent a 6-digit code to ${email}` 
              : 'Join NKparty to start shopping'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-800 text-sm text-center">
            {error}
          </div>
        )}

        {!verificationPending ? (
          // Registration Form
          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Full Name</label>
              <input 
                type="text" 
                placeholder="Enter your full name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                className="w-full bg-white text-gray-800 border border-[#AC666D]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3BA63] placeholder-gray-400"
              />
            </div>

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
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Email Address</label>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="w-full bg-white text-gray-800 border border-[#AC666D]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3BA63] placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Password</label>
              <input 
                type="password" 
                placeholder="At least 6 characters" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                minLength={6}
                className="w-full bg-white text-gray-800 border border-[#AC666D]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3BA63] placeholder-gray-400"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-[#AC666D] hover:bg-[#96555b] text-white font-extrabold rounded-xl text-base transition-all duration-200 shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
            
            <div className="mt-6 text-center text-sm text-gray-800">
              {"Already have an account?"}{' '}
              <Link to="/login" className="text-[#AC666D] font-bold hover:underline">
                Login Here
              </Link>
            </div>
          </form>
        ) : (
          // OTP Verification Form
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2 text-center">Enter 6-Digit OTP</label>
              <input 
                type="text" 
                placeholder="• • • • • •" 
                value={otp} 
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                required 
                maxLength={6}
                className="w-full bg-white text-gray-800 border border-[#AC666D]/40 rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#E3BA63] placeholder-gray-500"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-[#AC666D] hover:bg-[#96555b] text-white font-extrabold rounded-xl text-base transition-all duration-200 shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying...' : 'Verify Email & Login'}
            </button>

            <div className="mt-4 text-center text-sm">
              <button 
                type="button" 
                onClick={handleResendOTP}
                disabled={resendCooldown > 0}
                className={`font-bold transition-colors ${resendCooldown > 0 ? 'text-gray-500 cursor-not-allowed' : 'text-[#AC666D] hover:underline'}`}
              >
                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

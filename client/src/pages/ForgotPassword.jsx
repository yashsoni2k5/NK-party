import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP, 3: Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  
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

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const res = await api.post('/users/forgot-password', { identifier: email });
      setMessage(res.data.message);
      setStep(2);
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
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
    setMessage(null);
    
    try {
      const res = await api.post('/users/verify-reset-otp', { email, otp });
      setResetToken(res.data.resetToken);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.post('/users/forgot-password', { identifier: email });
      setMessage(res.data.message);
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await api.post('/users/reset-password', { resetToken, newPassword });
      alert("Password reset successfully! Please login with your new password.");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
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
            <span className="text-2xl">
              {step === 1 ? '🔐' : step === 2 ? '✉️' : '✨'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800">
            {step === 1 ? 'Reset Password' : step === 2 ? 'Verify OTP' : 'New Password'}
          </h1>
          <p className="text-gray-800 text-sm mt-2">
            {step === 1 && 'Enter your email to receive a reset code'}
            {step === 2 && `We sent a reset code to ${email}`}
            {step === 3 && 'Create a strong, secure new password'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-800 text-sm text-center">
            {error}
          </div>
        )}
        
        {message && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 text-sm text-center">
            {message}
          </div>
        )}

        {/* Step 1: Request OTP */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Registered Email</label>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="w-full bg-white text-gray-800 border border-[#AC666D]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3BA63] placeholder-gray-400"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-[#AC666D] hover:bg-[#96555b] text-white font-extrabold rounded-xl text-base transition-all duration-200 shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
            
            <div className="mt-6 text-center text-sm text-gray-800">
              <Link to="/login" className="text-[#AC666D] font-bold hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2 text-center">Enter 6-Digit Code</label>
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
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <div className="mt-4 text-center text-sm">
              <button 
                type="button" 
                onClick={handleResendOTP}
                disabled={resendCooldown > 0 || loading}
                className={`font-bold transition-colors ${resendCooldown > 0 ? 'text-gray-500 cursor-not-allowed' : 'text-[#AC666D] hover:underline'}`}
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Reset Code'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Set New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">New Password</label>
              <input 
                type="password" 
                placeholder="At least 6 characters" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                required 
                minLength={6}
                className="w-full bg-white text-gray-800 border border-[#AC666D]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3BA63] placeholder-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Confirm New Password</label>
              <input 
                type="password" 
                placeholder="Must match password above" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
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
              {loading ? 'Saving...' : 'Reset Password'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Request OTP, 2: Enter OTP & Reset
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState(null);
  const [forgotError, setForgotError] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState(null);

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

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setForgotError("Please enter your registered email or mobile number");
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    setForgotMsg(null);
    try {
      const res = await api.post('/users/forgot-password', { identifier: forgotIdentifier });
      setForgotMsg(res.data.message);
      if (res.data.otp) {
        setGeneratedOtp(res.data.otp);
      }
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data?.message || err.message || "Failed to request OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otpInput || !newPasswordInput) {
      setForgotError("Please enter OTP and your new password");
      return;
    }
    if (newPasswordInput.length < 6) {
      setForgotError("Password must be at least 6 characters long");
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    try {
      const res = await api.post('/users/reset-password', {
        identifier: forgotIdentifier,
        otp: otpInput,
        newPassword: newPasswordInput
      });
      alert(res.data.message || "Password reset successfully!");
      setIsForgotModalOpen(false);
      setForgotStep(1);
      setForgotIdentifier('');
      setOtpInput('');
      setNewPasswordInput('');
    } catch (err) {
      setForgotError(err.response?.data?.message || err.message || "Failed to reset password");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#003725]">
      <div className="w-full max-w-md bg-[#011E15] border border-[#E3BA63]/30 rounded-3xl p-8 shadow-2xl text-[#FAF7F0]">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-[#E3BA63]/15 text-[#E3BA63] p-3 rounded-2xl mb-3 border border-[#E3BA63]/30">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#FAF7F0]">Welcome Back</h1>
          <p className="text-gray-300 text-sm mt-1">Login to access your NKparty account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium text-gray-200">Password</label>
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(true);
                  setForgotStep(1);
                  setForgotError(null);
                  setForgotMsg(null);
                }}
                className="text-xs text-[#E3BA63] hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="w-full bg-[#00271a] text-[#FAF7F0] border border-[#E3BA63]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3BA63] placeholder-gray-400"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-[#E3BA63] hover:bg-[#cda24d] text-[#011E15] font-extrabold rounded-xl text-base transition-all duration-200 shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-[#011E15]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

        <div className="mt-6 text-center text-sm text-gray-300">
          {"Don't have an account?"}{' '}
          <Link to="/register" className="text-[#E3BA63] font-bold hover:underline">
            Create Account
          </Link>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#011E15] border border-[#E3BA63]/40 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-[#E3BA63] mb-2">Reset Password</h2>
            <p className="text-xs text-gray-300 mb-6">
              {forgotStep === 1 
                ? "Enter your registered email address or mobile number to receive a reset OTP." 
                : "Enter the OTP sent to your account along with your new password."}
            </p>

            {forgotError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs">
                {forgotError}
              </div>
            )}

            {forgotMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs">
                {forgotMsg}
                {generatedOtp && (
                  <div className="mt-1 font-bold text-[#E3BA63]">
                    Your OTP is: <span className="underline text-lg">{generatedOtp}</span>
                  </div>
                )}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-1">Email or Mobile Number</label>
                  <input 
                    type="text" 
                    placeholder="Enter email or 10-digit mobile" 
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    required
                    className="w-full bg-[#00271a] text-[#FAF7F0] border border-[#E3BA63]/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3BA63]"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={forgotLoading}
                  className="w-full py-3 bg-[#E3BA63] hover:bg-[#cda24d] text-[#011E15] font-extrabold rounded-xl text-sm transition-all duration-200"
                >
                  {forgotLoading ? 'Sending OTP...' : 'Send Reset OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-1">Enter 6-digit OTP</label>
                  <input 
                    type="text" 
                    placeholder="Enter OTP (e.g. 123456)" 
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    required
                    className="w-full bg-[#00271a] text-[#FAF7F0] border border-[#E3BA63]/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3BA63]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-1">New Password</label>
                  <input 
                    type="password" 
                    placeholder="At least 6 characters" 
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    required
                    className="w-full bg-[#00271a] text-[#FAF7F0] border border-[#E3BA63]/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3BA63]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setForgotStep(1)}
                    className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold text-xs"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={forgotLoading}
                    className="flex-2 py-2.5 bg-[#E3BA63] hover:bg-[#cda24d] text-[#011E15] font-extrabold rounded-xl text-xs transition-all duration-200"
                  >
                    {forgotLoading ? 'Resetting Password...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

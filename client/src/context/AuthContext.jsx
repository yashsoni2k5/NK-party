import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/users/me');
          setUser(res.data);
        } catch (error) {
          console.error("Failed to fetch user", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (mobile, password) => {
    try {
      const res = await api.post('/users/login', { mobile, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  };

  const register = async (name, mobile, email, password) => {
    try {
      const res = await api.post('/users/register', { name, mobile, email, password });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  };

  const verifyEmailOTP = async (email, otp) => {
    try {
      const res = await api.post('/users/verify-email-otp', { email, otp });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  };

  const resendEmailOTP = async (email) => {
    try {
      const res = await api.post('/users/resend-email-otp', { email });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, verifyEmailOTP, resendEmailOTP, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

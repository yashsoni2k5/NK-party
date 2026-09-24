import { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { FiUsers, FiArrowLeft, FiUser, FiPhone, FiMail, FiShield } from 'react-icons/fi';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#003725] flex justify-center items-center text-[#E3BA63]">
        <svg className="animate-spin h-10 w-10 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-bold text-lg text-[#FAF7F0]">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#003725] text-[#FAF7F0] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E3BA63]/20 pb-6">
          <div className="space-y-1">
            <Link 
              to="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E3BA63] hover:text-white transition-colors mb-2"
            >
              <FiArrowLeft /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-[#FAF7F0] flex items-center gap-3">
              <FiUsers className="text-[#E3BA63]" /> Platform Users
            </h1>
            <p className="text-[#FAF7F0] text-sm">
              List of all registered customer and admin accounts.
            </p>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="bg-[#011E15] border border-[#E3BA63]/30 p-12 rounded-3xl text-center shadow-xl">
            <FiUsers className="w-16 h-16 mx-auto text-[#E3BA63]/40 mb-4" />
            <h2 className="text-xl font-bold text-[#FAF7F0] mb-2">No Users Found</h2>
            <p className="text-[#FAF7F0] text-sm">No user accounts registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map(user => (
              <div 
                key={user._id} 
                className="bg-[#011E15] border border-[#E3BA63]/30 hover:border-[#E3BA63]/60 rounded-3xl p-6 shadow-xl space-y-4 transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="bg-black/30 p-3 rounded-2xl border border-[#E3BA63]/20 text-[#E3BA63]">
                      <FiUser className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#FAF7F0] text-lg leading-snug">{user.name}</h3>
                      <p className="text-[10px] text-[#FAF7F0] font-mono">ID: {user._id}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    user.role === 'admin' 
                      ? 'bg-[#E3BA63]/20 text-[#E3BA63] border-[#E3BA63]/40' 
                      : 'bg-black/40 text-[#FAF7F0] border-gray-700'
                  }`}>
                    {user.role}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#E3BA63]/10 space-y-2 text-xs">
                  {user.email && (
                    <p className="text-[#FAF7F0] flex items-center gap-2">
                      <FiMail className="text-[#E3BA63]" /> {user.email}
                    </p>
                  )}
                  <p className="text-[#FAF7F0] flex items-center gap-2">
                    <FiPhone className="text-[#E3BA63]" /> {user.mobile}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}


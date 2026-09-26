import { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { FiUsers, FiArrowLeft, FiUser, FiPhone, FiMail, FiCreditCard, FiPlusCircle, FiX } from 'react-icons/fi';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Wallet modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [pointsInput, setPointsInput] = useState('');
  const [submittingWallet, setSubmittingWallet] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users/all')
      .then(res => setUsers(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddWalletPoints = async (e) => {
    e.preventDefault();
    const amount = Number(pointsInput);
    if (!amount || amount <= 0) {
      alert("Please enter a valid positive number of points.");
      return;
    }

    setSubmittingWallet(true);
    try {
      const res = await api.post(`/users/${selectedUser._id}/wallet/add`, { amount });
      alert(res.data.message || "Wallet points added successfully!");
      setUsers(users.map(u => u._id === selectedUser._id ? { ...u, walletBalance: res.data.user.walletBalance } : u));
      setSelectedUser(null);
      setPointsInput('');
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add wallet points.");
    } finally {
      setSubmittingWallet(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex justify-center items-center text-[#AC666D]">
        <svg className="animate-spin h-10 w-10 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-bold text-lg text-gray-800">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#AC666D]/20 pb-6">
          <div className="space-y-1">
            <Link 
              to="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#AC666D] hover:text-white transition-colors mb-2"
            >
              <FiArrowLeft /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
              <FiUsers className="text-[#AC666D]" /> Platform Users & Wallet Management
            </h1>
            <p className="text-gray-800 text-sm">
              View registered accounts and allocate wallet points directly to user profiles.
            </p>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="bg-white border border-[#AC666D]/30 p-12 rounded-3xl text-center shadow-xl">
            <FiUsers className="w-16 h-16 mx-auto text-[#AC666D]/40 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Users Found</h2>
            <p className="text-gray-800 text-sm">No user accounts registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map(user => (
              <div 
                key={user._id} 
                className="bg-white border border-[#AC666D]/30 hover:border-[#AC666D]/60 rounded-3xl p-6 shadow-xl space-y-4 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-3 rounded-2xl border border-[#AC666D]/20 text-[#AC666D]">
                        <FiUser className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg leading-snug">{user.name}</h3>
                        <p className="text-[10px] text-gray-800 font-mono">ID: {user._id}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      user.role === 'admin' 
                        ? 'bg-[#AC666D]/20 text-[#AC666D] border-[#AC666D]/40' 
                        : 'bg-gray-100 text-gray-800 border-gray-300'
                    }`}>
                      {user.role}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#AC666D]/10 space-y-2 text-xs">
                    {user.email && (
                      <p className="text-gray-800 flex items-center gap-2">
                        <FiMail className="text-[#AC666D]" /> {user.email}
                      </p>
                    )}
                    <p className="text-gray-800 flex items-center gap-2">
                      <FiPhone className="text-[#AC666D]" /> {user.mobile}
                    </p>
                  </div>
                </div>

                {/* Wallet Balance & Action Section */}
                <div className="pt-4 border-t border-[#AC666D]/20 mt-4 flex items-center justify-between bg-gray-50 p-3.5 rounded-2xl">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-gray-800 tracking-wider flex items-center gap-1">
                      <FiCreditCard className="text-[#AC666D]" /> Wallet Points
                    </span>
                    <span className="text-lg font-black text-[#AC666D]">
                      ₹{user.walletBalance || 0}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setPointsInput('');
                    }}
                    className="bg-[#AC666D] hover:bg-[#cda44e] text-white px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
                  >
                    <FiPlusCircle className="w-4 h-4" /> Add Points
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Add Wallet Points Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-[#AC666D]/50 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
              
              <button 
                onClick={() => setSelectedUser(null)}
                className="absolute top-5 right-5 text-gray-600 hover:text-white transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FiCreditCard className="text-[#AC666D]" /> Add Wallet Points
                </h3>
                <p className="text-xs text-gray-800">
                  Grant additional wallet credits to <span className="text-[#AC666D] font-bold">{selectedUser.name}</span>.
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-2xl border border-[#AC666D]/20 space-y-1">
                <p className="text-xs text-gray-800">Current Balance</p>
                <p className="text-2xl font-black text-[#AC666D]">₹{selectedUser.walletBalance || 0}</p>
              </div>

              <form onSubmit={handleAddWalletPoints} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-800">
                    Points / Amount to Add (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 500"
                    required
                    value={pointsInput}
                    onChange={(e) => setPointsInput(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-[#AC666D]/40 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#AC666D] font-mono font-bold"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="flex-1 bg-gray-100 hover:bg-black/70 text-gray-700 py-3 rounded-xl text-xs font-bold transition-all border border-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingWallet}
                    className="flex-1 bg-[#AC666D] hover:bg-[#cda44e] text-white py-3 rounded-xl text-xs font-extrabold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {submittingWallet ? 'Adding...' : 'Confirm & Add'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}



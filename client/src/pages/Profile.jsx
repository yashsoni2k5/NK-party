import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiPhone, FiMapPin, FiPlus, FiX } from 'react-icons/fi';

export default function Profile() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newAddress, setNewAddress] = useState({
    name: '',
    mobile: '',
    house_no: '',
    area: '',
    city: '',
    pincode: ''
  });

  const loadAddresses = () => {
    setLoading(true);
    api.get('/address')
      .then(res => setAddresses(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
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
      setShowAddForm(false);
      loadAddresses();
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading && addresses.length === 0) {
    return (
      <div className="min-h-screen bg-[#003725] flex justify-center items-center text-[#E3BA63]">
        <svg className="animate-spin h-10 w-10 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-bold text-lg text-[#FAF7F0]">Loading your profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#003725] text-[#FAF7F0] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Profile Card */}
        <div className="bg-[#011E15] border border-[#E3BA63]/30 rounded-3xl shadow-2xl p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <FiUser className="w-40 h-40 text-[#E3BA63]" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#FAF7F0] mb-8 flex items-center gap-3">
            <span className="bg-[#E3BA63]/15 text-[#E3BA63] p-2 rounded-2xl border border-[#E3BA63]/30 text-xl sm:text-2xl">👤</span>
            My Profile
          </h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            <div className="bg-black/30 border border-[#E3BA63]/20 p-5 rounded-2xl">
              <p className="text-xs text-[#FAF7F0] uppercase tracking-widest font-semibold mb-1 flex items-center gap-2">
                <FiUser className="text-[#E3BA63]" /> Full Name
              </p>
              <p className="text-xl font-bold text-[#FAF7F0]">{user.name}</p>
            </div>
            <div className="bg-black/30 border border-[#E3BA63]/20 p-5 rounded-2xl">
              <p className="text-xs text-[#FAF7F0] uppercase tracking-widest font-semibold mb-1 flex items-center gap-2">
                <FiPhone className="text-[#E3BA63]" /> Mobile Number
              </p>
              <p className="text-xl font-bold text-[#FAF7F0]">{user.mobile}</p>
            </div>
            <div className="bg-black/30 border border-[#E3BA63]/20 p-5 rounded-2xl">
              <p className="text-xs text-[#FAF7F0] uppercase tracking-widest font-semibold mb-1 flex items-center gap-2">
                💳 Wallet Balance
              </p>
              <p className="text-xl font-bold text-[#E3BA63]">₹{user.walletBalance || 0}</p>
            </div>
            <div className="bg-black/30 border border-[#E3BA63]/20 p-5 rounded-2xl sm:col-span-2 lg:col-span-3 flex justify-between items-center">
              <div>
                <p className="text-xs text-[#FAF7F0] uppercase tracking-widest font-semibold mb-1 flex items-center gap-2">
                  Role
                </p>
                <p className="text-lg font-bold text-[#FAF7F0] capitalize">{user.role}</p>
              </div>
              <div className="px-4 py-1.5 bg-[#E3BA63]/20 border border-[#E3BA63]/40 rounded-full text-[#E3BA63] font-bold text-sm tracking-wide">
                Verified Account
              </div>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="bg-[#011E15] border border-[#E3BA63]/30 rounded-3xl shadow-2xl p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold text-[#E3BA63] flex items-center gap-2">
              <FiMapPin /> Saved Addresses
            </h2>
            {!showAddForm && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-[#E3BA63] hover:bg-[#cda24d] text-[#011E15] px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2"
              >
                <FiPlus /> Add New Address
              </button>
            )}
          </div>

          {showAddForm ? (
            <div className="bg-black/40 border border-[#E3BA63]/30 p-6 rounded-2xl mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#FAF7F0]">Add New Address</h3>
                <button onClick={() => setShowAddForm(false)} className="text-[#FAF7F0] hover:text-red-400 transition-colors">
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#FAF7F0] mb-1">Full Name</label>
                  <input name="name" placeholder="E.g. John Doe" value={newAddress.name} onChange={handleChange} required className="w-full bg-[#011E15] text-[#FAF7F0] border border-[#E3BA63]/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E3BA63]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#FAF7F0] mb-1">Mobile Number</label>
                  <input name="mobile" placeholder="10-digit mobile" value={newAddress.mobile} onChange={handleChange} required className="w-full bg-[#011E15] text-[#FAF7F0] border border-[#E3BA63]/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E3BA63]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#FAF7F0] mb-1">Pincode</label>
                  <input name="pincode" type="number" placeholder="6-digit PIN" value={newAddress.pincode} onChange={handleChange} required className="w-full bg-[#011E15] text-[#FAF7F0] border border-[#E3BA63]/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E3BA63]" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#FAF7F0] mb-1">House No / Flat / Building</label>
                  <input name="house_no" placeholder="E.g. Flat 402, Signature Towers" value={newAddress.house_no} onChange={handleChange} required className="w-full bg-[#011E15] text-[#FAF7F0] border border-[#E3BA63]/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E3BA63]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#FAF7F0] mb-1">Area / Locality</label>
                  <input name="area" placeholder="E.g. Sector 15" value={newAddress.area} onChange={handleChange} required className="w-full bg-[#011E15] text-[#FAF7F0] border border-[#E3BA63]/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E3BA63]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#FAF7F0] mb-1">City</label>
                  <input name="city" placeholder="E.g. New Delhi" value={newAddress.city} onChange={handleChange} required className="w-full bg-[#011E15] text-[#FAF7F0] border border-[#E3BA63]/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E3BA63]" />
                </div>
                
                <div className="sm:col-span-2 flex gap-3 mt-4">
                  <button type="submit" className="flex-1 bg-[#E3BA63] hover:bg-[#cda24d] text-[#011E15] px-6 py-3 rounded-xl font-bold text-base transition-colors shadow-lg">
                    Save Address
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 bg-transparent hover:bg-white/5 border border-[#E3BA63]/40 text-[#E3BA63] px-6 py-3 rounded-xl font-bold text-base transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          {addresses.length === 0 ? (
            <div className="text-center py-10 bg-black/20 rounded-2xl border border-dashed border-[#E3BA63]/30">
              <FiMapPin className="w-12 h-12 mx-auto text-[#FAF7F0] mb-3" />
              <p className="text-[#FAF7F0]">You have no saved addresses yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {addresses.map(addr => (
                <div key={addr._id} className="bg-black/30 border border-[#E3BA63]/20 hover:border-[#E3BA63]/50 transition-colors p-5 rounded-2xl flex flex-col gap-2">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-[#E3BA63]/20 text-[#E3BA63] text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Address
                    </span>
                  </div>
                  <p className="font-bold text-[#FAF7F0] text-lg">{addr.name}</p>
                  <p className="text-[#E3BA63] font-semibold text-sm mb-2">{addr.mobile}</p>
                  
                  <div className="text-[#FAF7F0] text-sm leading-relaxed">
                    <p>{addr.house_no}, {addr.area}</p>
                    <p>{addr.city}, {addr.pincode}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

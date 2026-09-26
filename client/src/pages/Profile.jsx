import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiPhone, FiMapPin, FiPlus, FiX, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import { usePincodeLookup } from '../hooks/usePincodeLookup';

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
    state: '',
    pincode: ''
  });

  const handleLocationFound = (locationData) => {
    setNewAddress(prev => ({
      ...prev,
      city: locationData.city || prev.city,
      state: locationData.state || prev.state,
      ...(locationData.area ? { area: locationData.area } : {})
    }));
  };

  const {
    loading: pinLoading,
    errorMsg: pinError,
    warningMsg: pinWarning,
    postOffices,
    selectedPostOffice,
    handleSelectLocality
  } = usePincodeLookup(newAddress.pincode, handleLocationFound);

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
      setNewAddress({ name: '', mobile: '', house_no: '', area: '', city: '', state: '', pincode: '' });
      setShowAddForm(false);
      loadAddresses();
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading && addresses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <svg className="animate-spin h-8 w-8 text-[#AC666D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-sm text-gray-500">Manage your profile, wallet, and saved addresses.</p>
        </div>

        {/* Profile Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* User Detail */}
          <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center">
              <FiUser className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Full Name</p>
              <p className="font-semibold text-gray-900 truncate">{user.name}</p>
            </div>
          </div>
          
          {/* Phone */}
          <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center">
              <FiPhone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Mobile Number</p>
              <p className="font-semibold text-gray-900 truncate">{user.mobile}</p>
            </div>
          </div>
          
          {/* Wallet */}
          <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <FiCreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Wallet Balance</p>
              <p className="font-bold text-green-600 text-lg">₹{user.walletBalance || 0}</p>
            </div>
          </div>
          
          {/* Role Status */}
          <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Account Status</p>
              <p className="font-semibold text-gray-900 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FiMapPin className="text-[#AC666D]" /> Saved Addresses
            </h2>
            {!showAddForm && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-[#AC666D] hover:bg-[#96555b] text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" /> Add Address
              </button>
            )}
          </div>

          <div className="p-6">
            {showAddForm ? (
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-bold text-gray-900">Add New Address</h3>
                  <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                    <input name="name" placeholder="John Doe" value={newAddress.name} onChange={handleChange} required className="w-full bg-white text-gray-800 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#AC666D]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Mobile Number</label>
                    <input name="mobile" placeholder="10-digit mobile" value={newAddress.mobile} onChange={handleChange} required className="w-full bg-white text-gray-800 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#AC666D]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center justify-between">
                      <span>Pincode</span>
                      {pinLoading && <span className="text-[#AC666D] text-[10px] animate-pulse">Checking...</span>}
                    </label>
                    <input name="pincode" type="number" placeholder="6-digit PIN" value={newAddress.pincode} onChange={handleChange} required className={`w-full bg-white text-gray-800 border ${pinError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#AC666D]'} rounded px-3 py-2 text-sm focus:outline-none`} />
                    {pinError && <p className="text-red-600 text-[10px] mt-1">{pinError}</p>}
                    {pinWarning && <p className="text-yellow-600 text-[10px] mt-1">{pinWarning}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">House No / Flat / Building</label>
                    <input name="house_no" placeholder="Flat 402, Signature Towers" value={newAddress.house_no} onChange={handleChange} required className="w-full bg-white text-gray-800 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#AC666D]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Area / Locality</label>
                    {postOffices.length > 0 ? (
                      <select
                        name="area"
                        value={selectedPostOffice || newAddress.area}
                        onChange={(e) => {
                          handleChange(e);
                          handleSelectLocality(e.target.value);
                        }}
                        required
                        className="w-full bg-white text-gray-800 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#AC666D]"
                      >
                        <option value="">Select Locality</option>
                        {postOffices.map((po, idx) => (
                          <option key={idx} value={po.Name}>{po.Name}</option>
                        ))}
                      </select>
                    ) : (
                      <input name="area" placeholder="Sector 15" value={newAddress.area} onChange={handleChange} required className="w-full bg-white text-gray-800 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#AC666D]" />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                    <input name="city" placeholder="New Delhi" value={newAddress.city} onChange={handleChange} required className="w-full bg-white text-gray-800 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#AC666D]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                    <input name="state" placeholder="Delhi" value={newAddress.state} onChange={handleChange} required className="w-full bg-white text-gray-800 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#AC666D]" />
                  </div>
                  
                  <div className="sm:col-span-2 flex gap-3 mt-2">
                    <button type="submit" className="bg-[#AC666D] hover:bg-[#96555b] text-white px-6 py-2 rounded font-medium text-sm transition-colors">
                      Save Address
                    </button>
                    <button type="button" onClick={() => setShowAddForm(false)} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded font-medium text-sm transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {addresses.length === 0 ? (
              <div className="text-center py-12 px-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                <FiMapPin className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">No addresses found</h3>
                <p className="text-xs text-gray-500 mb-4">You haven't saved any delivery addresses yet.</p>
                {!showAddForm && (
                  <button 
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    <FiPlus className="w-4 h-4" /> Add Address
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {addresses.map(addr => (
                  <div key={addr._id} className="bg-white border border-gray-200 hover:border-[#AC666D]/50 hover:shadow-sm transition-all p-5 rounded-lg flex flex-col relative group">
                    <div className="mb-3">
                      <span className="inline-block bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                        Home
                      </span>
                    </div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{addr.name}</p>
                    <p className="text-gray-600 text-xs font-medium mb-3">{addr.mobile}</p>
                    
                    <div className="text-gray-500 text-xs leading-relaxed mt-auto">
                      <p>{addr.house_no}, {addr.area}</p>
                      <p>{addr.city}, {addr.state ? addr.state + ' - ' : ''}{addr.pincode}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

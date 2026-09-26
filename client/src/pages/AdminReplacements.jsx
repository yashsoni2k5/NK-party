import { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { FiRefreshCw, FiArrowLeft, FiAlertTriangle, FiImage, FiPackage, FiUser } from 'react-icons/fi';

export default function AdminReplacements() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = () => {
    setLoading(true);
    api.get('/replacements')
      .then(res => setRequests(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await api.patch(`/replacements/${requestId}`, { status: newStatus });
      alert("Status updated successfully!");
      loadRequests();
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'text-orange-700 bg-orange-400/10 border-orange-400/30';
      case 'APPROVED': return 'text-blue-700 bg-blue-400/10 border-blue-400/30';
      case 'REJECTED': return 'text-red-600 bg-red-400/10 border-red-400/30';
      case 'REPLACED': return 'text-emerald-700 bg-emerald-400/10 border-emerald-400/30';
      default: return 'text-gray-800 bg-gray-400/10 border-gray-400/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex justify-center items-center text-[#AC666D]">
        <svg className="animate-spin h-10 w-10 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-bold text-lg text-gray-800">Loading replacement requests...</span>
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
              <FiRefreshCw className="text-[#AC666D]" /> Replacement Requests
            </h1>
            <p className="text-gray-800 text-sm">
              Review customer damage claims, inspect photos, and update replacement statuses.
            </p>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white border border-[#AC666D]/30 p-12 rounded-3xl text-center shadow-xl">
            <FiRefreshCw className="w-16 h-16 mx-auto text-[#AC666D]/40 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Replacement Requests</h2>
            <p className="text-gray-800 text-sm">No customers have submitted replacement requests.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map(req => (
              <div 
                key={req._id} 
                className="bg-white border border-[#AC666D]/30 rounded-3xl shadow-xl overflow-hidden hover:border-[#AC666D]/60 transition-colors"
              >
                {/* Header Info */}
                <div className="p-6 border-b border-[#AC666D]/20 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-800 uppercase tracking-widest">Request ID: {req._id}</p>
                    <p className="text-gray-800 font-mono font-bold text-sm sm:text-base">Order ID: {req.order?._id || req.order}</p>
                    <p className="text-xs text-gray-800 flex items-center gap-1">
                      <FiUser className="text-[#AC666D]" /> Customer: <span className="text-gray-800 font-semibold">{req.user?.name || req.user} ({req.user?.mobile})</span>
                    </p>
                  </div>

                  <div className="space-y-1 w-full sm:w-auto">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-800">Request Status</label>
                    <select 
                      value={req.status} 
                      onChange={(e) => handleStatusChange(req._id, e.target.value)}
                      className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:border-[#AC666D] cursor-pointer ${getStatusColor(req.status)}`}
                    >
                      <option value="PENDING" className="bg-white text-orange-700">PENDING</option>
                      <option value="APPROVED" className="bg-white text-blue-700">APPROVED</option>
                      <option value="REJECTED" className="bg-white text-red-600">REJECTED</option>
                      <option value="REPLACED" className="bg-white text-emerald-700">REPLACED</option>
                    </select>
                  </div>
                </div>
                
                {/* Body Details */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product & Reason */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[#AC666D] uppercase tracking-wider flex items-center gap-1.5">
                      <FiPackage /> Target Product
                    </h4>
                    <div className="flex items-center gap-4 bg-gray-100 p-3 rounded-2xl border border-[#AC666D]/20">
                      {req.product?.image ? (
                        <img src={req.product.image} alt="product" className="w-14 h-14 object-cover rounded-xl border border-[#AC666D]/20 shrink-0" />
                      ) : (
                        <div className="w-14 h-14 bg-black/50 rounded-xl flex items-center justify-center text-xs text-gray-800">No Img</div>
                      )}
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{req.product?.title || 'Unknown Product'}</p>
                        <p className="text-xs text-gray-800 font-mono">ID: {req.product?._id || req.product}</p>
                      </div>
                    </div>

                    <div className="bg-white border border-[#AC666D]/30 p-4 rounded-2xl space-y-2">
                      <h4 className="text-xs font-bold text-[#AC666D] uppercase tracking-wider flex items-center gap-1.5">
                        <FiAlertTriangle /> Claim Reason
                      </h4>
                      <p className="text-gray-800 text-xs sm:text-sm leading-relaxed">{req.reason}</p>
                    </div>
                  </div>
                  
                  {/* Image Proof */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#AC666D] uppercase tracking-wider flex items-center gap-1.5">
                      <FiImage /> Photo Proof
                    </h4>
                    {req.damageImageUrl ? (
                      <a 
                        href={req.damageImageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block group relative overflow-hidden rounded-2xl border border-[#AC666D]/30 max-w-xs"
                      >
                        <img 
                          src={req.damageImageUrl} 
                          alt="damage proof" 
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-[#AC666D]">
                          Click to View Full Image 🔍
                        </div>
                      </a>
                    ) : (
                      <div className="bg-gray-100 border border-dashed border-[#AC666D]/20 rounded-2xl p-6 text-center text-xs text-gray-800">
                        No image proof uploaded by customer.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}


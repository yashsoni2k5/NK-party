import { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiArrowLeft, FiMapPin, FiPackage, FiUser, FiFilter } from 'react-icons/fi';

export default function AdminAllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const loadOrders = () => {
    setLoading(true);
    api.get('/order/all')
      .then(res => setOrders(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/order/${orderId}`, { status: newStatus });
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      alert(error.message);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'text-orange-700 bg-orange-400/10 border-orange-400/30';
      case 'PROCESSING': return 'text-blue-700 bg-blue-400/10 border-blue-400/30';
      case 'SHIPPED': return 'text-purple-700 bg-purple-400/10 border-purple-400/30';
      case 'DELIVERED': return 'text-emerald-700 bg-emerald-400/10 border-emerald-400/30';
      case 'CANCELLED': return 'text-red-600 bg-red-400/10 border-red-400/30';
      default: return 'text-gray-800 bg-gray-400/10 border-gray-400/30';
    }
  };

  // Status counts calculation
  const statusCounts = {
    ALL: orders.length,
    PENDING: orders.filter(o => o.status === 'PENDING').length,
    PROCESSING: orders.filter(o => o.status === 'PROCESSING').length,
    SHIPPED: orders.filter(o => o.status === 'SHIPPED').length,
    DELIVERED: orders.filter(o => o.status === 'DELIVERED').length,
    CANCELLED: orders.filter(o => o.status === 'CANCELLED').length,
  };

  // Filtered orders based on selected status tab
  const filteredOrders = activeFilter === 'ALL'
    ? orders
    : orders.filter(o => o.status === activeFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex justify-center items-center text-[#AC666D]">
        <svg className="animate-spin h-10 w-10 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-bold text-lg text-gray-800">Loading platform orders...</span>
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
              <FiShoppingCart className="text-[#AC666D]" /> All Orders Management
            </h1>
            <p className="text-gray-800 text-sm">
              Review placed orders, filter by fulfillment status, and re-assign status tags.
            </p>
          </div>
        </div>

        {/* Status Classification Filter Tabs */}
        <div className="bg-white border border-[#AC666D]/30 p-4 rounded-3xl shadow-xl flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#AC666D] uppercase tracking-wider px-2 flex items-center gap-1.5 mr-2">
            <FiFilter /> Filter By Status:
          </span>
          {[
            { id: 'ALL', label: 'All Orders' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'PROCESSING', label: 'Processing' },
            { id: 'SHIPPED', label: 'Shipped' },
            { id: 'DELIVERED', label: 'Delivered' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all duration-200 border flex items-center gap-2 ${
                activeFilter === tab.id
                  ? 'bg-[#AC666D] text-white border-[#AC666D] shadow-lg scale-105'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-[#AC666D]/20 hover:border-[#AC666D]/50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeFilter === tab.id ? 'bg-white text-[#AC666D]' : 'bg-white text-[#AC666D]'
              }`}>
                {statusCounts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        {filteredOrders?.length === 0 ? (
          <div className="bg-white border border-[#AC666D]/30 p-12 rounded-3xl text-center shadow-xl">
            <FiShoppingCart className="w-16 h-16 mx-auto text-[#AC666D]/40 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Orders Found</h2>
            <p className="text-gray-800 text-sm">
              {activeFilter === 'ALL' 
                ? 'There are currently no customer orders placed on the platform.' 
                : `There are no customer orders currently classified as "${activeFilter}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders?.map(order => (
              <div 
                key={order._id} 
                className="bg-white border border-[#AC666D]/30 rounded-3xl shadow-xl overflow-hidden hover:border-[#AC666D]/60 transition-colors"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-[#AC666D]/20 bg-gray-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-800 uppercase tracking-widest">Order ID</p>
                    <p className="text-gray-800 font-mono font-bold text-sm sm:text-base">{order._id}</p>
                    <p className="text-xs text-gray-800 flex items-center gap-1 mt-1">
                      <FiUser className="text-[#AC666D]" /> User ID: <span className="font-mono text-gray-800">{order.user?._id || order.user}</span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-gray-800 uppercase tracking-wider">Total Value</p>
                      <p className="text-[#AC666D] font-extrabold text-xl">₹{order.total}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-800">Order Status</label>
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:border-[#AC666D] cursor-pointer ${getStatusColor(order.status)}`}
                      >
                        <option value="PENDING" className="bg-white text-orange-700">PENDING</option>
                        <option value="PROCESSING" className="bg-white text-blue-700">PROCESSING</option>
                        <option value="SHIPPED" className="bg-white text-purple-700">SHIPPED</option>
                        <option value="DELIVERED" className="bg-white text-emerald-700">DELIVERED</option>
                        <option value="CANCELLED" className="bg-white text-red-600">CANCELLED</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Delivery Address */}
                  {order.deliveryAddress ? (
                    <div className="bg-white border border-[#AC666D]/20 p-4 rounded-2xl space-y-2 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#AC666D] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                          <FiMapPin /> Delivery Address
                        </h4>
                        <p className="font-bold text-gray-800 text-sm">{order.deliveryAddress.name} ({order.deliveryAddress.mobile})</p>
                        <p className="text-gray-800 text-xs">{order.deliveryAddress.house_no}, {order.deliveryAddress.area}</p>
                        <p className="text-gray-800 text-xs">{order.deliveryAddress.city} - {order.deliveryAddress.pincode}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-[#AC666D]/20 p-4 rounded-2xl text-xs text-gray-800 flex items-center justify-center">
                      No delivery address attached
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="lg:col-span-2 space-y-3">
                    <h4 className="text-xs font-bold text-[#AC666D] uppercase tracking-wider flex items-center gap-1.5">
                      <FiPackage /> Ordered Products / Services
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {order.products?.map((item, i) => (
                        <div key={i} className="bg-gray-100 border border-[#AC666D]/10 p-3 rounded-xl flex items-center justify-between text-xs sm:text-sm">
                          <span className="font-semibold text-gray-800">
                            {item.product?.title || 'Unknown Product'} <span className="text-[#AC666D]">x{item.quantity}</span>
                          </span>
                          <span className="font-bold text-[#AC666D]">
                            ₹{item.priceAtPurchase * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
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



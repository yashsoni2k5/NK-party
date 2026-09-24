import { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/order')
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await api.patch(`/order/${orderId}/cancel`);
      alert("Order cancelled successfully.");
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel order");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'PROCESSING': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'SHIPPED': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      case 'DELIVERED': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'CANCELLED': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'REPLACEMENT_REQUESTED': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'REPLACED': return 'text-teal-400 bg-teal-400/10 border-teal-400/30';
      default: return 'text-[#FAF7F0] bg-gray-400/10 border-gray-400/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#003725] flex justify-center items-center text-[#E3BA63]">
        <svg className="animate-spin h-10 w-10 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-bold text-lg text-[#FAF7F0]">Loading your orders...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#003725] text-[#FAF7F0] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#FAF7F0] mb-8 flex items-center gap-3 pb-4 border-b border-[#E3BA63]/20">
          <span className="bg-[#E3BA63]/15 text-[#E3BA63] p-2 rounded-2xl border border-[#E3BA63]/30 text-xl sm:text-2xl">📦</span>
          Your Orders
        </h1>
        
        {orders?.length === 0 && (
          <div className="bg-[#011E15] border border-[#E3BA63]/30 p-12 rounded-3xl text-center shadow-xl">
            <div className="text-6xl mb-4">🛍️</div>
            <h2 className="text-2xl font-bold text-[#E3BA63] mb-2">No Orders Found</h2>
            <p className="text-[#FAF7F0] mb-6">Looks like you haven't placed any orders yet.</p>
            <Link to="/" className="bg-[#E3BA63] text-[#011E15] px-6 py-3 rounded-xl font-bold hover:bg-[#cda24d] transition-colors shadow-lg">
              Start Shopping
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {orders?.map(order => (
            <div key={order._id} className="bg-[#011E15] border border-[#E3BA63]/30 rounded-2xl shadow-xl overflow-hidden hover:border-[#E3BA63]/60 transition-colors duration-300">
              
              {/* Order Header */}
              <div className="p-5 sm:p-6 border-b border-[#E3BA63]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/20">
                <div>
                  <p className="text-xs font-semibold text-[#FAF7F0] uppercase tracking-widest mb-1">Order ID</p>
                  <p className="text-[#FAF7F0] font-mono text-sm sm:text-base">{order._id}</p>
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                    {order.status.replace(/_/g, ' ')}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#FAF7F0] uppercase tracking-wider">Total</p>
                    <p className="text-[#E3BA63] font-extrabold text-lg">₹{order.total}</p>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="p-5 sm:p-6 flex flex-col gap-5">
                {order.products?.map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-20 h-20 bg-black/40 rounded-xl overflow-hidden border border-[#E3BA63]/20 flex-shrink-0 flex items-center justify-center">
                      {item.product?.image ? (
                        <img src={item.product.image} alt="product" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[#FAF7F0] text-xs">No image</span>
                      )}
                    </div>
                    <div className="flex-grow">
                      <strong className="block text-[#FAF7F0] font-bold text-base mb-1">{item.product?.title || 'Product Unavailable'}</strong>
                      <div className="flex items-center gap-3 text-sm text-[#FAF7F0]">
                        <span>Qty: <span className="font-bold text-[#FAF7F0]">{item.quantity}</span></span>
                        <span>•</span>
                        <span>Price: <span className="font-bold text-[#E3BA63]">₹{item.priceAtPurchase}</span></span>
                      </div>
                    </div>
                    
                    {order.status === 'DELIVERED' && (
                      <a 
                        href={`https://wa.me/919999999999?text=${encodeURIComponent(`Hi, I want to contact for return and replacement regarding Order ID: ${order._id} for product: ${item.product?.title || 'Unknown Product'}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/50 rounded-xl text-xs font-bold transition-all mt-3 sm:mt-0 shadow-lg"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.592 6.592-6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                        </svg>
                        Contact for return
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="p-5 sm:p-6 border-t border-[#E3BA63]/20 bg-black/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-sm text-[#FAF7F0]">
                  <span className="font-semibold text-[#FAF7F0]">Delivering to:</span> {order.deliveryAddress?.house_no}, {order.deliveryAddress?.city}
                </div>
                
                {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                  <button 
                    onClick={() => handleCancelOrder(order._id)}
                    className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-xl font-bold transition-all text-sm w-full sm:w-auto"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

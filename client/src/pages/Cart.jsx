import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();
  
  const loadCart = async () => {
    try {
      const res = await api.get('/cart');
      setCartItems(res.data.cart || []);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQuantity = async (productId, type) => {
    setUpdatingId(productId);
    try {
      await api.patch(`/cart/${productId}/${type}`);
      await loadCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    setUpdatingId(productId);
    try {
      await api.delete(`/cart/${productId}`);
      await loadCart();
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex justify-center items-center text-[#AC666D]">
        <svg className="animate-spin h-10 w-10 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-bold text-lg text-gray-800">Loading your luxury cart...</span>
      </div>
    );
  }

  if (!cartItems?.length) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-16 px-4 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white border border-[#AC666D]/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
          <div className="text-6xl mb-6">🛒</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-3">Your Cart is Empty</h2>
          <p className="text-gray-800 mb-8 text-sm sm:text-base leading-relaxed">
            Looks like you haven't added any luxury items or party essentials to your shopping cart yet.
          </p>
          <button 
            onClick={() => navigate('/')} 
            className="w-full py-4 bg-[#AC666D] hover:bg-[#96555b] text-white font-extrabold text-base rounded-xl transition-all duration-200 shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            <span>🛍️</span>
            <span>Explore Products & Start Shopping</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#AC666D]/20">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-800 flex items-center gap-3">
            <span className="bg-[#AC666D]/15 text-[#AC666D] p-2 rounded-2xl border border-[#AC666D]/30 text-xl sm:text-2xl">🛒</span>
            Shopping Cart ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} Items)
          </h1>
          <Link to="/" className="text-xs sm:text-sm font-semibold text-[#AC666D] hover:underline flex items-center gap-1">
            <span>←</span> Continue Shopping
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Item List */}
          <div className="flex-1 space-y-4">
            {cartItems.map((item) => {
              const p = item.product || {};
              const isUpdating = updatingId === item.productId || updatingId === p._id;

              return (
                <div 
                  key={item._id} 
                  className="bg-white border border-[#AC666D]/30 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:border-[#AC666D]/60"
                >
                  {/* Image */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-100 rounded-xl overflow-hidden border border-[#AC666D]/20 flex-shrink-0 mx-auto sm:mx-0 flex items-center justify-center">
                    {p.image ? (
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-800 text-xs">No image</span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-1 line-clamp-1">
                      {p.title || "Product Unavailable"}
                    </h3>
                    <p className="text-[#AC666D] font-extrabold text-lg mb-2">
                      ₹{p.price || 0} <span className="text-xs text-gray-800 font-normal">/ unit</span>
                    </p>
                    <p className="text-xs text-emerald-700 font-medium">In Stock • Fast Delivery</p>
                  </div>

                  {/* Quantity & Action Controls */}
                  <div className="flex flex-col sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#AC666D]/10">
                    
                    {/* Quantity Adjustment Selector */}
                    <div className="flex items-center justify-center bg-gray-100 border border-[#AC666D]/40 rounded-xl p-1 shadow-inner">
                      <button 
                        onClick={() => handleUpdateQuantity(item.productId, 'dec')}
                        disabled={isUpdating}
                        title={item.quantity === 1 ? "Remove product" : "Decrease quantity"}
                        className="w-8 h-8 rounded-lg bg-[#FAFAFA] text-[#AC666D] hover:bg-[#AC666D] hover:text-white font-extrabold text-lg flex items-center justify-center transition-colors disabled:opacity-40"
                      >
                        -
                      </button>
                      
                      <span className="w-10 text-center font-extrabold text-gray-800 text-sm sm:text-base">
                        {isUpdating ? '...' : item.quantity}
                      </span>
                      
                      <button 
                        onClick={() => handleUpdateQuantity(item.productId, 'inc')}
                        disabled={isUpdating}
                        title="Increase quantity"
                        className="w-8 h-8 rounded-lg bg-[#FAFAFA] text-[#AC666D] hover:bg-[#AC666D] hover:text-white font-extrabold text-lg flex items-center justify-center transition-colors disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal & Delete */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full">
                      <span className="text-xs text-gray-800">
                        Total: <strong className="text-[#AC666D] font-bold text-sm">₹{(p.price || 0) * item.quantity}</strong>
                      </span>
                      
                      <button 
                        onClick={() => handleRemoveItem(item.productId)}
                        disabled={isUpdating}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline flex items-center gap-1 disabled:opacity-50"
                      >
                        <span>🗑️</span> Remove
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary Card */}
          <div className="w-full lg:w-96 bg-white border border-[#AC666D]/30 p-6 rounded-3xl shadow-2xl h-fit sticky top-24">
            <h2 className="text-xl font-extrabold text-[#AC666D] border-b border-[#AC666D]/20 pb-4 mb-4 flex items-center gap-2">
              <span>🧾</span> Cart Summary
            </h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-gray-800">
                <span>Items Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</span>
                <span className="font-semibold text-gray-800">₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-800">
                <span>Shipping & Delivery</span>
                <span className="text-emerald-700 font-bold">FREE</span>
              </div>
              <div className="border-t border-[#AC666D]/20 pt-3 flex justify-between items-end">
                <span className="text-base font-bold text-gray-800">Estimated Total</span>
                <span className="text-2xl font-extrabold text-[#AC666D]">₹{cartTotal}</span>
              </div>
            </div>

            {/* Minimum Order Warning */}
            {cartTotal < 500 && (
              <div className="bg-red-500/15 border border-red-500/30 p-3.5 rounded-xl mb-6 text-xs text-red-800 leading-relaxed flex items-start gap-2">
                <span className="text-base">⚠️</span>
                <div>
                  <strong>Minimum Order Value ₹500</strong>
                  <p>Add <strong>₹{500 - cartTotal}</strong> more to qualify for checkout.</p>
                </div>
              </div>
            )}

            {/* Checkout Button */}
            <button 
              onClick={() => navigate('/checkout')} 
              disabled={cartTotal < 500}
              className={`w-full py-4 rounded-xl font-extrabold text-base transition-all duration-200 shadow-xl flex items-center justify-center gap-2 ${
                cartTotal >= 500
                  ? 'bg-[#AC666D] hover:bg-[#96555b] text-white active:scale-95 cursor-pointer'
                  : 'bg-gray-800 text-gray-800 cursor-not-allowed border border-gray-300'
              }`}
            >
              {cartTotal >= 500 ? (
                <>
                  <span>⚡</span>
                  <span>Proceed to Checkout</span>
                </>
              ) : (
                <span>Add ₹{500 - cartTotal} More to Order</span>
              )}
            </button>

            <div className="mt-4 text-center">
              <span className="text-[11px] text-gray-800 uppercase tracking-widest flex items-center justify-center gap-1">
                <span className="text-[#AC666D]">🔒</span> 100% Safe & Secure Checkout
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

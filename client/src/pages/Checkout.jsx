import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const singleProductId = searchParams.get('productId');
  const initialQuantity = parseInt(searchParams.get('quantity') || '1', 10);

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  
  const [address, setAddress] = useState({
    name: '', mobile: '', house_no: '', area: '', city: '', pincode: ''
  });

  const fetchCheckoutData = async () => {
    setLoadingData(true);
    try {
      if (singleProductId) {
        const res = await api.get(`/products/${singleProductId}`);
        const qty = initialQuantity > 0 ? initialQuantity : 1;
        setCheckoutItems([{ product: res.data, quantity: qty }]);
        setTotal((res.data.price || 0) * qty);
      } else {
        const res = await api.get('/cart');
        const cart = res.data.cart || [];
        setCheckoutItems(cart);
        const cartTotal = cart.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
        setTotal(cartTotal);
      }
      
      const addrRes = await api.get('/address');
      setSavedAddresses(addrRes.data || []);
      if (addrRes.data && addrRes.data.length > 0) {
        setSelectedAddressId(addrRes.data[0]._id);
      }
      
      try {
        const userRes = await api.get('/users/me');
        if (userRes.data?.walletBalance) {
          setWalletBalance(userRes.data.walletBalance);
        }
      } catch (userErr) {
        console.error("Failed to fetch user balance:", userErr);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchCheckoutData();
  }, [singleProductId]);

  const handleQuantityChange = async (productId, type) => {
    if (singleProductId) {
      setCheckoutItems(prev => {
        const updated = prev.map(item => {
          if (item.product?._id === productId) {
            const newQty = type === 'inc' ? item.quantity + 1 : Math.max(1, item.quantity - 1);
            return { ...item, quantity: newQty };
          }
          return item;
        });
        const newTotal = updated.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
        setTotal(newTotal);
        return updated;
      });
    } else {
      try {
        await api.patch(`/cart/${productId}/${type}`);
        const res = await api.get('/cart');
        const cart = res.data.cart || [];
        setCheckoutItems(cart);
        const cartTotal = cart.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
        setTotal(cartTotal);
      } catch (err) {
        console.error("Failed to update quantity:", err);
      }
    }
  };

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (checkoutItems.length === 0) return alert('No items to checkout');
    if (total < 500) {
      return alert('Minimum order value is ₹500. Please add more products to continue.');
    }

    try {
      let finalAddressId = selectedAddressId;
      if (!selectedAddressId) {
        const addressRes = await api.post('/address', address);
        finalAddressId = addressRes.data._id;
      }

      const payableAmount = useWallet ? Math.max(0, total - walletBalance) : total;
      const usedWalletAmount = useWallet ? Math.min(total, walletBalance) : 0;

      const placeActualOrder = async (razorpayData = null) => {
        const productsPayload = checkoutItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        }));

        const payload = {
          deliveryAddress: finalAddressId,
          products: productsPayload,
          checkedOut: true
        };
        
        if (usedWalletAmount > 0) payload.usedWalletAmount = usedWalletAmount;
        if (razorpayData) {
          payload.razorpay_order_id = razorpayData.razorpay_order_id;
          payload.razorpay_payment_id = razorpayData.razorpay_payment_id;
          payload.razorpay_signature = razorpayData.razorpay_signature;
        }

        await api.post('/order', payload);

        if (!singleProductId) {
          await api.delete('/cart'); // Clear cart
        }

        alert('Payment Successful & Order placed securely!');
        navigate('/orders');
      };

      if (payableAmount === 0) {
        // Bypass Razorpay completely
        await placeActualOrder(null);
        return;
      }

      // Step 1: Create Secure Razorpay Order by passing products to backend
      const productsPayload = checkoutItems.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      }));
      
      const rzpOrderRes = await api.post('/payment/orders', { 
        products: productsPayload,
        usedWalletAmount
      });
      const rzpOrder = rzpOrderRes.data;

      // Step 2: Open Razorpay Checkout Modal
      const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_dummykey";
      
      const options = {
        key: rzpKey,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "Party Store",
        description: "Test Transaction",
        order_id: rzpOrder.id,
        handler: async function (response) {
          try {
            // Step 3: Create Actual Order (Signature is verified in the backend)
            await placeActualOrder({
              razorpay_order_id: response.razorpay_order_id || rzpOrder.id,
              razorpay_payment_id: response.razorpay_payment_id || "pay_dummy123",
              razorpay_signature: response.razorpay_signature || "dummy_sig"
            });
          } catch (verifyError) {
            alert(verifyError.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: "Test User",
          email: "test@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#000000"
        }
      };

      if (rzpKey === "rzp_test_dummykey") {
        // Mock successful payment for local testing without real keys
        alert("Mock Mode: Simulating successful Razorpay payment.");
        options.handler({});
      } else {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          alert("Payment failed: " + response.error.description);
        });
        rzp.open();
      }

    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#003725] flex justify-center items-center text-[#E3BA63]">
        <svg className="animate-spin h-8 w-8 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-bold">Loading secure checkout...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#003725] text-[#FAF7F0] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#FAF7F0] mb-8 flex items-center gap-3">
          <span className="bg-[#E3BA63]/15 text-[#E3BA63] p-2 rounded-xl border border-[#E3BA63]/30">🔒</span>
          Secure Checkout
        </h1>
        
        {total < 500 && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-300 p-4 rounded-xl mb-8 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <strong className="block font-bold mb-1">Attention Required</strong>
              <p className="text-sm">Minimum order value is ₹500. Your current total is ₹{total}. You must add more items to place an order.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Order Summary */}
          <div className="flex-1 lg:max-w-md bg-[#011E15] border border-[#E3BA63]/30 p-6 rounded-2xl shadow-xl h-fit sticky top-24">
            <h2 className="text-xl font-bold text-[#E3BA63] border-b border-[#E3BA63]/20 pb-4 mb-4 flex items-center gap-2">
              <span>🛒</span> Order Summary
            </h2>
            <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {checkoutItems.map((item, idx) => {
                const prodId = item.product?._id || item.productId;
                return (
                  <div key={idx} className="flex gap-4 border-b border-[#E3BA63]/10 pb-4 last:border-0 last:pb-0 items-center">
                    {item.product?.image ? (
                      <img src={item.product.image} alt={item.product.title} className="w-20 h-20 object-cover rounded-lg border border-[#E3BA63]/20 flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 bg-black/40 rounded-lg border border-[#E3BA63]/20 flex items-center justify-center text-xs text-[#FAF7F0] flex-shrink-0">No Image</div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold text-sm sm:text-base text-[#FAF7F0] mb-1 leading-tight">{item.product?.title}</h4>
                      <p className="text-[#E3BA63] font-extrabold text-sm mb-2">₹{item.product?.price}</p>
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#FAF7F0]">Qty:</span>
                        <div className="flex items-center bg-black/40 border border-[#E3BA63]/30 rounded-lg p-0.5">
                          <button 
                            type="button"
                            onClick={() => handleQuantityChange(prodId, 'dec')}
                            className="w-6 h-6 rounded bg-[#003725] text-[#E3BA63] hover:bg-[#E3BA63] hover:text-[#011E15] font-bold text-sm flex items-center justify-center transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-bold text-[#FAF7F0] text-xs">
                            {item.quantity}
                          </span>
                          <button 
                            type="button"
                            onClick={() => handleQuantityChange(prodId, 'inc')}
                            className="w-6 h-6 rounded bg-[#003725] text-[#E3BA63] hover:bg-[#E3BA63] hover:text-[#011E15] font-bold text-sm flex items-center justify-center transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-[#E3BA63]/20 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#FAF7F0]">Subtotal</span>
                <span className="font-bold text-[#E3BA63]">₹{total}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-y border-[#E3BA63]/10">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="useWallet" 
                    checked={useWallet}
                    onChange={(e) => setUseWallet(e.target.checked)}
                    disabled={walletBalance <= 0}
                    className="w-4 h-4 accent-[#E3BA63] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="useWallet" className={`text-sm cursor-pointer ${walletBalance > 0 ? 'text-[#FAF7F0]' : 'text-[#FAF7F0]'}`}>
                    Use Wallet Points (₹{walletBalance || 0} available)
                  </label>
                </div>
                {useWallet && walletBalance > 0 && (
                  <span className="text-sm font-bold text-red-400">
                    - ₹{Math.min(total, walletBalance)}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-end pt-2">
                <span className="text-[#FAF7F0] font-bold">Payable Amount</span>
                <span className="text-2xl font-extrabold text-[#E3BA63]">
                  ₹{useWallet ? Math.max(0, total - walletBalance) : total}
                </span>
              </div>
              <p className="text-[10px] text-[#FAF7F0] text-right uppercase tracking-wider flex items-center justify-end gap-1">
                <span className="text-[#E3BA63]">✓</span> Secure Backend Verification
              </p>
            </div>
          </div>

          {/* Address Form */}
          <div className="flex-[2] bg-[#011E15] border border-[#E3BA63]/30 p-6 sm:p-8 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold text-[#E3BA63] border-b border-[#E3BA63]/20 pb-4 mb-6 flex items-center gap-2">
              <span>📍</span> Delivery Address
            </h2>
            <form onSubmit={handlePlaceOrder} className="flex flex-col gap-6">
              
              {savedAddresses.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-[#FAF7F0] mb-2">Select Saved Address</label>
                  <select 
                    value={selectedAddressId} 
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="w-full bg-[#011E15] text-[#FAF7F0] border border-[#E3BA63]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3BA63] appearance-none cursor-pointer"
                  >
                    <option value="">-- Or enter a new address below --</option>
                    {savedAddresses.map(addr => (
                      <option key={addr._id} value={addr._id}>
                        {addr.name} - {addr.house_no}, {addr.city} ({addr.pincode})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!selectedAddressId && (
                <div className={`flex flex-col gap-4 ${savedAddresses.length > 0 ? 'border-t border-[#E3BA63]/20 pt-6 mt-2' : ''}`}>
                  <h3 className="text-lg font-bold text-[#FAF7F0] mb-2">Add New Address</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#FAF7F0] mb-1">Full Name</label>
                      <input name="name" placeholder="Full Name" value={address.name} onChange={handleChange} required className="w-full bg-[#011E15] text-[#FAF7F0] border border-[#E3BA63]/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#E3BA63] placeholder-gray-500"/>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#FAF7F0] mb-1">Mobile Number</label>
                      <input name="mobile" placeholder="10-digit mobile" value={address.mobile} onChange={handleChange} required className="w-full bg-[#011E15] text-[#FAF7F0] border border-[#E3BA63]/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#E3BA63] placeholder-gray-500"/>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#FAF7F0] mb-1">House No / Flat</label>
                      <input name="house_no" placeholder="House Number" value={address.house_no} onChange={handleChange} required className="w-full bg-[#011E15] text-[#FAF7F0] border border-[#E3BA63]/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#E3BA63] placeholder-gray-500"/>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#FAF7F0] mb-1">Area / Locality</label>
                      <input name="area" placeholder="Area / Locality" value={address.area} onChange={handleChange} required className="w-full bg-[#011E15] text-[#FAF7F0] border border-[#E3BA63]/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#E3BA63] placeholder-gray-500"/>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#FAF7F0] mb-1">City</label>
                      <input name="city" placeholder="City" value={address.city} onChange={handleChange} required className="w-full bg-[#011E15] text-[#FAF7F0] border border-[#E3BA63]/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#E3BA63] placeholder-gray-500"/>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#FAF7F0] mb-1">Pincode</label>
                      <input name="pincode" type="number" placeholder="6-digit PIN" value={address.pincode} onChange={handleChange} required className="w-full bg-[#011E15] text-[#FAF7F0] border border-[#E3BA63]/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#E3BA63] placeholder-gray-500"/>
                    </div>
                  </div>
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={total < 500}
                className={`w-full py-4 mt-4 rounded-xl text-lg font-extrabold transition-all duration-200 shadow-lg flex items-center justify-center gap-2 ${
                  total >= 500 
                    ? 'bg-[#E3BA63] hover:bg-[#cda24d] text-[#011E15] active:scale-[0.98] cursor-pointer' 
                    : 'bg-gray-700 text-[#FAF7F0] cursor-not-allowed border border-gray-600'
                }`}
              >
                {total >= 500 ? (
                  <>
                    <span>💳</span> {useWallet && Math.max(0, total - walletBalance) === 0 ? "Place Order using Wallet" : `Place Secure Order (₹${useWallet ? Math.max(0, total - walletBalance) : total})`}
                  </>
                ) : (
                  'Add more items (Min ₹500)'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

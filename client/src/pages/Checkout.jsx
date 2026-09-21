import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const singleProductId = searchParams.get('productId');

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  
  const [address, setAddress] = useState({
    name: '', mobile: '', house_no: '', area: '', city: '', pincode: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        if (singleProductId) {
          const res = await api.get(`/products/${singleProductId}`);
          setCheckoutItems([{ product: res.data, quantity: 1 }]);
          setTotal(res.data.price);
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [singleProductId]);

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

      // Step 1: Create Razorpay Order
      const rzpOrderRes = await api.post('/payment/orders', { amount: total });
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
            // Step 3: Verify Signature
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id || rzpOrder.id,
              razorpay_payment_id: response.razorpay_payment_id || "pay_dummy123",
              razorpay_signature: response.razorpay_signature || "dummy_sig"
            });

            // Step 4: Create Actual Order
            const productsPayload = checkoutItems.map(item => ({
              product: item.product._id,
              quantity: item.quantity
            }));

            await api.post('/order', {
              deliveryAddress: finalAddressId,
              products: productsPayload,
              checkedOut: true
            });

            if (!singleProductId) {
              await api.delete('/cart'); // Clear cart
            }

            alert('Payment Successful & Order placed securely!');
            navigate('/orders');
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

  if (loadingData) return <div style={{ padding: '2rem' }}>Loading secure checkout...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Secure Checkout</h1>
      
      {total < 500 && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '1rem', borderRadius: '4px', marginBottom: '2rem' }}>
          <strong>Attention:</strong> Minimum order value is ₹500. Your current total is ₹{total}. You must add more items to place an order.
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Order Summary */}
        <div style={{ flex: '1 1 400px', border: '1px solid #e0e0e0', padding: '1.5rem', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
          <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Order Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
            {checkoutItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                {item.product?.image && <img src={item.product.image} alt={item.product.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />}
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{item.product?.title}</h4>
                  <p style={{ margin: 0, color: '#666' }}>Price: ₹{item.product?.price}</p>
                  <p style={{ margin: '0.2rem 0 0 0' }}>Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <h3 style={{ marginTop: '1.5rem', fontSize: '1.5rem' }}>Total: ₹{total}</h3>
          <p style={{ fontSize: '12px', color: 'gray' }}>
            Final price verified and calculated securely by the backend.
          </p>
        </div>

        {/* Address Form */}
        <div style={{ flex: '1 1 400px', border: '1px solid #e0e0e0', padding: '1.5rem', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Delivery Address</h2>
          <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            
            {savedAddresses.length > 0 && (
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Select Saved Address</label>
                <select 
                  value={selectedAddressId} 
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  style={{ padding: '0.8rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', borderTop: savedAddresses.length > 0 ? '1px solid #eee' : 'none', paddingTop: savedAddresses.length > 0 ? '1rem' : '0' }}>
                <h3 style={{ margin: 0 }}>Add New Address</h3>
                <input name="name" placeholder="Full Name" value={address.name} onChange={handleChange} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}/>
                <input name="mobile" placeholder="Mobile Number" value={address.mobile} onChange={handleChange} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}/>
                <input name="house_no" placeholder="House Number" value={address.house_no} onChange={handleChange} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}/>
                <input name="area" placeholder="Area / Locality" value={address.area} onChange={handleChange} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}/>
                <input name="city" placeholder="City" value={address.city} onChange={handleChange} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}/>
                <input name="pincode" type="number" placeholder="Pincode" value={address.pincode} onChange={handleChange} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}/>
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={total < 500}
              style={{ 
                padding: '1rem', 
                background: total >= 500 ? 'black' : '#ccc', 
                color: 'white', 
                marginTop: '1rem',
                border: 'none',
                borderRadius: '4px',
                cursor: total >= 500 ? 'pointer' : 'not-allowed',
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              {total >= 500 ? 'Place Secure Order' : 'Add more items (Min ₹500)'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

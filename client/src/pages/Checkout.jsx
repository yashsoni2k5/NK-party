import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get('productId');

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  
  // State for creating a new address if they don't have one
  const [address, setAddress] = useState({
    name: '',
    mobile: '',
    house_no: '',
    area: '',
    city: '',
    pincode: ''
  });

  useEffect(() => {
    // Load Product
    if (productId) {
      api.get(`/products/${productId}`).then(res => setProduct(res.data)).catch(console.error);
    }
    
    // Load Saved Addresses
    api.get('/address').then(res => {
      setSavedAddresses(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedAddressId(res.data[0]._id); // Default select the first one
      }
    }).catch(console.error);
  }, [productId]);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!productId) return alert('No product selected');

    try {
      let finalAddressId = selectedAddressId;

      // If they are filling out a new address instead of selecting
      if (!selectedAddressId) {
        const addressRes = await api.post('/address', address);
        finalAddressId = addressRes.data._id;
      }

      await api.post('/order', {
        deliveryAddress: finalAddressId,
        products: [{ product: productId, quantity: Number(quantity) }],
        checkedOut: true
      });

      alert('Order placed securely successfully!');
      navigate('/orders');
    } catch (error) {
      alert(error.message);
    }
  };

  if (!product) return <div>Loading secure checkout...</div>;

  return (
    <div>
      <h1>Secure Checkout</h1>
      <div style={{ display: 'flex', gap: '2rem' }}>
        
        {/* Order Summary */}
        <div style={{ flex: 1, border: '1px solid #ccc', padding: '1rem' }}>
          <h2>Order Summary</h2>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            {product.image && <img src={product.image} alt={product.title} style={{ width: '100px' }} />}
            <div>
              <h3>{product.title}</h3>
              <p>Price: ₹{product.price}</p>
              <div style={{ marginTop: '0.5rem' }}>
                <label>Quantity: </label>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)} 
                  style={{ width: '50px' }} 
                />
              </div>
            </div>
          </div>
          <hr style={{ margin: '1rem 0' }} />
          <h3>Total Estimated: ₹{product.price * quantity}</h3>
          <p style={{ fontSize: '12px', color: 'gray' }}>
            Final price will be verified and calculated securely by the backend.
          </p>
        </div>

        {/* Address Form */}
        <div style={{ flex: 1, border: '1px solid #ccc', padding: '1rem' }}>
          <h2>Delivery Address</h2>
          <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {savedAddresses.length > 0 && (
              <div>
                <h3>Select Saved Address</h3>
                <select 
                  value={selectedAddressId} 
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  style={{ padding: '0.5rem', width: '100%' }}
                >
                  <option value="">-- Or enter a new address below --</option>
                  {savedAddresses.map(addr => (
                    <option key={addr._id} value={addr._id}>
                      {addr.name} - {addr.house_no}, {addr.city} ({addr.pincode})
                    </option>
                  ))}
                </select>
                {selectedAddressId && <p style={{ color: 'green', marginTop: '0.5rem' }}>Will use selected address.</p>}
              </div>
            )}

            {!selectedAddressId && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                <h3>Add New Address</h3>
                <input name="name" placeholder="Full Name" value={address.name} onChange={handleChange} required />
                <input name="mobile" placeholder="Mobile Number" value={address.mobile} onChange={handleChange} required />
                <input name="house_no" placeholder="House Number" value={address.house_no} onChange={handleChange} required />
                <input name="area" placeholder="Area / Locality" value={address.area} onChange={handleChange} required />
                <input name="city" placeholder="City" value={address.city} onChange={handleChange} required />
                <input name="pincode" type="number" placeholder="Pincode" value={address.pincode} onChange={handleChange} required />
              </div>
            )}
            
            <button type="submit" style={{ padding: '1rem', background: 'black', color: 'white', marginTop: '1rem' }}>
              Place Secure Order
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

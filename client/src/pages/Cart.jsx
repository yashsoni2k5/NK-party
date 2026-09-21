import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  
  const loadCart = () => {
    api.get('/cart').then(res => setCartItems(res.data.cart || [])).catch(console.error);
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (productId, type) => {
    try {
      await api.patch(`/cart/${productId}/${type}`);
      loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`);
      loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  const checkout = () => {
    navigate('/checkout'); // Let the Checkout page handle fetching cart items and addresses
  };

  if (!cartItems?.length) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto', textAlign: 'center', padding: '3rem', border: '1px solid #eee', borderRadius: '8px' }}>
        <h2>Your Cart is Empty</h2>
        <button onClick={() => navigate('/')} style={{ marginTop: '1rem', padding: '0.8rem 1.5rem', background: 'black', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Continue Shopping
        </button>
      </div>
    );
  }

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Your Cart</h1>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        <div style={{ flex: '1 1 600px' }}>
          {cartItems.map(item => (
            <div key={item._id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', border: '1px solid #e0e0e0', padding: '1rem', borderRadius: '8px', alignItems: 'center', backgroundColor: '#fff' }}>
              {item.product?.image && <img src={item.product.image} alt={item.product.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />}
              <div style={{ flexGrow: 1 }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{item.product?.title}</h3>
                <p style={{ margin: 0, fontWeight: 'bold' }}>₹{item.product?.price}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={() => updateQuantity(item.productId, 'dec')} style={{ width: '30px', height: '30px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>-</button>
                <span style={{ width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, 'inc')} style={{ width: '30px', height: '30px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>+</button>
              </div>
              <button onClick={() => removeItem(item.productId)} style={{ marginLeft: '1rem', border: 'none', background: '#ffebee', color: '#c62828', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <div style={{ flex: '1 1 300px', border: '1px solid #e0e0e0', padding: '1.5rem', borderRadius: '8px', height: 'fit-content', backgroundColor: '#f9f9f9' }}>
          <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', margin: '0 0 1rem 0' }}>Summary</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>Subtotal:</span>
            <strong>₹{cartTotal}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
            <span>Delivery Fee:</span>
            <span style={{ color: 'green' }}>Free</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
            <span>Total:</span>
            <span>₹{cartTotal}</span>
          </div>

          {cartTotal < 500 && (
            <p style={{ color: '#c62828', fontSize: '0.9rem', marginBottom: '1rem' }}>
              You need to add ₹{500 - cartTotal} more to reach the minimum order value of ₹500.
            </p>
          )}

          <button 
            onClick={checkout} 
            disabled={cartTotal < 500}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              background: cartTotal >= 500 ? 'black' : '#ccc', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: cartTotal >= 500 ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            {cartTotal >= 500 ? 'Proceed to Checkout' : 'Add more items'}
          </button>
        </div>

      </div>
    </div>
  );
}

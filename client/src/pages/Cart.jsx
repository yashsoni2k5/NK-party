import { useState, useEffect } from 'react';
import api from '../api';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  
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

  const checkout = async () => {
    try {
      const addressRes = await api.get('/address');
      const addresses = addressRes.data;
      if (!addresses || addresses.length === 0) {
        alert("Please add a delivery address in your profile first!");
        return;
      }
      
      await api.post('/order', { addressId: addresses[0]._id });
      await api.delete('/cart');
      
      alert('Order placed successfully!');
      loadCart();
    } catch (error) {
      alert(error.message);
    }
  };

  if (!cartItems?.length) return <div>Cart is empty</div>;

  return (
    <div>
      <h1>Your Cart</h1>
      {cartItems.map(item => (
        <div key={item._id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', border: '1px solid #eee', padding: '1rem' }}>
          <div>
            <h3>{item.product?.title}</h3>
            <p>₹{item.product?.price}</p>
          </div>
          <div>
            <button onClick={() => updateQuantity(item.productId, 'dec')}>-</button>
            <span style={{ margin: '0 1rem' }}>{item.quantity}</span>
            <button onClick={() => updateQuantity(item.productId, 'inc')}>+</button>
            <button onClick={() => removeItem(item.productId)} style={{ marginLeft: '1rem' }}>Remove</button>
          </div>
        </div>
      ))}
      <button onClick={checkout} style={{ padding: '1rem', background: 'black', color: 'white' }}>
        Checkout
      </button>
    </div>
  );
}

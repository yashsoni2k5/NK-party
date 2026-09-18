import { useState, useEffect } from 'react';
import api from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/order').then(res => setOrders(res.data)).catch(console.error);
  }, []);

  return (
    <div>
      <h1>Your Orders</h1>
      {orders?.length === 0 && <p>No orders found.</p>}
      {orders?.map(order => (
        <div key={order._id} style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
          <p>Order ID: {order._id}</p>
          <p>Status: {order.status}</p>
          <p>Total: ₹{order.total}</p>
          <hr />
          {order.products?.map((item, i) => (
            <div key={i}>
              {item.product?.title} (x{item.quantity})
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

import { useState, useEffect } from 'react';
import api from '../api';

export default function AdminAllOrders() {
  const [orders, setOrders] = useState([]);

  const loadOrders = () => {
    api.get('/order/all').then(res => setOrders(res.data || [])).catch(console.error);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/order/${orderId}`, { status: newStatus });
      // Update local state without full reload
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h1>All Platform Orders (Admin)</h1>
      {orders?.length === 0 && <p>No orders found.</p>}
      {orders?.map(order => (
        <div key={order._id} style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>User ID:</strong> {order.user?._id || order.user}</p>
              <p><strong>Total:</strong> ₹{order.total}</p>
            </div>
            <div>
              <label style={{ fontWeight: 'bold' }}>Update Status: </label>
              <select 
                value={order.status} 
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                style={{ padding: '0.5rem', marginLeft: '0.5rem' }}
              >
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>
          
          {order.deliveryAddress && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9f9f9' }}>
              <strong>Delivery Address:</strong>
              <p>{order.deliveryAddress.name} | {order.deliveryAddress.mobile}</p>
              <p>{order.deliveryAddress.house_no}, {order.deliveryAddress.area}</p>
              <p>{order.deliveryAddress.city} - {order.deliveryAddress.pincode}</p>
            </div>
          )}

          <hr style={{ margin: '1rem 0' }} />
          <strong>Items:</strong>
          {order.products?.map((item, i) => (
            <div key={i} style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
              Product: {item.product?.title || item.product} (x{item.quantity}) - ₹{item.priceAtPurchase} each
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

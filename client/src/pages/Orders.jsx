import { useState, useEffect } from 'react';
import api from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Replacement State
  const [replacingItem, setReplacingItem] = useState(null); // { orderId, productId }
  const [replacementReason, setReplacementReason] = useState('');
  const [replacementImage, setReplacementImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const submitReplacement = async (e) => {
    e.preventDefault();
    if (!replacementImage) return alert("Please upload a picture of the damage.");
    
    setUploadingImage(true);
    try {
      // 1. Upload Image
      const formData = new FormData();
      formData.append('image', replacementImage);
      
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const imageUrl = uploadRes.data.secure_url;
      
      // 2. Submit Replacement Request
      await api.post('/replacements', {
        orderId: replacingItem.orderId,
        productId: replacingItem.productId,
        reason: replacementReason,
        damageImageUrl: imageUrl
      });

      alert("Replacement requested successfully!");
      setReplacingItem(null);
      setReplacementReason('');
      setReplacementImage(null);
      fetchOrders();

    } catch (error) {
      alert(error.response?.data?.message || "Failed to request replacement");
    } finally {
      setUploadingImage(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'orange';
      case 'PROCESSING': return 'blue';
      case 'SHIPPED': return 'purple';
      case 'DELIVERED': return 'green';
      case 'CANCELLED': return 'red';
      case 'REPLACEMENT_REQUESTED': return 'darkorange';
      case 'REPLACED': return 'teal';
      default: return 'gray';
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your orders...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Your Orders</h1>
      {orders?.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', border: '1px solid #eee', borderRadius: '8px' }}>
          <p style={{ color: '#666' }}>You have not placed any orders yet.</p>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {orders?.map(order => (
          <div key={order._id} style={{ border: '1px solid #e0e0e0', padding: '1.5rem', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div>
                <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>Order ID: {order._id}</p>
                <h3 style={{ margin: 0, color: getStatusColor(order.status) }}>{order.status.replace(/_/g, ' ')}</h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>Total Amount</p>
                <h3 style={{ margin: 0 }}>₹{order.total}</h3>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {order.products?.map((item, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {item.product?.image && <img src={item.product.image} alt="product" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />}
                    <div style={{ flexGrow: 1 }}>
                      <strong style={{ display: 'block' }}>{item.product?.title || 'Product Unavailable'}</strong>
                      <span style={{ color: '#666', fontSize: '0.9rem' }}>Qty: {item.quantity} | Price at purchase: ₹{item.priceAtPurchase}</span>
                    </div>
                    
                    {order.status === 'DELIVERED' && (
                      <button 
                        onClick={() => setReplacingItem({ orderId: order._id, productId: item.product._id })}
                        style={{ padding: '0.4rem 0.8rem', background: '#e3f2fd', color: '#1976d2', border: '1px solid #bbdefb', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Replace Item
                      </button>
                    )}
                  </div>

                  {replacingItem?.orderId === order._id && replacingItem?.productId === item.product._id && (
                    <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px', border: '1px solid #eee', marginTop: '0.5rem' }}>
                      <h4 style={{ margin: '0 0 1rem 0' }}>Request Replacement</h4>
                      <form onSubmit={submitReplacement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <textarea 
                          placeholder="Please describe the damage or issue..."
                          value={replacementReason}
                          onChange={(e) => setReplacementReason(e.target.value)}
                          required
                          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px', fontFamily: 'inherit' }}
                        />
                        <div>
                          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#555' }}>Upload Image Proof:</label>
                          <input type="file" accept="image/*" onChange={(e) => setReplacementImage(e.target.files[0])} required />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <button type="submit" disabled={uploadingImage} style={{ padding: '0.5rem 1rem', background: 'black', color: 'white', border: 'none', borderRadius: '4px', cursor: uploadingImage ? 'not-allowed' : 'pointer' }}>
                            {uploadingImage ? 'Uploading & Submitting...' : 'Submit Request'}
                          </button>
                          <button type="button" onClick={() => setReplacingItem(null)} style={{ padding: '0.5rem 1rem', background: 'white', color: 'black', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                Delivering to: {order.deliveryAddress?.house_no}, {order.deliveryAddress?.city}
              </p>
              {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                <button 
                  onClick={() => handleCancelOrder(order._id)}
                  style={{ padding: '0.6rem 1rem', background: '#fff', color: '#c62828', border: '1px solid #c62828', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

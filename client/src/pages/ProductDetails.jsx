import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api.get(`/products/${id}`).then(res => setProduct(res.data)).catch(console.error);
  }, [id]);

  const addToCart = async () => {
    try {
      await api.post(`/cart/${id}`);
      alert('Added to cart!');
      navigate('/cart');
    } catch (error) {
      alert(error.message);
    }
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div>
      <h1>{product.title}</h1>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 1 }}>
          {product.image && (
            <img src={product.image} alt={product.title} style={{ width: '100%', maxWidth: '300px' }} />
          )}
        </div>
        <div style={{ flex: 2 }}>
          <h2>₹{product.price}</h2>
          <p>{product.description}</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={addToCart} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
              Add to Cart
            </button>
            <button 
              onClick={() => navigate(`/checkout?productId=${product._id}`)} 
              style={{ padding: '0.5rem 1rem', cursor: 'pointer', background: '#333', color: 'white' }}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

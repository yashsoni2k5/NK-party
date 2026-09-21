import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  
  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProduct = () => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    try {
      await api.post(`/cart/${id}`);
      alert('Added to cart!');
      navigate('/cart');
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to review");
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/review`, { rating, comment });
      setComment('');
      setRating(5);
      alert("Review submitted successfully!");
      fetchProduct(); // Reload product to show the new review
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading product details...</div>;

  const hasReviewed = product.reviews?.some(r => r.user?._id === user?._id || r.user === user?._id);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      
      {/* Product Top Section */}
      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
        <div style={{ flex: '1 1 400px' }}>
          {product.image ? (
            <img src={product.image} alt={product.title} style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '400px', backgroundColor: '#eee', borderRadius: '8px' }}></div>
          )}
        </div>
        
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ margin: '0 0 1rem 0' }}>{product.title}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: '#4caf50', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>
              {product.averageRating ? product.averageRating.toFixed(1) : 0} ★
            </div>
            <span style={{ color: '#666' }}>{product.reviews?.length || 0} Ratings</span>
          </div>
          
          <h2 style={{ fontSize: '2rem', margin: '0 0 1rem 0' }}>₹{product.price}</h2>
          <p style={{ color: '#444', lineHeight: '1.6', flexGrow: 1 }}>{product.description || "No description available."}</p>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              onClick={addToCart} 
              style={{ flex: 1, padding: '1rem', fontSize: '1.1rem', cursor: 'pointer', background: '#fff', border: '1px solid black', borderRadius: '4px', fontWeight: 'bold' }}
            >
              Add to Cart
            </button>
            <button 
              onClick={() => navigate(`/checkout?productId=${product._id}`)} 
              style={{ flex: 1, padding: '1rem', fontSize: '1.1rem', cursor: 'pointer', background: 'black', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #eee', marginBottom: '3rem' }} />

      {/* Reviews Section */}
      <div>
        <h2 style={{ marginBottom: '2rem' }}>Product Reviews</h2>
        
        {/* Write a Review */}
        {user && !hasReviewed && (
          <div style={{ border: '1px solid #e0e0e0', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Write a Review</h3>
            <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ marginRight: '1rem' }}>Rating:</label>
                <select value={rating} onChange={(e) => setRating(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>
              <textarea 
                placeholder="What did you like or dislike about this product?" 
                value={comment} 
                onChange={(e) => setComment(e.target.value)} 
                required 
                style={{ width: '100%', minHeight: '100px', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit' }}
              />
              <button 
                type="submit" 
                disabled={submitting}
                style={{ alignSelf: 'flex-start', padding: '0.8rem 2rem', background: 'black', color: 'white', border: 'none', borderRadius: '4px', cursor: submitting ? 'not-allowed' : 'pointer' }}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}

        {user && hasReviewed && (
          <p style={{ color: 'green', marginBottom: '2rem' }}>✓ You have already reviewed this product.</p>
        )}

        {!user && (
          <p style={{ marginBottom: '2rem' }}>Please <a href="/login" style={{ color: '#007bff' }}>login</a> to write a review.</p>
        )}

        {/* Existing Reviews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {product.reviews?.length === 0 ? (
            <p style={{ color: '#666' }}>No reviews yet. Be the first to review!</p>
          ) : (
            product.reviews?.map((r, i) => (
              <div key={i} style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <div style={{ background: r.rating >= 3 ? '#4caf50' : '#f44336', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {r.rating} ★
                  </div>
                  <strong style={{ color: '#333' }}>User {r.user?.name || ''}</strong>
                </div>
                <p style={{ margin: 0, color: '#444', lineHeight: '1.5' }}>{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

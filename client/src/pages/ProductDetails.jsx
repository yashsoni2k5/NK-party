import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  
  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    setAddingToCart(true);
    try {
      await api.post(`/cart/${id}`, { quantity: selectedQuantity });
      setAddedSuccess(true);
      setTimeout(() => {
        setAddedSuccess(false);
        navigate('/cart');
      }, 1000);
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Please login to add items to your cart.');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || error.message || "Failed to add to cart");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to review");
      return navigate('/login');
    }
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/review`, { rating, comment });
      setComment('');
      setRating(5);
      alert("Review submitted successfully!");
      fetchProduct();
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#E3BA63]">
        <svg className="animate-spin h-10 w-10 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg font-medium text-[#FAF7F0]">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-[#FAF7F0] mb-4">Product Not Found</h2>
        <p className="text-[#FAF7F0] mb-6">The requested product could not be loaded or doesn't exist.</p>
        <Link to="/" className="bg-[#E3BA63] text-[#011E15] px-6 py-2.5 rounded-xl font-bold hover:bg-[#cda24d] transition-colors">
          Back to Store
        </Link>
      </div>
    );
  }

  const hasReviewed = product.reviews?.some(r => r.user?._id === user?._id || r.user === user?._id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 text-[#FAF7F0]">
      
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-[#FAF7F0] flex items-center gap-2">
        <Link to="/" className="hover:text-[#E3BA63] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[#E3BA63] capitalize">{product.itemType?.toLowerCase() || 'product'}</span>
        <span>/</span>
        <span className="text-[#FAF7F0] truncate max-w-xs">{product.title}</span>
      </div>

      {/* Product Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16 bg-[#011E15] border border-[#E3BA63]/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        
        {/* Product Image */}
        <div className="flex items-center justify-center bg-black/40 rounded-2xl overflow-hidden border border-[#E3BA63]/20 p-4 min-h-[350px] sm:min-h-[420px]">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.title} 
              className="w-full h-full object-contain max-h-[450px] rounded-xl hover:scale-105 transition-transform duration-500 ease-out" 
            />
          ) : (
            <div className="text-[#FAF7F0] flex flex-col items-center gap-2">
              <span className="text-5xl">📷</span>
              <span>No image available</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            {/* Category & Badge */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest bg-[#E3BA63]/15 text-[#E3BA63] border border-[#E3BA63]/40 px-3 py-1 rounded-full">
                {product.category || 'General'}
              </span>
              <span className="text-xs font-semibold text-[#FAF7F0] uppercase tracking-wider">
                {product.itemType === 'SERVICE' ? '🎉 Party Service' : '📦 Product'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#FAF7F0] mb-3 leading-tight">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#E3BA63] text-[#011E15] px-2.5 py-0.5 rounded-md font-extrabold text-sm flex items-center gap-1 shadow-sm">
                <span>★</span>
                <span>{product.averageRating ? product.averageRating.toFixed(1) : '5.0'}</span>
              </div>
              <span className="text-sm text-[#FAF7F0]">
                {product.reviews?.length || 0} Customer Ratings
              </span>
            </div>

            {/* Price */}
            <div className="mb-4 border-b border-[#E3BA63]/20 pb-4">
              <div className="text-3xl sm:text-4xl font-bold text-[#E3BA63]">
                ₹{product.price}
              </div>
              <p className="text-xs text-emerald-400 mt-1">Inclusive of all taxes</p>
            </div>

            {/* Stock Warnings */}
            {product.stock === 0 ? (
              <div className="bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-3 rounded-xl font-bold flex items-center gap-2 mb-6">
                <span className="text-lg">🚫</span>
                <span>Out of Stock — This item is currently unavailable.</span>
              </div>
            ) : product.stock < 3 ? (
              <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-3 rounded-xl font-bold flex items-center gap-2 mb-6">
                <span className="text-lg">⚠️</span>
                <span>Only {product.stock} {product.stock === 1 ? 'item' : 'items'} left in stock — order soon!</span>
              </div>
            ) : null}

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-[#E3BA63] uppercase tracking-wider mb-2">Description</h3>
              <p className="text-[#FAF7F0]/90 leading-relaxed text-sm sm:text-base">
                {product.description || "No description provided for this item."}
              </p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 py-3 border-t border-[#E3BA63]/20">
            <span className="text-sm font-semibold text-[#E3BA63] uppercase tracking-wider">Quantity:</span>
            <div className="flex items-center bg-black/40 border border-[#E3BA63]/40 rounded-xl p-1">
              <button 
                type="button"
                disabled={product.stock === 0}
                onClick={() => setSelectedQuantity(prev => Math.max(1, prev - 1))}
                className="w-9 h-9 rounded-lg bg-[#003725] text-[#E3BA63] hover:bg-[#E3BA63] hover:text-[#011E15] font-extrabold text-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="w-12 text-center font-extrabold text-[#FAF7F0] text-base">
                {product.stock === 0 ? 0 : selectedQuantity}
              </span>
              <button 
                type="button"
                disabled={product.stock === 0 || selectedQuantity >= product.stock}
                onClick={() => setSelectedQuantity(prev => Math.min(product.stock, prev + 1))}
                className="w-9 h-9 rounded-lg bg-[#003725] text-[#E3BA63] hover:bg-[#E3BA63] hover:text-[#011E15] font-extrabold text-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            <span className="text-xs text-[#FAF7F0] font-medium">
              Subtotal: <strong className="text-[#E3BA63] font-bold text-sm">₹{product.stock === 0 ? 0 : product.price * selectedQuantity}</strong>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button 
              onClick={addToCart} 
              disabled={addingToCart || product.stock === 0}
              className={`flex-1 py-3.5 px-6 rounded-xl font-extrabold text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                addedSuccess 
                  ? 'bg-emerald-600 text-white border border-emerald-400' 
                  : 'bg-[#E3BA63] hover:bg-[#cda24d] text-[#011E15] hover:shadow-xl'
              }`}
            >
              {product.stock === 0 ? (
                <>
                  <span>🚫</span>
                  <span>Out of Stock</span>
                </>
              ) : addingToCart ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-[#011E15]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding to Cart...
                </>
              ) : addedSuccess ? (
                <>
                  <span>✓</span>
                  <span>Added ({selectedQuantity}) to Cart!</span>
                </>
              ) : (
                <>
                  <span>🛒</span>
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            <button 
              onClick={() => navigate(`/checkout?productId=${product._id}&quantity=${selectedQuantity}`)} 
              disabled={product.stock === 0}
              className="flex-1 py-3.5 px-6 rounded-xl font-extrabold text-base bg-[#011E15] hover:bg-black/40 text-[#E3BA63] border-2 border-[#E3BA63] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>⚡</span>
              <span>Buy Now</span>
            </button>
          </div>
        </div>

      </div>

      {/* Customer Reviews Section */}
      <div className="bg-[#011E15] border border-[#E3BA63]/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-[#E3BA63] mb-6 flex items-center gap-2">
          <span>💬</span> Customer Reviews & Ratings
        </h2>
        
        {/* Write a Review Box */}
        {user && !hasReviewed && (
          <div className="bg-black/30 border border-[#E3BA63]/30 p-6 rounded-2xl mb-8">
            <h3 className="text-lg font-bold text-[#FAF7F0] mb-4">Write a Product Review</h3>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#FAF7F0] mb-1">Rating</label>
                <select 
                  value={rating} 
                  onChange={(e) => setRating(Number(e.target.value))} 
                  className="bg-[#011E15] text-[#FAF7F0] border border-[#E3BA63]/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3BA63]"
                >
                  <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                  <option value="4">⭐⭐⭐⭐ 4 - Very Good</option>
                  <option value="3">⭐⭐⭐ 3 - Good</option>
                  <option value="2">⭐⭐ 2 - Fair</option>
                  <option value="1">⭐ 1 - Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#FAF7F0] mb-1">Your Feedback</label>
                <textarea 
                  placeholder="Share details about what you liked or disliked about this product..." 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)} 
                  required 
                  rows={4}
                  className="w-full bg-[#011E15] text-[#FAF7F0] border border-[#E3BA63]/40 rounded-xl p-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E3BA63]"
                />
              </div>

              <button 
                type="submit" 
                disabled={submittingReview}
                className="bg-[#E3BA63] hover:bg-[#cda24d] text-[#011E15] px-6 py-2.5 rounded-xl font-bold text-sm transition-colors duration-200 disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}

        {user && hasReviewed && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-xl text-emerald-300 text-sm font-medium mb-8 flex items-center gap-2">
            <span>✓</span> You have already submitted a review for this product. Thank you!
          </div>
        )}

        {!user && (
          <div className="bg-black/30 border border-[#E3BA63]/20 p-4 rounded-xl text-[#FAF7F0] text-sm mb-8">
            Want to write a review? Please <Link to="/login" className="text-[#E3BA63] font-bold underline">login to your account</Link>.
          </div>
        )}

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {!product.reviews || product.reviews.length === 0 ? (
            <p className="text-[#FAF7F0] italic py-4">No reviews yet for this product. Be the first to share your experience!</p>
          ) : (
            product.reviews.map((r, i) => (
              <div key={i} className="bg-black/30 border border-[#E3BA63]/20 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#FAF7F0] text-sm">
                    {r.user?.name || 'Verified Customer'}
                  </span>
                  <div className="bg-[#E3BA63] text-[#011E15] px-2 py-0.5 rounded text-xs font-extrabold">
                    ★ {r.rating}
                  </div>
                </div>
                <p className="text-[#FAF7F0]/90 text-sm leading-relaxed">{r.comment}</p>
                {r.createdAt && (
                  <span className="text-[11px] text-[#FAF7F0] block pt-1">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}

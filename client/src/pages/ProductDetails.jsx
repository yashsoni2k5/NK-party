import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { FiStar, FiShoppingCart, FiCreditCard, FiChevronRight, FiCheck } from 'react-icons/fi';

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <svg className="animate-spin h-8 w-8 mb-4 text-[#AC666D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
        <p className="text-gray-500 mb-6">The requested product could not be loaded or doesn't exist.</p>
        <Link to="/" className="bg-gray-800 text-white px-6 py-2 rounded font-medium hover:bg-gray-700 transition-colors">
          Back to Store
        </Link>
      </div>
    );
  }

  const hasReviewed = product.reviews?.some(r => r.user?._id === user?._id || r.user === user?._id);

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 text-gray-800">
        
        {/* Breadcrumb */}
        <div className="mb-6 text-xs text-gray-500 flex items-center gap-1.5 font-medium">
          <Link to="/" className="hover:text-[#AC666D] transition-colors">Home</Link>
          <FiChevronRight className="w-3 h-3" />
          <span className="capitalize">{product.category || 'Category'}</span>
          <FiChevronRight className="w-3 h-3" />
          <span className="text-gray-800 truncate max-w-[200px] sm:max-w-xs">{product.title}</span>
        </div>

        {/* Product Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 mb-16">
          
          {/* Left: Product Image */}
          <div className="flex justify-center items-start">
            <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden p-4 flex items-center justify-center sticky top-24 min-h-[400px]">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="w-full h-auto max-h-[500px] object-contain" 
                />
              ) : (
                <div className="text-gray-400 flex flex-col items-center gap-2">
                  <span className="text-4xl">📷</span>
                  <span className="text-sm">No image available</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2 leading-snug">
              {product.title}
            </h1>
            
            {/* Ratings & Reviews Link */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center text-sm font-medium text-white bg-green-600 px-2 py-0.5 rounded">
                <span>{product.averageRating ? product.averageRating.toFixed(1) : '0.0'}</span>
                <FiStar className="ml-1 w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-sm text-gray-500 hover:text-[#AC666D] cursor-pointer transition-colors">
                {product.reviews?.length || 0} Ratings & Reviews
              </span>
            </div>

            {/* Price Section */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-gray-500 line-through mb-0.5">₹{product.originalPrice}</span>
                    <span className="text-sm font-bold text-green-600 mb-1">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium">Inclusive of all taxes</p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Product Details</h3>
              <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {product.description || "No description provided for this item."}
              </div>
            </div>

            {/* Stock / Quantity */}
            <div className="mb-8">
              {product.stock === 0 ? (
                <div className="text-red-600 font-semibold text-lg">
                  Out of Stock
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-900">Quantity</span>
                  <div className="flex items-center border border-gray-300 rounded">
                    <button 
                      type="button"
                      onClick={() => setSelectedQuantity(prev => Math.max(1, prev - 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30"
                      disabled={product.stock === 0}
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-gray-900 font-medium">
                      {selectedQuantity}
                    </span>
                    <button 
                      type="button"
                      onClick={() => setSelectedQuantity(prev => Math.min(product.stock, prev + 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30"
                      disabled={product.stock === 0 || selectedQuantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                  {product.stock > 0 && product.stock < 5 && (
                    <span className="text-xs font-semibold text-red-500">Only {product.stock} left in stock!</span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <button 
                onClick={addToCart} 
                disabled={addingToCart || product.stock === 0 || addedSuccess}
                className={`flex-1 py-3.5 px-6 rounded font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  addedSuccess 
                    ? 'bg-green-600 text-white' 
                    : 'bg-[#AC666D] hover:bg-[#96555b] text-white'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {addingToCart ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : addedSuccess ? (
                  <>
                    <FiCheck className="w-5 h-5" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <FiShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </>
                )}
              </button>

              <button 
                onClick={() => navigate(`/checkout?productId=${product._id}&quantity=${selectedQuantity}`)} 
                disabled={product.stock === 0}
                className="flex-1 py-3.5 px-6 rounded font-semibold text-sm bg-gray-900 hover:bg-gray-800 text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FiCreditCard className="w-4 h-4" />
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="border-t border-gray-200 pt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-8">
            Ratings & Reviews
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Reviews Form / Info */}
            <div className="lg:col-span-1">
              {user && !hasReviewed && (
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Write a Review</h3>
                  <form onSubmit={submitReview} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Rating</label>
                      <select 
                        value={rating} 
                        onChange={(e) => setRating(Number(e.target.value))} 
                        className="w-full bg-white text-gray-800 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#AC666D]"
                      >
                        <option value="5">5 ★ - Excellent</option>
                        <option value="4">4 ★ - Very Good</option>
                        <option value="3">3 ★ - Good</option>
                        <option value="2">2 ★ - Fair</option>
                        <option value="1">1 ★ - Poor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Feedback</label>
                      <textarea 
                        placeholder="Write your review here..." 
                        value={comment} 
                        onChange={(e) => setComment(e.target.value)} 
                        required 
                        rows={3}
                        className="w-full bg-white text-gray-800 border border-gray-300 rounded p-3 text-sm focus:outline-none focus:border-[#AC666D] resize-none"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={submittingReview}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded font-medium text-sm transition-colors duration-200 disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              )}

              {user && hasReviewed && (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded text-sm text-gray-600 text-center">
                  You have already submitted a review. Thank you!
                </div>
              )}

              {!user && (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded text-sm text-gray-600 text-center">
                  Please <Link to="/login" className="text-[#AC666D] font-bold hover:underline">log in</Link> to write a review.
                </div>
              )}
            </div>

            {/* Existing Reviews List */}
            <div className="lg:col-span-2 space-y-6">
              {!product.reviews || product.reviews.length === 0 ? (
                <div className="text-gray-500 text-center py-10 border border-gray-100 rounded-lg bg-gray-50/50">
                  <p>No reviews yet. Be the first to share your thoughts!</p>
                </div>
              ) : (
                product.reviews.map((r, i) => (
                  <div key={i} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center text-xs font-medium text-white bg-green-600 px-1.5 py-0.5 rounded">
                        <span>{r.rating}</span>
                        <FiStar className="ml-0.5 w-3 h-3 fill-current" />
                      </div>
                      <span className="font-semibold text-gray-800 text-sm">
                        {r.user?.name || 'Verified Customer'}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-1">{r.comment}</p>
                    {r.createdAt && (
                      <span className="text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

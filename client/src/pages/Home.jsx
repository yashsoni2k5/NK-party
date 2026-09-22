import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import BannerCarousel from '../components/BannerCarousel';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [addedIds, setAddedIds] = useState({});
  
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  const loadData = async () => {
    setLoading(true);
    try {
      if (searchQuery.trim()) {
        const res = await api.get(`/products/search/${searchQuery}`);
        const allItems = res.data || [];
        setProducts(allItems.filter(item => item.itemType !== 'SERVICE'));
        setServices(allItems.filter(item => item.itemType === 'SERVICE'));
      } else {
        const [prodRes, servRes] = await Promise.all([
          api.get('/products?itemType=PRODUCT'),
          api.get('/products?itemType=SERVICE')
        ]);
        setProducts(prodRes.data.products || []);
        setServices(servRes.data.products || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  const handleAddToCart = async (e, item) => {
    e.stopPropagation();
    setAddingId(item._id);
    try {
      await api.post(`/cart/${item._id}`);
      
      setAddedIds(prev => ({ ...prev, [item._id]: true }));
      setTimeout(() => {
        setAddedIds(prev => ({ ...prev, [item._id]: false }));
      }, 2000);

    } catch (error) {
      if (error.response?.status === 401) {
        alert('Please login to add items to your cart.');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || error.message || 'Failed to add item to cart');
      }
    } finally {
      setAddingId(null);
    }
  };

  const renderCard = (item) => {
    const isAdding = addingId === item._id;
    const isRecentlyAdded = addedIds[item._id];
    const isOutOfStock = item.stock === 0;
    const isLowStock = item.stock > 0 && item.stock < 3;

    return (
      <div 
        key={item._id} 
        onClick={() => navigate(`/product/${item._id}`)}
        className="group cursor-pointer flex flex-col justify-between bg-[#011E15] border border-[#E3BA63]/30 hover:border-[#E3BA63] rounded-2xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 relative overflow-hidden"
      >
        <div>
          {/* Product Image */}
          <div className="overflow-hidden rounded-xl h-48 w-full bg-black/40 mb-3 relative">
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
            />
            
            {/* Stock Badge Overlay */}
            {isOutOfStock ? (
              <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-white border border-red-400 shadow-md">
                Out of Stock
              </div>
            ) : isLowStock ? (
              <div className="absolute top-2 left-2 bg-amber-500/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-extrabold text-black border border-amber-300 shadow-md">
                Only {item.stock} left
              </div>
            ) : null}

            {item.averageRating > 0 && (
              <div className="absolute top-2 right-2 bg-[#011E15]/90 backdrop-blur-md px-2 py-0.5 rounded-full text-xs font-bold text-[#E3BA63] border border-[#E3BA63]/40 flex items-center gap-1 shadow-md">
                ★ {item.averageRating.toFixed(1)}
              </div>
            )}
          </div>

          {/* Title & Category */}
          <h3 className="font-bold text-sm sm:text-base text-[#FAF7F0] mb-1 group-hover:text-[#E3BA63] transition-colors truncate">
            {item.title}
          </h3>
          <p className="text-xs text-[#E3BA63]/90 uppercase tracking-wider font-semibold mb-3">
            {item.category}
          </p>
        </div>

        {/* Card Footer: Price & Add to Cart */}
        <div className="mt-2 pt-3 border-t border-[#E3BA63]/20 flex flex-wrap items-center justify-between gap-2">
          <strong className="text-base sm:text-lg font-bold text-[#E3BA63]">
            ₹{item.price}
          </strong>

          <button 
            onClick={(e) => handleAddToCart(e, item)}
            disabled={isAdding || isOutOfStock}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isOutOfStock
                ? 'bg-gray-700 text-gray-400 border border-gray-600'
                : isRecentlyAdded
                ? 'bg-emerald-600 text-white border border-emerald-400'
                : 'bg-[#E3BA63] hover:bg-[#cda24d] text-[#011E15] hover:shadow-lg'
            }`}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : isAdding ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-[#011E15]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Adding...</span>
              </>
            ) : isRecentlyAdded ? (
              <>
                <span>✓</span>
                <span>Added!</span>
              </>
            ) : (
              <>
                <span>🛒</span>
                <span className="hidden sm:inline">Add to Cart</span>
                <span className="inline sm:hidden">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#003725] min-h-screen text-[#FAF7F0] pb-16">
      {!searchQuery && <BannerCarousel />}
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Page Header */}
        <div className="mb-10 text-center">
          {searchQuery ? (
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#E3BA63] via-[#FAF7F0] to-[#E3BA63] tracking-wide">
              Search Results for "{searchQuery}"
            </h1>
          ) : (
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#E3BA63] via-[#FAF7F0] to-[#E3BA63] tracking-widest uppercase">
              Shop
            </h1>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-[#E3BA63]">
            <svg className="animate-spin h-8 w-8 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading store collection...
          </div>
        ) : (
          <div className="space-y-12">
            {/* Products Section */}
            <section>
              <h2 className="text-xl font-semibold text-[#E3BA63] border-b border-[#E3BA63]/30 pb-2 mb-6 flex items-center gap-2">
                <span>📦</span> Products
              </h2>
              {products.length === 0 ? (
                <p className="text-gray-300">No products found.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                  {products.map(renderCard)}
                </div>
              )}
            </section>

            {/* Services Section */}
            <section>
              <h2 className="text-xl font-semibold text-[#E3BA63] border-b border-[#E3BA63]/30 pb-2 mb-6 flex items-center gap-2">
                <span>🎉</span> Party Services
              </h2>
              {services.length === 0 ? (
                <p className="text-gray-300">No party services available right now.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                  {services.map(renderCard)}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import BannerCarousel from '../components/BannerCarousel';
import { FiStar } from 'react-icons/fi';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  
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
      // alert('Added to cart!'); 
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
    const isOutOfStock = item.stock === 0;

    return (
      <div 
        key={item._id} 
        onClick={() => navigate(`/product/${item._id}`)}
        className="group cursor-pointer flex flex-col bg-white p-3 transition-all duration-200 relative border border-gray-200 hover:shadow-lg rounded-md"
      >
        {/* Product Image */}
        <div className="overflow-hidden bg-[#FAFAFA] aspect-square flex items-center justify-center mb-3 relative rounded-sm border border-gray-100">
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ease-out p-2" 
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-[1px]">
              <span className="bg-gray-800 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm">Sold Out</span>
            </div>
          )}
          {/* Star Rating Overlay */}
          {item.averageRating > 0 && (
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-800 border border-gray-200 flex items-center gap-1">
              {item.averageRating.toFixed(1)} <FiStar className="fill-green-600 text-green-600" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col flex-grow text-left">
          <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2 leading-snug group-hover:text-[#AC666D] transition-colors">
            {item.title}
          </h3>
          
          <div className="mt-auto pt-2">
            <div className="flex items-center gap-2 mb-3">
              <strong className="text-base font-bold text-gray-900">
                ₹{item.price}
              </strong>
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-xs text-gray-500 line-through">₹{item.originalPrice}</span>
              )}
            </div>

            <button 
              onClick={(e) => handleAddToCart(e, item)}
              disabled={isAdding || isOutOfStock}
              className="w-full bg-[#AC666D] text-white py-2 text-xs font-bold uppercase tracking-wide hover:bg-[#96555b] transition-colors disabled:opacity-50 rounded-sm"
            >
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-gray-800 pb-20">
      
      {!searchQuery && <BannerCarousel />}
      
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        
        {searchQuery && (
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Results</h1>
            <p className="text-gray-500">Showing results for "{searchQuery}"</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20 text-[#AC666D]">
            <svg className="animate-spin h-8 w-8 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading store collection...
          </div>
        ) : (
          <div className="space-y-16">
            {/* Products Section */}
            <section>
              <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-2">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-[#AC666D]">📦</span> Products
                </h2>
              </div>
              
              {products.length === 0 ? (
                <p className="text-gray-500 text-center py-10">No products found.</p>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
                  {products.map(renderCard)}
                </div>
              )}
            </section>

            {/* Services Section */}
            <section>
              <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-2">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-[#AC666D]">🎉</span> Party Services
                </h2>
              </div>
              {services.length === 0 ? (
                <p className="text-gray-500">No party services available right now.</p>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
                  {services.map(renderCard)}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#FAF5F5] text-gray-600 py-12 mt-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/nkparty.jpeg" alt="Logo" className="h-8 w-8 object-cover rounded-md" />
              <span className="text-xl font-bold text-gray-900">NK Party</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Thoughtful gifts and decorations for every occasion.<br/>Made with love, chosen for you.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-4">Customer Service</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-[#AC666D]">Help Center</a></li>
              <li><a href="#" className="hover:text-[#AC666D]">Shipping & Delivery</a></li>
              <li><a href="#" className="hover:text-[#AC666D]">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-[#AC666D]">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-4">About Us</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-[#AC666D]">Our Story</a></li>
              <li><a href="#" className="hover:text-[#AC666D]">Terms & Conditions</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-gray-200 text-xs text-gray-600 flex flex-col md:flex-row justify-between items-center">
          <p>© 2026 NK Party. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

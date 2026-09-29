import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { FiStar, FiPackage, FiGift, FiChevronRight } from 'react-icons/fi';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function AllProducts() {
  const [addingId, setAddingId] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const searchParams = new URLSearchParams(location.search);
  const itemType = searchParams.get('type') || 'PRODUCT'; // PRODUCT or SERVICE

  const fetchItems = async () => {
    const res = await api.get(`/products?itemType=${itemType}&perPage=100`);
    return res.data.products || [];
  };

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['all-items', itemType],
    queryFn: fetchItems,
  });

  const handleAddToCart = async (e, item) => {
    e.stopPropagation();
    setAddingId(item._id);
    try {
      await api.post(`/cart/${item._id}`, { quantity: 1 });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      alert(`Successfully added ${item.title} to your cart!`); 
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
          {item.averageRating > 0 && (
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-800 border border-gray-200 flex items-center gap-1">
              {item.averageRating.toFixed(1)} <FiStar className="fill-green-600 text-green-600" />
            </div>
          )}
        </div>

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        
        <div className="mb-6 text-xs text-gray-500 flex items-center gap-1.5 font-medium">
          <Link to="/" className="hover:text-[#AC666D] transition-colors">Home</Link>
          <FiChevronRight className="w-3 h-3" />
          <span className="capitalize">{itemType === 'PRODUCT' ? 'All Products' : 'All Services'}</span>
        </div>

        <div className="mb-10 pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            {itemType === 'PRODUCT' ? <FiPackage className="text-[#AC666D]" /> : <FiGift className="text-[#AC666D]" />}
            {itemType === 'PRODUCT' ? 'All Products' : 'All Services'}
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <svg className="animate-spin h-8 w-8 text-[#AC666D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No items found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
            {items.map(renderCard)}
          </div>
        )}
      </div>
    </div>
  );
}

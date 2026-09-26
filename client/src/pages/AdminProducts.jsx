import { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit3, FiTrash2, FiPackage, FiArrowLeft } from 'react-icons/fi';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?perPage=100');
      setProducts(res.data.products || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(products.filter(p => p._id !== id));
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex justify-center items-center text-[#AC666D]">
        <svg className="animate-spin h-10 w-10 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-bold text-lg text-gray-800">Loading inventory...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#AC666D]/20 pb-6">
          <div className="space-y-1">
            <Link 
              to="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#AC666D] hover:text-white transition-colors mb-2"
            >
              <FiArrowLeft /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
              <FiPackage className="text-[#AC666D]" /> Inventory Management
            </h1>
            <p className="text-gray-800 text-sm">
              Manage your products and party decoration services catalog.
            </p>
          </div>

          <Link 
            to="/admin/add-product" 
            className="bg-[#AC666D] hover:bg-[#96555b] text-white px-5 py-3 rounded-2xl font-extrabold transition-all shadow-xl flex items-center gap-2 text-sm shrink-0"
          >
            <FiPlus className="w-5 h-5" /> Add New Item
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-white border border-[#AC666D]/30 p-12 rounded-3xl text-center shadow-xl">
            <FiPackage className="w-16 h-16 mx-auto text-[#AC666D]/40 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Items in Inventory</h2>
            <p className="text-gray-800 mb-6 text-sm">Click the button above to add your first product or service.</p>
            <Link to="/admin/add-product" className="inline-flex items-center gap-2 bg-[#AC666D] text-white px-6 py-3 rounded-xl font-bold">
              <FiPlus /> Add Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(item => (
              <div 
                key={item._id} 
                className="bg-white border border-[#AC666D]/30 hover:border-[#AC666D]/60 rounded-3xl overflow-hidden shadow-xl flex flex-col transition-all duration-300 group"
              >
                <div className="h-48 bg-gray-100 relative overflow-hidden flex items-center justify-center border-b border-[#AC666D]/20">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span className="absolute top-3 left-3 bg-white/90 border border-[#AC666D]/40 text-[#AC666D] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {item.itemType}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col space-y-3">
                  <div>
                    <span className="text-xs text-gray-800 font-semibold uppercase tracking-wider block mb-1">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-gray-800 text-base truncate group-hover:text-[#AC666D] transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex justify-between items-baseline pt-2">
                    <p className="text-[#AC666D] font-extrabold text-xl">₹{item.price}</p>
                    <p className="text-xs text-gray-800">Stock: <span className="font-bold text-gray-800">{item.stock}</span></p>
                  </div>

                  <div className="mt-auto pt-4 flex gap-3 border-t border-[#AC666D]/10">
                    <Link 
                      to={`/admin/edit-product/${item._id}`}
                      className="flex-1 bg-gray-100 hover:bg-[#AC666D]/20 border border-[#AC666D]/30 text-[#AC666D] text-center px-3 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FiEdit3 /> Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(item._id)}
                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-600 text-center px-3 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}


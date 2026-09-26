import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiUpload, FiPackage, FiCheckCircle } from 'react-icons/fi';

export default function AdminAddProduct() {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [productData, setProductData] = useState({
    title: '',
    category: '',
    tag: '',
    price: '',
    stock: '',
    itemType: 'PRODUCT'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditMode) {
      api.get(`/products/${id}`)
        .then(res => {
          const p = res.data;
          setProductData({
            title: p.title,
            category: p.category,
            tag: Array.isArray(p.tag) ? p.tag.join(', ') : p.tag,
            price: p.price,
            stock: p.stock,
            itemType: p.itemType || 'PRODUCT'
          });
          if (p.image) {
            setImagePreview(p.image);
          }
        })
        .catch(err => {
          alert("Failed to fetch product details");
          console.error(err);
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isEditMode]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditMode && !imageFile) {
      return alert("Please select an image file");
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', productData.title);
      formData.append('category', productData.category);
      const tagArray = productData.tag.split(',').map(t => t.trim());
      formData.append('tag', JSON.stringify(tagArray));
      formData.append('price', Number(productData.price));
      formData.append('stock', Number(productData.stock));
      formData.append('itemType', productData.itemType);
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      if (isEditMode) {
        await api.patch(`/products/${id}`, formData);
        alert(`${productData.itemType === 'SERVICE' ? 'Service' : 'Product'} updated successfully!`);
      } else {
        await api.post('/products', formData);
        alert(`${productData.itemType === 'SERVICE' ? 'Service' : 'Product'} created successfully!`);
      }
      navigate('/admin/products');
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex justify-center items-center text-[#AC666D]">
        <svg className="animate-spin h-10 w-10 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-bold text-lg text-gray-800">Loading item details...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Top Header & Back Button */}
        <div className="flex items-center justify-between">
          <Link 
            to="/admin/products"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#AC666D] hover:text-white transition-colors bg-white px-4 py-2 rounded-xl border border-[#AC666D]/30"
          >
            <FiArrowLeft /> Back to Inventory
          </Link>
        </div>

        <div className="bg-white border border-[#AC666D]/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[#AC666D]/20">
            <div className="bg-[#AC666D]/15 text-[#AC666D] p-3 rounded-2xl border border-[#AC666D]/30 text-2xl">
              <FiPackage />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
                {isEditMode ? 'Edit Item Details' : 'Add New Item'}
              </h1>
              <p className="text-gray-800 text-xs sm:text-sm">
                Fill in the product or service specifications below.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2">Item Type</label>
                <select 
                  name="itemType" 
                  value={productData.itemType} 
                  onChange={handleChange} 
                  className="w-full bg-white border border-[#AC666D]/20 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-[#AC666D]"
                >
                  <option value="PRODUCT">Physical Product</option>
                  <option value="SERVICE">Service (e.g., Party Decoration)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2">Category</label>
                <input 
                  name="category" 
                  placeholder="e.g. Birthday Decor, Balloons" 
                  value={productData.category} 
                  onChange={handleChange} 
                  required 
                  className="w-full bg-white border border-[#AC666D]/20 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#AC666D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2">Title</label>
              <input 
                name="title" 
                placeholder="e.g. Royal Gold Metallic Balloon Set" 
                value={productData.title} 
                onChange={handleChange} 
                required 
                className="w-full bg-white border border-[#AC666D]/20 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#AC666D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2">Tags (Comma Separated)</label>
              <input 
                name="tag" 
                placeholder="e.g. luxury, wedding, balloons, gold" 
                value={productData.tag} 
                onChange={handleChange} 
                required 
                className="w-full bg-white border border-[#AC666D]/20 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#AC666D]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2">Price (₹)</label>
                <input 
                  name="price" 
                  type="number" 
                  placeholder="999" 
                  value={productData.price} 
                  onChange={handleChange} 
                  required 
                  className="w-full bg-white border border-[#AC666D]/20 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#AC666D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2">Stock (Qty or 999+ for Services)</label>
                <input 
                  name="stock" 
                  type="number" 
                  placeholder="50" 
                  value={productData.stock} 
                  onChange={handleChange} 
                  required 
                  className="w-full bg-white border border-[#AC666D]/20 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#AC666D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2">
                {isEditMode ? 'Update Product Image (Optional)' : 'Upload Product Image'}
              </label>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl border border-[#AC666D]/30 overflow-hidden shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="flex-1 border-2 border-dashed border-[#AC666D]/30 hover:border-[#AC666D] rounded-2xl p-4 text-center cursor-pointer bg-white/50 hover:bg-white transition-colors">
                  <FiUpload className="w-6 h-6 mx-auto text-[#AC666D] mb-1" />
                  <span className="text-xs text-gray-800 font-semibold block">
                    {imageFile ? imageFile.name : 'Click to select or drag image file'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageChange} required={!isEditMode} className="hidden" />
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#AC666D] hover:bg-[#96555b] text-white font-extrabold py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 text-base tracking-wide mt-8 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-5 h-5" />
                  {isEditMode ? `Update ${productData.itemType === 'SERVICE' ? 'Service' : 'Product'}` : `Create ${productData.itemType === 'SERVICE' ? 'Service' : 'Product'}`}
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}


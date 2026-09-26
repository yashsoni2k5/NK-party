import { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { FiImage, FiArrowLeft, FiPlus, FiUpload, FiTrash2, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [order, setOrder] = useState(0);

  const loadBanners = () => {
    setLoading(true);
    api.get('/banners/all')
      .then(res => setBanners(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleAddBanner = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      return alert("Please select an image file to upload");
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('order', order);

      await api.post('/banners', formData);
      setImageFile(null);
      setImagePreview(null);
      setOrder(0);
      e.target.reset();
      loadBanners();
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Failed to upload banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      await api.put(`/banners/${banner._id}`, { isActive: !banner.isActive });
      loadBanners();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update banner status");
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      await api.delete(`/banners/${id}`);
      loadBanners();
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Failed to delete banner");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#AC666D]/20 pb-6">
          <div className="space-y-1">
            <Link 
              to="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#AC666D] hover:text-white transition-colors mb-2"
            >
              <FiArrowLeft /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
              <FiImage className="text-[#AC666D]" /> Manage Homepage Banners
            </h1>
            <p className="text-gray-800 text-sm">
              Upload and arrange promotional carousel banners for your store homepage.
            </p>
          </div>

          <div className="text-xs font-bold bg-[#AC666D]/15 text-[#AC666D] border border-[#AC666D]/30 px-4 py-2 rounded-2xl">
            Total Banners: {banners.length}
          </div>
        </div>

        {/* Add New Banner Form Card */}
        <div className="bg-white border border-[#AC666D]/30 p-6 sm:p-8 rounded-3xl shadow-2xl">
          <h2 className="text-xl font-extrabold text-[#AC666D] mb-6 flex items-center gap-2">
            <FiPlus className="w-5 h-5" /> Add New Banner
          </h2>

          <form onSubmit={handleAddBanner} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              
              {/* File Input */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2">
                  Banner Image File
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 border-2 border-dashed border-[#AC666D]/30 hover:border-[#AC666D] rounded-2xl p-4 text-center cursor-pointer bg-white transition-colors">
                    <FiUpload className="w-6 h-6 mx-auto text-[#AC666D] mb-1" />
                    <span className="text-xs text-gray-800 font-semibold block">
                      {imageFile ? imageFile.name : 'Click to select or drag banner image'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange} 
                      required 
                      disabled={isSubmitting}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[11px] text-gray-800 mt-2">Recommended aspect ratio: 16:9 or banner dimension (e.g. 1200x400px)</p>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2">
                  Display Order
                </label>
                <input 
                  type="number" 
                  value={order} 
                  onChange={(e) => setOrder(Number(e.target.value))} 
                  disabled={isSubmitting}
                  className="w-full bg-white border border-[#AC666D]/20 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-[#AC666D]"
                />
                <p className="text-[11px] text-gray-800 mt-2">Lower numbers appear first in slider</p>
              </div>

            </div>

            {/* Image Preview Thumbnail */}
            {imagePreview && (
              <div className="p-3 bg-gray-100 rounded-2xl border border-[#AC666D]/30 inline-block">
                <p className="text-xs text-[#AC666D] mb-2 font-bold">Preview:</p>
                <img 
                  src={imagePreview} 
                  alt="Banner Preview" 
                  className="h-32 rounded-xl object-cover border border-[#AC666D]/20" 
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[#AC666D] hover:bg-[#96555b] text-white font-extrabold px-6 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading Banner...
                  </>
                ) : (
                  <>
                    <FiUpload /> Upload Banner
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Banners Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Current Banners</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12 text-[#AC666D]">
              <svg className="animate-spin h-8 w-8 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-bold text-lg text-gray-800">Loading banners...</span>
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-[#AC666D]/30">
              <FiImage className="w-12 h-12 mx-auto text-gray-800 mb-3" />
              <p className="text-gray-800">No banners found. Upload your first banner above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map(banner => (
                <div 
                  key={banner._id} 
                  className="bg-white border border-[#AC666D]/30 rounded-3xl overflow-hidden shadow-xl hover:border-[#AC666D]/60 transition-all duration-300"
                >
                  <div className="relative h-48 bg-gray-100 border-b border-[#AC666D]/20">
                    <img 
                      src={banner.imageUrl} 
                      alt="banner" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs text-[#AC666D] font-bold border border-[#AC666D]/40">
                      Order: {banner.order}
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        banner.isActive 
                          ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/40' 
                          : 'bg-red-500/20 text-red-600 border-red-500/40'
                      }`}>
                        {banner.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex justify-between items-center bg-gray-50">
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                        banner.isActive
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20'
                          : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/20'
                      }`}
                    >
                      {banner.isActive ? <FiXCircle /> : <FiCheckCircle />}
                      {banner.isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    <button 
                      onClick={() => handleDeleteBanner(banner._id)}
                      className="bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white border border-red-500/30 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}


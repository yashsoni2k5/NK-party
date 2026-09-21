import { useState, useEffect } from 'react';
import api from '../api';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
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

  const handleAddBanner = async (e) => {
    e.preventDefault();
    try {
      await api.post('/banners', { imageUrl, order });
      setImageUrl('');
      setOrder(0);
      loadBanners();
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  const handleDeleteBanner = async (id) => {
    try {
      await api.delete(`/banners/${id}`);
      loadBanners();
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  if (loading) return <div className="p-8">Loading banners...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Banners</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Banner</h2>
        <form onSubmit={handleAddBanner} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input 
              type="url" 
              value={imageUrl} 
              onChange={(e) => setImageUrl(e.target.value)} 
              placeholder="https://example.com/banner.jpg" 
              required 
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="w-24">
            <label className="block text-sm font-medium mb-1">Order</label>
            <input 
              type="number" 
              value={order} 
              onChange={(e) => setOrder(Number(e.target.value))} 
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <button type="submit" className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors">
            Add Banner
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Current Banners</h2>
        {banners.length === 0 && <p className="text-gray-500">No banners found.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map(banner => (
            <div key={banner._id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
              <img src={banner.imageUrl} alt="banner" className="w-full h-40 object-cover" />
              <div className="p-4 flex justify-between items-center bg-gray-50">
                <span className="text-sm text-gray-600">Order: {banner.order}</span>
                <button 
                  onClick={() => handleDeleteBanner(banner._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

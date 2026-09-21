import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function AdminAddProduct() {
  const [productData, setProductData] = useState({
    title: '',
    category: '',
    tag: '',
    image: '',
    price: '',
    stock: '',
    itemType: 'product' // default
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productData,
        tag: productData.tag.split(',').map(t => t.trim()), // Convert comma separated string to array
        price: Number(productData.price),
        stock: Number(productData.stock)
      };
      
      await api.post('/products', payload);
      alert(`${productData.itemType === 'service' ? 'Service' : 'Product'} created successfully!`);
      navigate('/admin');
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Add New Item (Product/Service)</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <label style={{ fontWeight: 'bold' }}>Item Type</label>
        <select 
          name="itemType" 
          value={productData.itemType} 
          onChange={handleChange} 
          style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="product">Physical Product</option>
          <option value="service">Service (e.g., Party Decoration)</option>
        </select>

        <label style={{ fontWeight: 'bold' }}>Title</label>
        <input name="title" placeholder="e.g., Wireless Mouse" value={productData.title} onChange={handleChange} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        
        <label style={{ fontWeight: 'bold' }}>Category</label>
        <input name="category" placeholder="e.g., Electronics" value={productData.category} onChange={handleChange} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        
        <label style={{ fontWeight: 'bold' }}>Tags</label>
        <input name="tag" placeholder="e.g., tech, gadgets, new (comma separated)" value={productData.tag} onChange={handleChange} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        
        <label style={{ fontWeight: 'bold' }}>Image URL</label>
        <input name="image" placeholder="https://example.com/image.jpg" value={productData.image} onChange={handleChange} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        
        <label style={{ fontWeight: 'bold' }}>Price (₹)</label>
        <input name="price" type="number" placeholder="999" value={productData.price} onChange={handleChange} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        
        <label style={{ fontWeight: 'bold' }}>Stock (Use 999+ for unlimited services)</label>
        <input name="stock" type="number" placeholder="50" value={productData.stock} onChange={handleChange} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        
        <button type="submit" style={{ padding: '1rem', background: '#000', color: 'white', marginTop: '1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}>
          Create {productData.itemType === 'service' ? 'Service' : 'Product'}
        </button>
      </form>
    </div>
  );
}

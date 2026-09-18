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
    stock: ''
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
      alert('Product created successfully!');
      navigate('/admin');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h1>Add New Product (Admin)</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
        <input name="title" placeholder="Title" value={productData.title} onChange={handleChange} required />
        <input name="category" placeholder="Category" value={productData.category} onChange={handleChange} required />
        <input name="tag" placeholder="Tags (comma separated)" value={productData.tag} onChange={handleChange} required />
        <input name="image" placeholder="Image URL" value={productData.image} onChange={handleChange} required />
        <input name="price" type="number" placeholder="Price" value={productData.price} onChange={handleChange} required />
        <input name="stock" type="number" placeholder="Stock" value={productData.stock} onChange={handleChange} required />
        
        <button type="submit" style={{ padding: '0.5rem', background: '#333', color: 'white' }}>Create Product</button>
      </form>
    </div>
  );
}

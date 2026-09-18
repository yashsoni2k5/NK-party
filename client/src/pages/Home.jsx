import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const loadProducts = () => {
    let endpoint = '/products';
    if (category) {
      endpoint += `?category=${category}`;
    }
    api.get(endpoint)
      .then(res => setProducts(res.data.products || []))
      .catch(console.error);
  };

  useEffect(() => {
    loadProducts();
  }, [category]); // Reload when category changes

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) {
      return loadProducts();
    }
    // Search endpoint returns the array directly
    api.get(`/products/search/${search}`)
      .then(res => setProducts(res.data || []))
      .catch(console.error);
  };

  return (
    <div>
      <h1>Home - Products</h1>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          <button type="submit">Search</button>
        </form>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label>Category:</label>
          <input 
            type="text" 
            placeholder="e.g. decoratin" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {products?.map(product => (
          <div key={product._id} style={{ border: '1px solid #eee', padding: '1rem' }}>
            <img src={product.image} alt={product.title} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
            <h3>{product.title}</h3>
            <p>₹{product.price}</p>
            <Link to={`/product/${product._id}`}>View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

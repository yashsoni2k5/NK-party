import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api';
import BannerCarousel from '../components/BannerCarousel';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
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
  }, [searchQuery]); // Re-run when URL query changes

  const renderCard = (item) => (
    <div key={item._id} style={{ 
      border: '2px solid #D1A551', 
      borderRadius: '8px',
      padding: '1rem', 
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      backgroundColor: '#00291C', // Slightly darker green for contrast
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 6px 12px rgba(209, 165, 81, 0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
    }}
    >
      <img src={item.image} alt={item.title} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px' }} />
      <h3 style={{ margin: '0.5rem 0', fontSize: '1.1rem', color: '#fff' }}>{item.title}</h3>
      <p style={{ margin: '0', color: '#D1A551', flexGrow: 1, opacity: 0.8 }}>{item.category}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <strong style={{ fontSize: '1.2rem', color: '#D1A551' }}>₹{item.price}</strong>
        <Link to={`/product/${item._id}`} style={{
          backgroundColor: '#D1A551',
          color: '#003725',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: 'bold'
        }}>View Details</Link>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#003725', minHeight: '100vh', color: '#fff' }}>
      {!searchQuery && <BannerCarousel />}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          {searchQuery ? (
            <h1 style={{ 
              margin: 0, 
              background: 'linear-gradient(to right, #D1A551, #f9e2b1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '2.5rem'
            }}>Search Results for "{searchQuery}"</h1>
          ) : (
            <h1 style={{ 
              margin: 0, 
              background: 'linear-gradient(to right, #D1A551, #f9e2b1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '2.5rem'
            }}>Shop</h1>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#D1A551' }}>Loading...</div>
        ) : (
          <>
            <section style={{ marginBottom: '4rem' }}>
              <h2 style={{ borderBottom: '2px solid rgba(209, 165, 81, 0.3)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#D1A551' }}>Products</h2>
              {products.length === 0 ? (
                <p style={{ color: '#ccc' }}>No products found.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  {products.map(renderCard)}
                </div>
              )}
            </section>

            <section>
              <h2 style={{ borderBottom: '2px solid rgba(209, 165, 81, 0.3)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#D1A551' }}>Services</h2>
              {services.length === 0 ? (
                <p style={{ color: '#ccc' }}>No services available right now.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  {services.map(renderCard)}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

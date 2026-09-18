import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <Link to="/admin/add-product" style={{ padding: '1rem', border: '1px solid #ccc', textDecoration: 'none' }}>
          Add New Product
        </Link>
        <Link to="/admin/orders" style={{ padding: '1rem', border: '1px solid #ccc', textDecoration: 'none' }}>
          View All Orders
        </Link>
      </div>
    </div>
  );
}

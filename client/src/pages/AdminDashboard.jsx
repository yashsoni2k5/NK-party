import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const adminLinks = [
    { title: "Manage Banners", path: "/admin/banners", icon: "🖼️", desc: "Upload and organize homepage banner images." },
    { title: "Manage Products", path: "/admin/add-product", icon: "📦", desc: "Add or edit platform products." },
    { title: "Manage Orders", path: "/admin/orders", icon: "🛒", desc: "View all orders and update dispatch statuses." },
    { title: "Manage Replacements", path: "/admin/replacements", icon: "🔄", desc: "Approve or reject customer replacement requests." },
    { title: "Manage Users", path: "/admin/users", icon: "👥", desc: "View all registered users on the platform." },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem' }}>Admin Dashboard</h1>
      <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '3rem' }}>
        Welcome to the admin control panel. Select a module below to manage the platform.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        {adminLinks.map((link, idx) => (
          <Link 
            key={idx} 
            to={link.path} 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center', 
              padding: '3rem 2rem', 
              border: '1px solid #e0e0e0', 
              borderRadius: '12px', 
              textDecoration: 'none', 
              color: 'inherit',
              backgroundColor: '#fff',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{link.icon}</div>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>{link.title}</h2>
            <p style={{ margin: 0, color: '#666', lineHeight: '1.5' }}>{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

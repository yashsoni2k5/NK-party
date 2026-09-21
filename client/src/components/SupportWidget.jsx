export default function SupportWidget() {
  const whatsappNumber = "919999999999"; // Replace with real number
  const phoneNumber = "+919999999999";

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      zIndex: 1000
    }}>
      <a 
        href={`https://wa.me/${whatsappNumber}?text=Hi%20PartyStore%20Support`} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          width: '50px',
          height: '50px',
          backgroundColor: '#25D366',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          textDecoration: 'none',
          color: 'white',
          fontSize: '24px'
        }}
        title="Chat on WhatsApp"
      >
        💬
      </a>
      
      <a 
        href={`tel:${phoneNumber}`} 
        style={{
          width: '50px',
          height: '50px',
          backgroundColor: '#007bff',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          textDecoration: 'none',
          color: 'white',
          fontSize: '24px'
        }}
        title="Call Support"
      >
        📞
      </a>
    </div>
  );
}

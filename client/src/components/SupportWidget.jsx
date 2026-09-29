import { FaWhatsapp } from 'react-icons/fa';
import { FiPhoneCall } from 'react-icons/fi';

export default function SupportWidget() {
  const whatsappNumber = "919999999999"; // Replace with real number
  const phoneNumber = "+919999999999";

  return (
    <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-50">
      <a 
        href={`https://wa.me/${whatsappNumber}?text=Hi%20PartyStore%20Support`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-[50px] h-[50px] bg-[#25D366] text-white rounded-full flex justify-center items-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20"
        title="Chat on WhatsApp"
      >
        <FaWhatsapp size={28} />
      </a>
      
      <a 
        href={`tel:${phoneNumber}`} 
        className="w-[50px] h-[50px] bg-[#007bff] text-white rounded-full flex justify-center items-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20"
        title="Call Support"
      >
        <FiPhoneCall size={22} />
      </a>
    </div>
  );
}

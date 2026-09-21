import { useState, useEffect } from 'react';
import api from '../api';

export default function BannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Fetch active banners from backend
    api.get('/banners')
      .then(res => {
        setBanners(res.data || []);
      })
      .catch(console.error);
  }, []);

  // Auto-swiping logic
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000); // swipe every 4 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full h-64 md:h-96 overflow-hidden bg-gray-100 group">
      {/* Images container */}
      <div 
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner._id} className="min-w-full h-full flex-shrink-0">
            <img 
              src={banner.imageUrl} 
              alt="Promotional Banner" 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Left Navigation Arrow */}
      {banners.length > 1 && (
        <button 
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          &#10094;
        </button>
      )}

      {/* Right Navigation Arrow */}
      {banners.length > 1 && (
        <button 
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          &#10095;
        </button>
      )}

      {/* Dot Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button 
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

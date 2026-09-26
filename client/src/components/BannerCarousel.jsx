import { useState, useEffect } from 'react';
import api from '../api';

export default function BannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Fetch active banners from backend
    api.get('/banners')
      .then(res => {
        setBanners(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Auto-swiping logic
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (loading) {
    return (
      <div className="w-full h-48 md:h-80 bg-white animate-pulse flex items-center justify-center border-b border-[#AC666D]/20">
        <span className="text-[#AC666D] text-sm font-medium">Loading banners...</span>
      </div>
    );
  }

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full h-52 md:h-88 lg:h-[380px] overflow-hidden bg-white border-b border-[#AC666D]/30 group shadow-2xl">
      {/* Banner Container Box with #FAF7F0 details highlight border */}
      <div className="absolute inset-0 border-t border-b border-[#FAF7F0]/10 pointer-events-none z-10" />

      {/* Images container */}
      <div 
        className="flex transition-transform duration-700 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner._id} className="min-w-full h-full flex-shrink-0 relative">
            <img 
              src={banner.imageUrl} 
              alt="Promotional Banner" 
              className="w-full h-full object-cover"
            />
            {/* Subtle Gradient overlay with #FAF7F0 light detail touch */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#011E15]/80 via-transparent to-black/20 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Left Navigation Arrow */}
      {banners.length > 1 && (
        <button 
          onClick={goToPrevious}
          aria-label="Previous Slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-[#AC666D] text-[#AC666D] hover:text-white border border-[#AC666D]/50 w-11 h-11 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl backdrop-blur-md z-20"
        >
          &#10094;
        </button>
      )}

      {/* Right Navigation Arrow */}
      {banners.length > 1 && (
        <button 
          onClick={goToNext}
          aria-label="Next Slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-[#AC666D] text-[#AC666D] hover:text-white border border-[#AC666D]/50 w-11 h-11 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl backdrop-blur-md z-20"
        >
          &#10095;
        </button>
      )}

      {/* Dot Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2.5 z-20 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#AC666D]/40 shadow-lg">
          {banners.map((_, index) => (
            <button 
              key={index}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? "w-8 bg-[#AC666D]" 
                  : "w-2.5 bg-[#FAF7F0]/50 hover:bg-[#FAF7F0]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

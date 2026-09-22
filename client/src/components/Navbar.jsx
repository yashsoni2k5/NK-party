import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiSearch, FiShoppingCart, FiUser, FiX, FiLogOut, FiHome } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <nav className="bg-black text-[#FAF7F0] px-3 sm:px-6 py-3 md:py-4 flex items-center justify-between shadow-xl relative z-50">
        
        {/* Left Side - Burger Menu */}
        <div className="flex items-center gap-2 sm:gap-4 z-10">
          <button 
            onClick={toggleMenu} 
            className="text-xl sm:text-2xl text-[#FAF7F0] hover:text-[#E3BA63] transition-colors p-1"
            aria-label="Open Navigation Menu"
          >
            <FiMenu />
          </button>
        </div>

        {/* Center - Logo & Text (Perfectly centered in navbar) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
          <Link to="/" className="hover:opacity-90 transition-opacity flex flex-col items-center">
            <img src="/nkparty.jpeg" alt="NKparty Logo" className="h-8 sm:h-10 md:h-12 object-contain rounded-md shadow-md" />
            <span className="text-[8px] sm:text-[10px] md:text-xs text-white font-medium tracking-widest mt-0.5 uppercase">
              Celebrate With Style
            </span>
          </Link>
        </div>
        
        {/* Right Side - Search, Cart, Home & Profile Icons */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-5 z-10">

          {/* Home Icon */}
          <Link 
            to="/" 
            className="text-xl sm:text-2xl text-[#FAF7F0] hover:text-[#E3BA63] transition-colors p-1"
            aria-label="Home"
          >
            <FiHome />
          </Link>
          
          {/* Expandable Search */}
          <div className="flex items-center relative">
            {isSearchOpen && (
              <form onSubmit={handleSearchSubmit} className="absolute right-8 top-1/2 -translate-y-1/2 z-20">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  autoFocus
                  className="bg-[#00271a] text-[#FAF7F0] border border-[#E3BA63]/40 px-3 py-1 rounded-full outline-none text-xs sm:text-sm w-36 sm:w-48 md:w-52 placeholder-gray-400 focus:ring-2 focus:ring-[#E3BA63] shadow-2xl"
                />
              </form>
            )}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)} 
              className="text-xl sm:text-2xl text-[#FAF7F0] hover:text-[#E3BA63] transition-colors p-1"
              aria-label="Search"
            >
              <FiSearch />
            </button>
          </div>

          {/* Cart Icon */}
          <Link 
            to="/cart" 
            className="text-xl sm:text-2xl text-[#FAF7F0] hover:text-[#E3BA63] transition-colors p-1 relative"
            aria-label="View Shopping Cart"
          >
            <FiShoppingCart />
          </Link>

          {/* Profile Icon - Hidden on mobile screens (sm and below), visible on desktop/tablets */}
          <Link
            to={user ? "/profile" : "/login"}
            className="hidden sm:inline-flex text-xl sm:text-2xl text-[#FAF7F0] hover:text-[#E3BA63] transition-colors p-1"
            aria-label="User Profile"
          >
            <FiUser />
          </Link>
        </div>
      </nav>

      {/* Slide-in Burger Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40"
          onClick={toggleMenu}
        />
      )}

      {/* Slide-in Burger Menu Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-[#011E15] text-[#FAF7F0] border-r border-[#E3BA63]/30 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-[#E3BA63]/20 flex justify-between items-center bg-[#001710]">
          <h2 className="text-xl font-bold text-[#E3BA63]">Menu</h2>
          <button onClick={toggleMenu} className="text-2xl text-[#FAF7F0] hover:text-red-400">
            <FiX />
          </button>
        </div>

        <div className="flex flex-col p-5 space-y-4">
          {user ? (
            <>
              <div className="flex items-center gap-3 p-3.5 bg-[#00271a] border border-[#E3BA63]/30 rounded-xl">
                <div className="bg-[#E3BA63] text-[#011E15] p-2 rounded-full font-bold">
                  <FiUser />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-[#FAF7F0] text-sm truncate">{user.name}</p>
                  <p className="text-xs text-[#E3BA63] capitalize font-semibold">{user.role}</p>
                </div>
              </div>
              
              <hr className="border-[#E3BA63]/20" />
              
              <Link to="/profile" onClick={toggleMenu} className="text-base font-medium text-[#FAF7F0] hover:text-[#E3BA63] transition-colors">
                My Profile
              </Link>
              <Link to="/orders" onClick={toggleMenu} className="text-base font-medium text-[#FAF7F0] hover:text-[#E3BA63] transition-colors">
                My Orders
              </Link>
              
              {user.role === 'admin' && (
                <Link to="/admin" onClick={toggleMenu} className="text-base font-bold text-[#E3BA63] hover:underline">
                  ⭐ Admin Panel
                </Link>
              )}
              
              <hr className="border-[#E3BA63]/20" />
              
              <Link to="/about" onClick={toggleMenu} className="text-base font-medium text-[#FAF7F0] hover:text-[#E3BA63] transition-colors">
                About Us
              </Link>
              <Link to="/contact" onClick={toggleMenu} className="text-base font-medium text-[#FAF7F0] hover:text-[#E3BA63] transition-colors">
                Contact Us
              </Link>
              
              <button 
                onClick={() => { logout(); toggleMenu(); }} 
                className="mt-6 flex items-center gap-2 justify-center bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 py-2.5 rounded-xl font-bold transition-all duration-200"
              >
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/about" onClick={toggleMenu} className="text-base font-medium text-[#FAF7F0] hover:text-[#E3BA63] transition-colors">
                About Us
              </Link>
              <Link to="/contact" onClick={toggleMenu} className="text-base font-medium text-[#FAF7F0] hover:text-[#E3BA63] transition-colors">
                Contact Us
              </Link>
              
              <hr className="border-[#E3BA63]/20" />
              
              <Link to="/login" onClick={toggleMenu} className="text-base font-medium text-[#FAF7F0] hover:text-[#E3BA63] transition-colors">
                Login
              </Link>
              <Link to="/register" onClick={toggleMenu} className="text-base font-bold text-[#E3BA63] hover:underline">
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

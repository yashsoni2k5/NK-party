import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiSearch, FiShoppingCart, FiUser, FiX, FiLogOut, FiHome, FiGift, FiTruck, FiRefreshCcw } from 'react-icons/fi';

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


      <nav className="bg-white text-gray-800 px-3 sm:px-6 py-3 md:py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        
        {/* Left Side - Burger Menu */}
        <div className="flex items-center gap-2 sm:gap-4 z-10">
          <button 
            onClick={toggleMenu} 
            className="text-xl sm:text-2xl text-gray-800 hover:text-[#AC666D] transition-colors p-1"
            aria-label="Open Navigation Menu"
          >
            <FiMenu />
          </button>
        </div>

        {/* Center - Logo (Perfectly centered) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img src="/nkparty.jpeg" alt="Logo" className="h-8 sm:h-10 w-8 sm:w-10 object-cover rounded-md" />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl serif font-bold text-gray-900 leading-none tracking-tight">NK Party</span>
              <span className="text-[7px] sm:text-[9px] uppercase tracking-[0.2em] text-gray-500 mt-0.5">Celebrate With Style</span>
            </div>
          </Link>
        </div>
        
        {/* Right Side - Search, Cart, Home, Profile Icons */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-5 z-10">

          <Link 
            to="/" 
            className="text-xl sm:text-2xl text-gray-800 hover:text-[#AC666D] transition-colors p-1 hidden sm:block"
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
                  className="bg-white text-gray-800 border border-gray-300 px-3 py-1.5 rounded-full outline-none text-xs sm:text-sm w-36 sm:w-48 md:w-52 shadow-sm focus:border-[#AC666D]"
                />
              </form>
            )}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)} 
              className="text-xl sm:text-2xl hover:text-[#AC666D] transition-colors p-1"
            >
              <FiSearch />
            </button>
          </div>

          <Link 
            to="/cart" 
            className="text-xl sm:text-2xl hover:text-[#AC666D] transition-colors p-1 relative"
          >
            <FiShoppingCart />
            <span className="absolute top-0 right-0 bg-[#AC666D] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              0
            </span>
          </Link>

          <Link
            to={user ? "/profile" : "/login"}
            className="hidden sm:inline-flex text-xl sm:text-2xl hover:text-[#AC666D] transition-colors p-1"
          >
            <FiUser />
          </Link>
        </div>
      </nav>

      {/* Slide-in Burger Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={toggleMenu}
        />
      )}

      {/* Slide-in Burger Menu Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-white text-gray-800 border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 serif">Menu</h2>
          <button onClick={toggleMenu} className="text-2xl text-gray-500 hover:text-[#AC666D]">
            <FiX />
          </button>
        </div>

        <div className="flex flex-col p-5 space-y-4">
          {user ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <div className="bg-[#AC666D] text-white p-2 rounded-full font-bold">
                  <FiUser />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-gray-800 text-sm truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
              
              <hr className="border-gray-100" />
              
              <Link to="/profile" onClick={toggleMenu} className="text-sm font-semibold text-gray-700 hover:text-[#AC666D] transition-colors uppercase tracking-wide">My Profile</Link>
              <Link to="/orders" onClick={toggleMenu} className="text-sm font-semibold text-gray-700 hover:text-[#AC666D] transition-colors uppercase tracking-wide">My Orders</Link>
              
              {user.role === 'admin' && (
                <Link to="/admin" onClick={toggleMenu} className="text-sm font-bold text-[#AC666D] hover:underline uppercase tracking-wide">
                  ⭐ Admin Panel
                </Link>
              )}
              
              <hr className="border-gray-100" />
              
              <Link to="/about" onClick={toggleMenu} className="text-sm font-semibold text-gray-700 hover:text-[#AC666D] transition-colors uppercase tracking-wide">About Us</Link>
              <Link to="/contact" onClick={toggleMenu} className="text-sm font-semibold text-gray-700 hover:text-[#AC666D] transition-colors uppercase tracking-wide">Contact Us</Link>
              
              <button 
                onClick={() => { logout(); toggleMenu(); }} 
                className="mt-6 flex items-center gap-2 justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-bold transition-all duration-200 text-sm uppercase tracking-wide"
              >
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/about" onClick={toggleMenu} className="text-sm font-semibold text-gray-700 hover:text-[#AC666D] transition-colors uppercase tracking-wide">About Us</Link>
              <Link to="/contact" onClick={toggleMenu} className="text-sm font-semibold text-gray-700 hover:text-[#AC666D] transition-colors uppercase tracking-wide">Contact Us</Link>
              
              <hr className="border-gray-100" />
              
              <Link to="/login" onClick={toggleMenu} className="text-sm font-semibold text-gray-700 hover:text-[#AC666D] transition-colors uppercase tracking-wide">Login</Link>
              <Link to="/register" onClick={toggleMenu} className="text-sm font-bold text-[#AC666D] hover:underline uppercase tracking-wide">Create Account</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiSearch, FiShoppingCart, FiUser, FiX, FiLogOut } from 'react-icons/fi';

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
      <nav className="bg-black text-white px-4 md:px-6 py-6 flex items-center justify-between shadow-md relative z-50">
        
        {/* Left Side - Burger Menu */}
        <div className="flex items-center gap-4 z-10">
          <button onClick={toggleMenu} className="text-2xl hover:text-gray-300 transition-colors">
            <FiMenu />
          </button>
        </div>

        {/* Center - Logo & Text */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
          <Link to="/" className="hover:opacity-80 transition-opacity flex flex-col items-center">
            <img src="/nkparty.jpeg" alt="NKparty Logo" className="h-10 md:h-12 object-contain rounded-sm" />
            <span className="text-[10px] md:text-xs text-gray-300 font-medium tracking-widest mt-1 uppercase">
              Celebrate With Style
            </span>
          </Link>
        </div>
        
        {/* Right Side - Search & Cart Icons */}
        <div className="flex items-center gap-5 z-10">
          
          {/* Expandable Search */}
          <div className="flex items-center">
            {isSearchOpen && (
              <form onSubmit={handleSearchSubmit} className="mr-2 animate-pulse">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  autoFocus
                  className="bg-gray-800 text-white px-3 py-1 rounded-full outline-none text-sm w-32 md:w-48 transition-all"
                />
              </form>
            )}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)} 
              className="text-2xl hover:text-gray-300 transition-colors"
            >
              <FiSearch />
            </button>
          </div>

          {/* Cart Icon */}
          <Link to="/cart" className="text-2xl hover:text-gray-300 transition-colors">
            <FiShoppingCart />
          </Link>
        </div>
      </nav>

      {/* Slide-in Burger Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleMenu}
        />
      )}

      {/* Slide-in Burger Menu Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-white text-black z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b flex justify-between items-center bg-gray-100">
          <h2 className="text-xl font-bold">Menu</h2>
          <button onClick={toggleMenu} className="text-2xl hover:text-red-500">
            <FiX />
          </button>
        </div>

        <div className="flex flex-col p-4 space-y-4">
          {user ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                <div className="bg-black text-white p-2 rounded-full"><FiUser /></div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
              <hr />
              <Link to="/profile" onClick={toggleMenu} className="text-lg font-medium hover:text-blue-600">My Profile</Link>
              <Link to="/orders" onClick={toggleMenu} className="text-lg font-medium hover:text-blue-600">My Orders</Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={toggleMenu} className="text-lg font-medium text-yellow-600 hover:text-yellow-700">Admin Panel</Link>
              )}
              <hr />
              <Link to="/about" onClick={toggleMenu} className="text-lg font-medium hover:text-blue-600">About Us</Link>
              <Link to="/contact" onClick={toggleMenu} className="text-lg font-medium hover:text-blue-600">Contact Us</Link>
              
              <button 
                onClick={() => { logout(); toggleMenu(); }} 
                className="mt-6 flex items-center gap-2 justify-center bg-red-600 text-white py-2 rounded hover:bg-red-700"
              >
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/about" onClick={toggleMenu} className="text-lg font-medium hover:text-blue-600">About Us</Link>
              <Link to="/contact" onClick={toggleMenu} className="text-lg font-medium hover:text-blue-600">Contact Us</Link>
              <hr />
              <Link to="/login" onClick={toggleMenu} className="text-lg font-medium hover:text-blue-600">Login</Link>
              <Link to="/register" onClick={toggleMenu} className="text-lg font-medium text-blue-600">Create Account</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

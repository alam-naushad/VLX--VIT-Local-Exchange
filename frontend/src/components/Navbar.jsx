import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Avatar from './Avatar';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm glass-nav">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-12">
          <Link to="/" className="text-2xl font-bold tracking-tight text-primary">VLX</Link>
          <div className="hidden md:flex gap-8 items-center">
            {user && (
              <>
                <Link to="/dashboard" className="font-sans text-sm font-medium text-slate-600 hover:text-primary transition-all duration-300 hover:opacity-80">Dashboard</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="font-sans text-sm font-bold text-secondary hover:text-primary transition-all duration-300 hover:opacity-80">Admin</Link>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button 
                onClick={handleLogout}
                className="hidden lg:block px-5 py-2 text-sm font-medium text-slate-600 hover:text-error transition-all"
              >
                Logout
              </button>
              <Link to="/dashboard" className="w-10 h-10 rounded-full overflow-hidden border-2 border-surface-container-high hover:border-primary transition-colors">
                <Avatar src={user.profileImage} name={user.name} className="w-full h-full" />
              </Link>
              <Link to="/create-listing" className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform">
                Sell
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden lg:block px-5 py-2 text-sm font-medium text-slate-600 hover:text-primary transition-all">Login</Link>
              <Link to="/register" className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

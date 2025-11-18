import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const { getTotalItems } = useCart();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/products', label: 'Browse', icon: '🔍' },
    { path: '/cart', label: 'Cart', icon: '🛒', badge: getTotalItems() },
  ];

  const userNavItems = isAuthenticated
    ? [
        { path: '/orders', label: 'My Orders', icon: '📦' },
        { path: '/profile', label: 'Profile', icon: '👤' },
      ]
    : [];

  return (
    <div className="bg-spotify-black w-64 h-screen fixed left-0 top-0 flex flex-col p-6 border-r border-spotify-gray/30">
      {/* Logo */}
      <Link to="/" className="mb-8 group">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-spotify-green via-green-500 to-emerald-400 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-glow animate-pulse-glow">
            ⚡
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold gradient-text tracking-tight">Pulse</h1>
            <p className="text-spotify-text text-xs font-medium">Store</p>
          </div>
        </div>
      </Link>

      {/* Main Navigation */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center justify-between px-4 py-3.5 rounded-lg transition-all group ${
                  isActive(item.path)
                    ? 'bg-spotify-gray text-white shadow-lg'
                    : 'text-spotify-text hover:text-white hover:bg-spotify-gray/50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className={`text-xl transition-transform ${
                    isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'
                  }`}>
                    {item.icon}
                  </span>
                  <span className="font-semibold">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-spotify-green text-black text-xs font-bold px-2.5 py-1 rounded-full min-w-[24px] text-center animate-scale-in">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}

          {isAuthenticated && (
            <>
              <div className="border-t border-spotify-gray/30 my-4" />
              {userNavItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-4 px-4 py-3.5 rounded-lg transition-all group ${
                      isActive(item.path)
                        ? 'bg-spotify-gray text-white shadow-lg'
                        : 'text-spotify-text hover:text-white hover:bg-spotify-gray/50'
                    }`}
                  >
                    <span className={`text-xl transition-transform ${
                      isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="font-semibold">{item.label}</span>
                  </Link>
                </li>
              ))}
            </>
          )}
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t border-spotify-gray/30 pt-4">
        {isAuthenticated ? (
          <div className="animate-fade-in">
            <div className="mb-4 px-4 py-3 bg-spotify-gray/30 rounded-lg">
              <p className="text-spotify-text text-xs mb-1 font-medium">Logged in as</p>
              <p className="text-white font-semibold truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 bg-spotify-lightgray text-white px-4 py-3 rounded-lg hover:bg-spotify-gray transition-all font-semibold group"
            >
              <span className="group-hover:scale-110 transition-transform">🚪</span>
              <span>Log out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2 animate-fade-in">
            <Link
              to="/login"
              className="block w-full bg-spotify-green text-black text-center font-bold px-4 py-3 rounded-lg hover:bg-green-400 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-spotify-green/50"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="block w-full glass border border-spotify-lightgray text-white text-center font-semibold px-4 py-3 rounded-lg hover:bg-spotify-lightgray hover:border-spotify-green transition-all"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-spotify-green/0 via-spotify-green/50 to-spotify-green/0" />
    </div>
  );
};

export default Sidebar;

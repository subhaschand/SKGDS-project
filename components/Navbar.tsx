
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const Navbar: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black text-blue-600 flex items-center gap-2">
          <i className="fas fa-graduation-cap"></i>
          SKGDP
        </Link>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">Dashboard</Link>
              <div className="flex items-center gap-3 bg-gray-100 px-3 py-1 rounded-full">
                <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded uppercase">
                  {user.role}
                </span>
                <span className="text-sm font-medium">{user.fullName}</span>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500">
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="text-blue-600 font-semibold">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { User, UserRole } from '../types';
import { authAPI } from '../services/api';

const Login: React.FC = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      
      // Convert API response to User type
      const user: User = {
        id: response.id.toString(),
        email: response.email,
        fullName: response.fullName,
        rollNumber: response.rollNumber,
        role: response.role as UserRole,
        avatar: response.avatar,
      };
      
      login(user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-12 rounded-[3.5rem] shadow-2xl mt-12 border border-gray-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16"></div>
      
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-100">
           <i className="fas fa-lock text-2xl"></i>
        </div>
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Command Center</h2>
        <p className="text-gray-400 font-bold text-sm mt-1">Sign in to access your intelligence dashboard</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3 animate-shake">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Institutional Email</label>
          <input 
            type="email" 
            required
            className="w-full p-5 border-2 border-gray-100 rounded-2xl bg-gray-50/30 focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-800" 
            placeholder="name@uni.edu"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Access Token (Password)</label>
          <input 
            type="password" 
            required
            className="w-full p-5 border-2 border-gray-100 rounded-2xl bg-gray-50/30 focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-800" 
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-5 rounded-[1.5rem] font-black text-xl hover:bg-blue-600 shadow-2xl shadow-gray-200 transition-all active:scale-95 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Authenticating...' : 'Initialize Session'}
        </button>
      </form>

      <div className="mt-10 text-center space-y-4">
        <p className="text-gray-400 font-bold text-sm">
          Don't have an account? 
          <Link to="/register" className="text-blue-600 ml-2 hover:underline">Register New Profile</Link>
        </p>
        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Secure Portal v2.5</div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default Login;

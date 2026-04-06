
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, UserRole } from '../types';
import { authAPI } from '../services/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    rollNumber: '',
    password: '',
    role: UserRole.STUDENT
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        rollNumber: formData.rollNumber,
        role: formData.role,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-white p-12 rounded-[3.5rem] shadow-2xl mt-12 border-2 border-green-100 text-center animate-bounce-in">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-check-circle text-4xl"></i>
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Registration Successful!</h2>
        <p className="text-gray-500 font-bold">Your profile has been synchronized. Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-12 rounded-[4rem] shadow-2xl mt-8 border border-gray-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32"></div>
      
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Create Profile</h2>
        <p className="text-gray-400 font-bold text-sm mt-1">Join the intelligence network today</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Full Name</label>
            <input 
              required
              className="w-full p-4 border-2 border-gray-100 rounded-2xl bg-gray-50/30 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold" 
              placeholder="e.g. John Doe"
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Institutional Email</label>
            <input 
              type="email"
              required
              className="w-full p-4 border-2 border-gray-100 rounded-2xl bg-gray-50/30 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold" 
              placeholder="name@uni.edu"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Roll Number (User ID)</label>
            <input 
              required
              className="w-full p-4 border-2 border-gray-100 rounded-2xl bg-gray-50/30 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold" 
              placeholder="e.g. 2024CS001"
              value={formData.rollNumber}
              onChange={e => setFormData({...formData, rollNumber: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Access Password</label>
            <input 
              type="password"
              required
              className="w-full p-4 border-2 border-gray-100 rounded-2xl bg-gray-50/30 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold" 
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">System Role</label>
          <div className="flex gap-4">
            <div className="flex-grow py-5 rounded-2xl font-black text-lg bg-indigo-600 border-2 border-indigo-600 text-white shadow-xl shadow-indigo-100 text-center">
              Student Learner
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">Faculty accounts are created by administrators</p>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-900 text-white py-5 rounded-[1.5rem] font-black text-xl hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all active:scale-95 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Profile...' : 'Finalize Registration'}
        </button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-gray-400 font-bold text-sm">
          Already registered? 
          <Link to="/login" className="text-indigo-600 ml-2 hover:underline">Log In Here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

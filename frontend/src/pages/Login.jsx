import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [unverified, setUnverified] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUnverified(false);
    setLoading(true);
    
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.unverified) {
        setUnverified(true);
      }
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col items-center justify-center overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 -right-20 w-[32rem] h-[32rem] bg-secondary/10 rounded-full blur-3xl -z-10"></div>
      
      <section className="w-full flex justify-center px-6 py-12 md:py-24 z-10">
        <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-surface-container-lowest rounded-3xl shadow-xl shadow-on-surface/5 border border-outline-variant/10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-on-background">Welcome Back</h2>
            <p className="text-sm font-medium text-on-surface-variant mt-2">Log in directly to your VLX account.</p>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-error-container/30 text-error text-sm rounded-xl font-medium border border-error/10">
                {error}
              </div>
            )}
            
            {unverified && (
              <div className="p-3 bg-yellow-50 text-yellow-700 text-sm rounded-xl font-medium border border-yellow-200">
                Please verify your email before logging in.
              </div>
            )}

            <div className="relative group">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 pl-4 pr-12 rounded-xl bg-surface-container-high border-none focus:ring-2 focus:ring-primary transition-all placeholder:text-slate-400 font-medium" 
                placeholder="student.name2024@vitstudent.ac.in" 
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant">mail</span>
            </div>

            <div className="relative group">
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 pl-4 pr-12 rounded-xl bg-surface-container-high border-none focus:ring-2 focus:ring-primary transition-all placeholder:text-slate-400 font-medium" 
                placeholder="••••••••" 
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant">lock</span>
            </div>
            
            <button 
              type="submit"
              disabled={loading || !email || !password}
              className={`w-full h-14 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                email && password ? 'bg-gradient-to-r from-primary to-primary-container text-white cursor-pointer hover:shadow-lg hover:scale-[1.02]' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-70'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <span className="material-symbols-outlined text-xl">login</span>
            </button>
          </div>
          <div className="mt-6 text-center text-sm font-medium text-on-surface-variant">
            Don't have an account? <Link to="/register" className="text-primary hover:underline">Register here.</Link>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Pindahkan ke dashboard setelah berhasil login
      navigate('/admin'); 
    } catch (err) {
      console.error(err);
      setError('Akses ditolak: Email atau Password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative z-10 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md p-8 bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/20 shadow-[0_0_40px_rgba(34,211,238,0.15)]"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">
            SYSTEM ACCESS
          </h2>
          <p className="text-sm text-slate-400 mt-2 tracking-widest">AUTHORIZED PERSONNEL ONLY</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-center text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-semibold tracking-wide text-slate-300">ADMIN EMAIL</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="w-full p-4 bg-black/20 border border-slate-600 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all placeholder:text-slate-600 text-cyan-50"
              placeholder="admin@portfolio.com"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold tracking-wide text-slate-300">PASSWORD</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="w-full p-4 bg-black/20 border border-slate-600 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all text-cyan-50"
              placeholder="••••••••"
            />
          </div>
          <button 
            disabled={loading}
            type="submit" 
            className="w-full py-4 mt-8 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold tracking-widest rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'AUTHENTICATING...' : 'LOGIN'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;

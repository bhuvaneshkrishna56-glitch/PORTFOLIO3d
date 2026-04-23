import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiMail, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { loginAdmin } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

/**
 * Admin login page
 * Allows admin to authenticate for certificate upload access
 */
const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in - Fix for black screen loop
  useEffect(() => {
    if (user) {
      navigate('/secure-dashboard-access');
    }
  }, [user, navigate]);

  if (user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginAdmin(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      navigate('/secure-dashboard-access');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24" id="admin-login-page">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-accent-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent-secondary/8 rounded-full blur-[150px]" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm mb-6 transition-colors"
        >
          <FiArrowLeft size={16} />
          Back to Home
        </button>

        <div className="glass-card p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary p-0.5">
              <div className="w-full h-full bg-dark-700 rounded-[14px] flex items-center justify-center">
                <FiLock className="text-accent-primary" size={24} />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Admin Access</h1>
            <p className="text-text-muted text-sm">
              Sign in to manage your portfolio
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-text-secondary text-sm font-medium">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-600 border border-dark-400 text-text-primary text-sm focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 outline-none transition-all"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-text-secondary text-sm font-medium">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-dark-600 border border-dark-400 text-text-primary text-sm focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-error text-sm bg-error/10 border border-error/20 rounded-lg p-3"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-text-muted text-xs text-center">
            Contact the site owner to get admin credentials
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;

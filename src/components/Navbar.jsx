import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiExternalLink, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { logoutAdmin } from '../services/authService';
import { fetchProfile } from '../services/profileService';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [resumeUrl, setResumeUrl] = useState('/resume.pdf');

  useEffect(() => {
     const getProfile = async () => {
        const { profile } = await fetchProfile();
        if (profile?.resume_url) setResumeUrl(profile.resume_url);
     };
     getProfile();
  }, []);

  const handleLogout = async () => {
    await logoutAdmin();
    setIsOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: 'Certificates', path: '/certificates' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'py-4 glass-morphism shadow-xl' : 'py-6 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition-transform shadow-lg shadow-accent-primary/20">
            E
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight group-hover:text-accent-primary transition-colors">Ebinesar A</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-bold">Portfolio</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-semibold transition-all hover:text-accent-primary relative group ${
                location.pathname === link.path ? 'text-accent-primary' : 'text-text-secondary'
              }`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-primary transition-all group-hover:w-full ${
                location.pathname === link.path ? 'w-full' : ''
              }`} />
            </Link>
          ))}
          
          {!user ? (
            <Link to="/system-mgmt-ebinesar" className="text-xs font-bold text-text-muted hover:text-accent-primary transition-colors tracking-widest uppercase">
              Admin
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/secure-dashboard-access" className="text-xs font-bold text-accent-primary hover:bg-accent-primary/10 px-3 py-1.5 rounded-lg transition-colors tracking-widest uppercase">
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="text-xs font-bold text-error/80 hover:text-error transition-colors tracking-widest uppercase flex items-center gap-1"
              >
                <FiLogOut size={14} /> Logout
              </button>
            </div>
          )}
          <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-bold text-accent-secondary border border-accent-secondary/30 px-3 py-1.5 rounded-lg hover:bg-accent-secondary/10 transition-all">
            Resume <FiExternalLink size={12} />
          </a>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-text-primary p-2">
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-morphism border-t border-glass-border overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg font-semibold ${
                    location.pathname === link.path ? 'text-accent-primary' : 'text-text-secondary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {!user && (
                <Link
                  to="/system-mgmt-ebinesar"
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-semibold text-text-muted hover:text-accent-primary transition-colors"
                >
                  Admin Access
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

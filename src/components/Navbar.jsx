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
  const [name, setName] = useState('Ebinesar A');
  const [logoError, setLogoError] = useState(false);
  const [activeTheme, setActiveTheme] = useState(() => {
    try {
      const cached = localStorage.getItem('portfolio_custom_styles');
      if (cached) {
        return JSON.parse(cached).active_theme || '';
      }
    } catch (e) {}
    return '';
  });

  useEffect(() => {
     const getProfile = async () => {
        const { profile } = await fetchProfile();
        if (profile) {
          if (profile.resume_url) setResumeUrl(profile.resume_url);
          if (profile.full_name) setName(profile.full_name);
          if (profile.active_theme) setActiveTheme(profile.active_theme);
        }
     };
     getProfile();

     const interval = setInterval(async () => {
       const { profile } = await fetchProfile();
       if (profile?.active_theme) {
         setActiveTheme(profile.active_theme);
       }
     }, 3000);
     return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

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

  const navLinks = (activeTheme === 'pixar_3d' || activeTheme === 'prestigelio' || activeTheme === 'vivid_video' || activeTheme === 'dev_desk' || activeTheme === 'forged_garage' || activeTheme === 'scrollytelling' || activeTheme === 'akash_studio' || activeTheme === 'instagram_harsh' || activeTheme === 'physics_stack' || activeTheme === 'room_tour' || activeTheme === 'scroll_rider' || activeTheme === 'avatar_bento' || activeTheme === 'scrub_avatar') ? [
    { name: 'About', path: '/#about' },
    { name: 'Skills', path: '/#skills' },
    { name: 'Projects', path: '/#projects' },
    { name: 'Certificates', path: '/#certificates' },
    { name: 'Experience', path: '/#experience' },
    { name: 'Contact', path: '/#contact' }
  ] : [
    { name: 'Home', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: 'Certificates', path: '/certificates' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (link) => {
    if (link.path.startsWith('/#')) {
      return location.hash === link.path.substring(1);
    }
    return location.pathname === link.path;
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'py-4 glass-morphism shadow-xl' : 'py-6 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-accent-primary/20 ${
            logoError ? 'bg-gradient-to-br from-accent-primary to-accent-secondary' : 'border border-white/10 bg-dark-700'
          }`}>
            {!logoError ? (
              <img
                src="/logo.jpg"
                alt="Logo"
                className="w-full h-full object-cover"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-white font-bold text-xl">{name.charAt(0)}</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight group-hover:text-accent-primary transition-colors">
              {name}
            </span>
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
                isActive(link) ? 'text-accent-primary' : 'text-text-secondary'
              }`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-primary transition-all group-hover:w-full ${
                isActive(link) ? 'w-full' : ''
              }`} />
            </Link>
          ))}
          
          {user && (
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
                    isActive(link) ? 'text-accent-primary' : 'text-text-secondary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-lg font-semibold text-accent-secondary">
                Resume <FiExternalLink size={14} />
              </a>
              {user && (
                <div className="flex flex-col gap-3 pt-2 border-t border-glass-border">
                  <Link to="/secure-dashboard-access" onClick={() => setIsOpen(false)} className="text-lg font-semibold text-accent-primary">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="text-lg font-semibold text-error/80 text-left flex items-center gap-2">
                    <FiLogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

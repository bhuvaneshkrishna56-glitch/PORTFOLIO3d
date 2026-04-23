import { Link } from 'react-router-dom';
import { FiGithub, FiLinkedin, FiTwitter, FiMail } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <FiGithub size={18} />, href: 'https://github.com', label: 'GitHub' },
    { icon: <FiLinkedin size={18} />, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: <FiTwitter size={18} />, href: 'https://twitter.com', label: 'Twitter' },
    { icon: <FiMail size={18} />, href: 'mailto:hello@example.com', label: 'Email' },
  ];

  return (
    <footer className="border-t border-glass-border bg-dark-900/80" id="site-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-lg font-bold gradient-text">Portfolio</span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed">
              Crafting digital experiences with modern technologies and creative design.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-text-primary font-semibold text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <div className="flex flex-col gap-2">
              {[
                { path: '/', label: 'Home' },
                { path: '/projects', label: 'Projects' },
                { path: '/certificates', label: 'Certificates' },
                { path: '/contact', label: 'Contact' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-text-muted hover:text-accent-primary text-sm transition-colors w-fit"
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/system-mgmt-ebinesar" className="mt-4 pt-2 border-t border-white/5 text-[10px] text-text-muted hover:text-accent-primary transition-colors flex items-center gap-1 uppercase tracking-widest font-bold">
                System Access
              </Link>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="text-text-primary font-semibold text-sm uppercase tracking-wider">
              Connect
            </h4>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-dark-500/50 hover:bg-accent-primary/20 flex items-center justify-center text-text-muted hover:text-accent-primary transition-all duration-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-glass-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">
            © {currentYear} Portfolio. All rights reserved.
          </p>
          <p className="text-text-muted text-xs">
            Built with React, Three.js & Firebase
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiMapPin, FiSend, FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
import { fetchProfile } from '../services/profileService';
import { useEffect } from 'react';

/**
 * Contact page with a contact form and social links
 */
const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [profile, setProfile] = useState({
    email: 'hello@example.com',
    location: 'Remote / Worldwide',
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com',
    twitter_url: 'https://twitter.com'
  });

  useEffect(() => {
    const getProfile = async () => {
      const { profile: data } = await fetchProfile();
      if (data) {
        setProfile({
          email: data.email || 'hello@example.com',
          location: data.location || 'Remote / Worldwide',
          github_url: data.github_url || 'https://github.com',
          linkedin_url: data.linkedin_url || 'https://linkedin.com',
          twitter_url: data.twitter_url || 'https://twitter.com'
        });
      }
    };
    getProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    // Simulate send — replace with actual email service (e.g., EmailJS, Resend)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSending(false);
    setSent(true);
    setFormData({ name: '', email: '', subject: '', message: '' });

    setTimeout(() => setSent(false), 4000);
  };

  const socialLinks = [
    { icon: <FiGithub size={20} />, href: profile.github_url, label: 'GitHub', color: 'hover:text-white' },
    { icon: <FiLinkedin size={20} />, href: profile.linkedin_url, label: 'LinkedIn', color: 'hover:text-blue-400' },
    { icon: <FiTwitter size={20} />, href: profile.twitter_url, label: 'Twitter', color: 'hover:text-sky-400' },
  ];

  const inputClasses = 'w-full px-4 py-3.5 rounded-xl bg-dark-600 border border-dark-400 text-text-primary text-sm focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 outline-none transition-all placeholder:text-text-muted';

  return (
    <div className="page-container" id="contact-page">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="section-heading"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-text-secondary text-base sm:text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
            Have a project in mind or just want to say hello? I'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Contact Info */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="glass-card p-7 sm:p-8 space-y-7">
              <h3 className="text-lg font-semibold text-text-primary">Contact Info</h3>
              
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-accent-primary/10 flex items-center justify-center shrink-0">
                    <FiMail className="text-accent-primary" size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-text-primary text-sm font-medium">Email</p>
                    <a href={`mailto:${profile.email}`} className="text-text-secondary text-sm hover:text-accent-primary transition-colors">
                      {profile.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-accent-secondary/10 flex items-center justify-center shrink-0">
                    <FiMapPin className="text-accent-secondary" size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-text-primary text-sm font-medium">Location</p>
                    <p className="text-text-secondary text-sm">{profile.location}</p>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-glass-border">
                <p className="text-text-muted text-xs mb-4 uppercase tracking-wider font-medium">Follow me</p>
                <div className="flex gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-11 h-11 rounded-xl bg-dark-500/50 flex items-center justify-center text-text-muted ${social.color} transition-all duration-300 hover:bg-dark-400/50`}
                      aria-label={social.label}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="glass-card p-7 sm:p-8 lg:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-text-secondary text-sm font-medium">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={inputClasses}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-text-secondary text-sm font-medium">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={inputClasses}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-text-secondary text-sm font-medium">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="Project Inquiry"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-text-secondary text-sm font-medium">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className={`${inputClasses} resize-none`}
                    placeholder="Tell me about your project..."
                  />
                </div>

                {/* Success message */}
                {sent && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-4 rounded-xl bg-success/10 text-success text-sm border border-success/20"
                  >
                    ✓ Message sent successfully! I'll get back to you soon.
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="btn-glow w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    'Sending...'
                  ) : (
                    <>
                      <FiSend size={16} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

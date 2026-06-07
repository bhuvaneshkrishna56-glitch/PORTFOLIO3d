import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAward, FiSearch, FiCalendar, FiClock } from 'react-icons/fi';
import { fetchCertificates } from '../services/certificateService';
import CertificateCard from '../components/CertificateCard';
import CertificateModal from '../components/CertificateModal';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Public-facing Certificates page
 * Displays certificates from Firestore in a responsive grid
 * Clicking a certificate opens a preview modal
 */
const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Filter and Sorting states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const loadCertificates = useCallback(async () => {
    setLoading(true);
    const result = await fetchCertificates();
    if (result.error) {
      setError(result.error);
    } else {
      setCertificates(result.certificates);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  const handleCertificateClick = (cert) => {
    setSelectedCert(cert);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCert(null);
  };

  // Get available years from certificates dynamically
  const availableYears = ['All', ...new Set(certificates
    .map(cert => {
      const d = cert.date || cert.created_at;
      return d ? new Date(d).getFullYear().toString() : null;
    })
    .filter(Boolean)
  )].sort((a, b) => {
    if (a === 'All') return -1;
    if (b === 'All') return 1;
    return b - a;
  });

  // Filter and Sort certificates
  const filteredCertificates = certificates
    .filter(cert => {
      const matchesSearch = cert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cert.issuer?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const certYear = (cert.date || cert.created_at) 
        ? new Date(cert.date || cert.created_at).getFullYear().toString() 
        : '';
      const matchesYear = selectedYear === 'All' || certYear === selectedYear;

      return matchesSearch && matchesYear;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || a.created_at || 0);
      const dateB = new Date(b.date || b.created_at || 0);
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="page-container select-none pt-28 pb-20 px-6 sm:px-8" id="certificates-page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            My <span className="gradient-text">Certificates</span>
          </h1>
          <p className="text-text-secondary text-base sm:text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
            Professional certifications and achievements showcasing continuous learning
          </p>
        </motion.div>

        {/* Controls Container */}
        <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          {/* Search */}
          <div className="relative w-full md:max-w-xs group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by title or issuer..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-dark-800 border border-glass-border rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-accent-primary transition-all text-text-primary"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-center md:justify-end">
            {/* Year filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted font-medium uppercase tracking-wider flex items-center gap-1">
                <FiCalendar size={12} /> Year:
              </span>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="bg-dark-800 border border-glass-border rounded-xl px-4 py-2 text-sm text-text-secondary focus:border-accent-primary outline-none transition-all cursor-pointer"
              >
                {availableYears.map(year => (
                  <option key={year} value={year} className="bg-dark-900">{year}</option>
                ))}
              </select>
            </div>

            {/* Sort by Date */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted font-medium uppercase tracking-wider flex items-center gap-1">
                <FiClock size={12} /> Sort:
              </span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-dark-800 border border-glass-border rounded-xl px-4 py-2 text-sm text-text-secondary focus:border-accent-primary outline-none transition-all cursor-pointer"
              >
                <option value="newest" className="bg-dark-900">Newest First</option>
                <option value="oldest" className="bg-dark-900">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && <LoadingSpinner message="Loading certificates..." />}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            className="text-center py-16 space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-error text-sm">{error}</p>
            <button onClick={loadCertificates} className="btn-glow text-sm">Retry</button>
          </motion.div>
        )}

        {/* Certificates Grid */}
        {!loading && !error && filteredCertificates.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            <AnimatePresence mode="popLayout">
              {filteredCertificates.map((cert, i) => (
                <CertificateCard
                  key={cert.id}
                  certificate={cert}
                  index={i}
                  onClick={handleCertificateClick}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State / No matches */}
        {!loading && !error && (certificates.length === 0 || filteredCertificates.length === 0) && (
          <motion.div
            className="text-center py-24 space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-dark-600/60 flex items-center justify-center">
              <FiAward className="text-text-muted" size={36} />
            </div>
            <p className="text-text-secondary text-base">
              {certificates.length === 0 ? "No certificates uploaded yet." : "No certificates match your filters."}
            </p>
            <p className="text-text-muted text-sm">
              {certificates.length === 0 ? "Check back soon!" : "Try refining your search terms or filters."}
            </p>
          </motion.div>
        )}
      </div>

      {/* Preview Modal */}
      <CertificateModal
        certificate={selectedCert}
        isOpen={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Certificates;

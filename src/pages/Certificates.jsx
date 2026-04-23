import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiAward } from 'react-icons/fi';
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

  return (
    <div className="page-container" id="certificates-page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="section-heading"
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
        {!loading && !error && certificates.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {certificates.map((cert, i) => (
              <CertificateCard
                key={cert.id}
                certificate={cert}
                index={i}
                onClick={handleCertificateClick}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && certificates.length === 0 && (
          <motion.div
            className="text-center py-24 space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-dark-600/60 flex items-center justify-center">
              <FiAward className="text-text-muted" size={36} />
            </div>
            <p className="text-text-secondary text-base">No certificates uploaded yet.</p>
            <p className="text-text-muted text-sm">Check back soon!</p>
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

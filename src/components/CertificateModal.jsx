import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiCalendar, FiAward } from 'react-icons/fi';
import { getFileCategory } from '../utils/helpers';

/**
 * Certificate preview modal
 * Displays certificate image/PDF in a fullscreen overlay with metadata
 */
const CertificateModal = ({ certificate, isOpen, onClose }) => {
  if (!certificate) return null;

  const fileCategory = getFileCategory(certificate.file_type);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-dark-900/90 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Content */}
          <motion.div
            className="relative z-10 w-full max-w-4xl max-h-[90vh] glass-card overflow-hidden flex flex-col"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            id="certificate-modal"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-glass-border">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-text-primary truncate">
                  {certificate.title}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-text-muted">
                  {certificate.issuer && (
                    <span className="flex items-center gap-1">
                      <FiAward size={14} />
                      {certificate.issuer}
                    </span>
                  )}
                  {certificate.date && (
                    <span className="flex items-center gap-1">
                      <FiCalendar size={14} />
                      {certificate.date}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <a
                  href={certificate.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-dark-500/50 hover:bg-accent-primary/20 text-text-muted hover:text-accent-primary transition-all"
                  title="Download"
                >
                  <FiDownload size={18} />
                </a>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-dark-500/50 hover:bg-error/20 text-text-muted hover:text-error transition-all"
                  aria-label="Close modal"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {fileCategory === 'image' ? (
                <img
                  src={certificate.file_url}
                  alt={certificate.title}
                  className="w-full h-auto rounded-lg object-contain max-h-[70vh]"
                  loading="lazy"
                />
              ) : fileCategory === 'pdf' ? (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-center">
                    <a 
                      href={certificate.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-6 py-2 bg-accent-secondary/20 hover:bg-accent-secondary/30 text-accent-secondary text-xs font-bold rounded-full border border-accent-secondary/30 transition-all"
                    >
                      Open Full PDF View
                    </a>
                  </div>
                  <iframe
                    src={certificate.file_url}
                    title={certificate.title}
                    className="w-full h-[70vh] rounded-lg bg-white shadow-2xl"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-text-muted">
                  <p>Preview not available for this file type</p>
                </div>
              )}
            </div>

            {/* Description */}
            {certificate.description && (
              <div className="p-4 border-t border-glass-border">
                <p className="text-text-secondary text-sm leading-relaxed">
                  {certificate.description}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CertificateModal;

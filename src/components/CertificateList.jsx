import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiAward, FiExternalLink, FiAlertTriangle, FiX, FiFileText } from 'react-icons/fi';
import { deleteCertificate } from '../services/certificateService';

/**
 * Displays all certificates with file preview/icon, issuer, and delete functionality.
 * Delete includes confirmation dialog and removes both Storage file and Firestore doc.
 */
const CertificateList = ({ certificates, onCertificateDeleted }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [error, setError] = useState(null);

  const handleDeleteClick = (certId) => {
    setConfirmDeleteId(certId);
    setError(null);
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  /**
   * Execute delete: removes file from Storage + document from Firestore
   */
  const confirmDelete = async (cert) => {
    setDeletingId(cert.id);
    setConfirmDeleteId(null);

    const result = await deleteCertificate(cert.id, cert.file_path);

    if (result.error) {
      setError(`Failed to delete "${cert.title}": ${result.error}`);
    } else {
      if (onCertificateDeleted) onCertificateDeleted();
    }

    setDeletingId(null);
  };

  /**
   * Determine if file is an image based on MIME type
   */
  const isImage = (fileType) => {
    return fileType && fileType.startsWith('image/');
  };

  // Empty state
  if (!certificates || certificates.length === 0) {
    return (
      <div className="glass-card p-8 text-center" id="certificate-list-empty">
        <FiAward className="mx-auto text-text-muted mb-3" size={36} />
        <p className="text-text-muted text-sm">No certificates uploaded yet.</p>
        <p className="text-text-muted text-xs mt-1">Use the form above to upload your first certificate.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" id="certificate-list">
      <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
        📜 Certificates
        <span className="text-sm text-text-muted font-normal">({certificates.length})</span>
      </h3>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-error/10 text-error text-sm border border-error/20"
          >
            <FiAlertTriangle size={16} />
            {error}
            <button onClick={() => setError(null)} className="ml-auto hover:text-white">
              <FiX size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certificate cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificates.map((cert, index) => (
          <motion.div
            key={cert.id}
            className="glass-card overflow-hidden group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            layout
          >
            {/* Preview: Image or PDF icon */}
            <div className="relative w-full h-36 bg-gradient-to-br from-dark-600 to-dark-500 overflow-hidden">
              {isImage(cert.file_type) ? (
                <img
                  src={cert.file_url}
                  alt={cert.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-accent-secondary/10 flex items-center justify-center">
                    <FiFileText className="text-accent-secondary" size={24} />
                  </div>
                  <span className="text-text-muted text-xs uppercase tracking-wider">
                    {cert.file_name?.split('.').pop() || 'PDF'}
                  </span>
                </div>
              )}

              {/* View button overlay */}
              <a
                href={cert.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-dark-900/70 text-text-muted hover:text-accent-secondary opacity-0 group-hover:opacity-100 transition-all"
                title="View certificate"
              >
                <FiExternalLink size={14} />
              </a>
            </div>

            {/* Info */}
            <div className="p-4 space-y-2">
              <h4 className="text-sm font-semibold text-text-primary truncate">{cert.title}</h4>

              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <FiAward size={12} className="shrink-0" />
                <span className="truncate">{cert.issuer}</span>
              </div>

              {/* Delete */}
              <div className="flex items-center justify-between pt-2 border-t border-glass-border">
                <a
                  href={cert.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-text-secondary hover:text-accent-secondary transition-colors"
                >
                  View File
                </a>

                <div className="relative">
                  {confirmDeleteId === cert.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-error">Delete?</span>
                      <button
                        onClick={() => confirmDelete(cert)}
                        className="px-2 py-1 text-xs rounded-md bg-error/20 text-error hover:bg-error/40 transition-colors font-medium"
                      >
                        Yes
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="px-2 py-1 text-xs rounded-md bg-dark-500 text-text-muted hover:text-text-primary transition-colors"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDeleteClick(cert.id)}
                      disabled={deletingId === cert.id}
                      className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-all disabled:opacity-50"
                      title="Delete certificate"
                    >
                      {deletingId === cert.id ? (
                        <div className="w-4 h-4 border-2 border-error/40 border-t-error rounded-full animate-spin" />
                      ) : (
                        <FiTrash2 size={15} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CertificateList;

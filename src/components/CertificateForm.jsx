import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFile, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { addCertificate } from '../services/certificateService';

/**
 * Certificate input form with:
 * - Certificate Title
 * - Issuer Name
 * - File Upload (PDF or Image, max 10MB)
 *
 * On submit: uploads file to Storage, saves metadata to Firestore
 */
const CertificateForm = ({ onCertificateAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      // Enforce 10MB size limit
      if (selected.size > 10 * 1024 * 1024) {
        setStatus('error');
        setStatusMessage('File size must be less than 10MB');
        return;
      }
      setFile(selected);
      setStatus(null);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!file) {
      setStatus('error');
      setStatusMessage('Please select a certificate file');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const result = await addCertificate(formData, file, setProgress);

      if (result.error) {
        setStatus('error');
        setStatusMessage(result.error);
      } else {
        setStatus('success');
        setStatusMessage('Certificate uploaded successfully!');
        // Reset
        setFormData({ title: '', issuer: '' });
        setFile(null);
        if (onCertificateAdded) onCertificateAdded();
      }
    } catch (err) {
      setStatus('error');
      setStatusMessage(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const inputClasses =
    'w-full px-4 py-3 rounded-xl bg-dark-600 border border-dark-400 text-text-primary text-sm focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 outline-none transition-all placeholder:text-text-muted';

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      id="certificate-form"
    >
      <h3 className="text-xl font-semibold gradient-text-alt mb-6 flex items-center gap-2">
        <FiUploadCloud size={22} />
        Upload Certificate
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-text-secondary text-sm font-medium">Certificate Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className={inputClasses}
            placeholder="e.g., AWS Cloud Practitioner"
          />
        </div>

        {/* Issuer */}
        <div className="space-y-1.5">
          <label className="text-text-secondary text-sm font-medium">Issuer Name *</label>
          <input
            type="text"
            name="issuer"
            value={formData.issuer}
            onChange={handleChange}
            required
            className={inputClasses}
            placeholder="e.g., Amazon Web Services"
          />
        </div>

        {/* File Upload */}
        <div className="space-y-1.5">
          <label className="text-text-secondary text-sm font-medium">Certificate File *</label>
          {file ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-600 border border-dark-400">
              <FiFile className="text-accent-secondary shrink-0" size={22} />
              <div className="flex-1 min-w-0">
                <p className="text-text-primary text-sm truncate">{file.name}</p>
                <p className="text-text-muted text-xs">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-1.5 rounded-lg hover:bg-error/20 text-text-muted hover:text-error transition-all"
              >
                <FiX size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-dark-400 rounded-xl cursor-pointer hover:border-accent-secondary/50 transition-colors">
              <FiFile className="text-text-muted mb-2" size={28} />
              <span className="text-text-muted text-sm">Click to upload</span>
              <span className="text-text-muted text-xs mt-1">PDF, PNG, JPG (max 10MB)</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Progress */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Uploading...</span>
                <span className="text-accent-secondary font-medium">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-dark-500 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent-secondary to-accent-tertiary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status */}
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                status === 'success'
                  ? 'bg-success/10 text-success border border-success/20'
                  : 'bg-error/10 text-error border border-error/20'
              }`}
            >
              {status === 'success' ? <FiCheck size={16} /> : <FiAlertCircle size={16} />}
              {statusMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading}
          className="btn-glow w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {uploading ? 'Uploading...' : 'Upload Certificate'}
        </button>
      </form>
    </motion.div>
  );
};

export default CertificateForm;

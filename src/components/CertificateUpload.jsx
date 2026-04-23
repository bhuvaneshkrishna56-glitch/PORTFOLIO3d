import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFile, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { uploadCertificate } from '../services/certificateService';

/**
 * Certificate upload form with drag-and-drop
 * Only accessible to authenticated admin users
 */
const CertificateUpload = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({
    title: '',
    issuer: '',
    date: '',
    description: '',
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('');

  // Handle file drop
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      // Auto-fill title from filename if empty
      if (!metadata.title) {
        const name = acceptedFiles[0].name.replace(/\.[^/.]+$/, '');
        setMetadata((prev) => ({ ...prev, title: name }));
      }
    }
  }, [metadata.title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB limit
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus('error');
      setStatusMessage('Please select a file to upload');
      return;
    }

    setUploading(true);
    setProgress(0);
    setStatus(null);

    try {
      const result = await uploadCertificate(file, metadata, setProgress);

      if (result.error) {
        setStatus('error');
        setStatusMessage(result.error);
      } else {
        setStatus('success');
        setStatusMessage('Certificate uploaded successfully!');
        // Reset form
        setFile(null);
        setMetadata({ title: '', issuer: '', date: '', description: '' });
        if (onUploadComplete) onUploadComplete();
      }
    } catch (err) {
      setStatus('error');
      setStatusMessage(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setStatus(null);
  };

  return (
    <motion.div
      className="glass-card p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="certificate-upload-form"
    >
      <h3 className="text-xl font-semibold gradient-text">Upload Certificate</h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-accent-primary bg-accent-primary/5'
              : 'border-dark-400 hover:border-accent-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FiFile className="text-accent-primary" size={24} />
              <span className="text-text-primary text-sm">{file.name}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                className="p-1 rounded-full bg-dark-500 hover:bg-error/20 text-text-muted hover:text-error transition-all"
              >
                <FiX size={14} />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <FiUploadCloud className="mx-auto text-text-muted" size={40} />
              <p className="text-text-secondary text-sm">
                {isDragActive
                  ? 'Drop the file here...'
                  : 'Drag & drop a certificate, or click to select'}
              </p>
              <p className="text-text-muted text-xs">PDF, PNG, JPG, WEBP (max 10MB)</p>
            </div>
          )}
        </div>

        {/* Metadata Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-text-secondary text-sm font-medium">Title *</label>
            <input
              type="text"
              name="title"
              value={metadata.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-dark-600 border border-dark-400 text-text-primary text-sm focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 outline-none transition-all"
              placeholder="Certificate title"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-text-secondary text-sm font-medium">Issuer</label>
            <input
              type="text"
              name="issuer"
              value={metadata.issuer}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-lg bg-dark-600 border border-dark-400 text-text-primary text-sm focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 outline-none transition-all"
              placeholder="e.g., Google, AWS, Coursera"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-text-secondary text-sm font-medium">Date</label>
            <input
              type="date"
              name="date"
              value={metadata.date}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-lg bg-dark-600 border border-dark-400 text-text-primary text-sm focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-text-secondary text-sm font-medium">Description</label>
            <input
              type="text"
              name="description"
              value={metadata.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-lg bg-dark-600 border border-dark-400 text-text-primary text-sm focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 outline-none transition-all"
              placeholder="Brief description"
            />
          </div>
        </div>

        {/* Progress Bar */}
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
                <span className="text-accent-primary font-medium">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-dark-500 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Message */}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || !file}
          className="btn-glow w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
        >
          {uploading ? 'Uploading...' : 'Upload Certificate'}
        </button>
      </form>
    </motion.div>
  );
};

export default CertificateUpload;

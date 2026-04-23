import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiImage, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { addProject } from '../services/projectService';

/**
 * Project input form with all required fields:
 * - Title, Description, Tech Stack (comma-separated)
 * - GitHub Link, Deployed Link
 * - Image Upload (required)
 *
 * On submit: uploads image to Storage, saves all data to Firestore
 */
const ProjectForm = ({ onProjectAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: '',
    githubLink: '',
    deployedLink: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('');

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image file selection with preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    // Validate image is selected
    if (!imageFile) {
      setStatus('error');
      setStatusMessage('Please select an image for the project');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Convert comma-separated tech stack string to array
      const techStackArray = formData.techStack
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const projectData = {
        ...formData,
        techStack: techStackArray,
      };

      const result = await addProject(projectData, imageFile, setProgress);

      if (result.error) {
        setStatus('error');
        setStatusMessage(result.error);
      } else {
        setStatus('success');
        setStatusMessage('Project added successfully!');
        // Reset form
        setFormData({ title: '', description: '', techStack: '', githubLink: '', deployedLink: '' });
        setImageFile(null);
        setImagePreview(null);
        // Notify parent to refresh list
        if (onProjectAdded) onProjectAdded();
      }
    } catch (err) {
      setStatus('error');
      setStatusMessage(err.message || 'Failed to add project');
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
      transition={{ duration: 0.4 }}
      id="project-form"
    >
      <h3 className="text-xl font-semibold gradient-text mb-6 flex items-center gap-2">
        <FiUploadCloud size={22} />
        Add New Project
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-text-secondary text-sm font-medium">Project Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className={inputClasses}
            placeholder="e.g., E-Commerce Dashboard"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-text-secondary text-sm font-medium">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className={`${inputClasses} resize-none`}
            placeholder="Brief description of the project..."
          />
        </div>

        {/* Tech Stack */}
        <div className="space-y-1.5">
          <label className="text-text-secondary text-sm font-medium">Tech Stack (comma separated)</label>
          <input
            type="text"
            name="techStack"
            value={formData.techStack}
            onChange={handleChange}
            className={inputClasses}
            placeholder="React, Node.js, Firebase, Tailwind"
          />
        </div>

        {/* Links Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-text-secondary text-sm font-medium">GitHub Link</label>
            <input
              type="url"
              name="githubLink"
              value={formData.githubLink}
              onChange={handleChange}
              className={inputClasses}
              placeholder="https://github.com/user/repo"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-text-secondary text-sm font-medium">Deployed Link</label>
            <input
              type="url"
              name="deployedLink"
              value={formData.deployedLink}
              onChange={handleChange}
              className={inputClasses}
              placeholder="https://myproject.vercel.app"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-1.5">
          <label className="text-text-secondary text-sm font-medium">Project Image *</label>
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-dark-400">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-dark-900/80 hover:bg-error/30 text-text-muted hover:text-error transition-all"
              >
                <FiX size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-dark-400 rounded-xl cursor-pointer hover:border-accent-primary/50 transition-colors">
              <FiImage className="text-text-muted mb-2" size={32} />
              <span className="text-text-muted text-sm">Click to upload project image</span>
              <span className="text-text-muted text-xs mt-1">PNG, JPG, WEBP</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
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
                <span className="text-text-secondary">Uploading image...</span>
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

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading}
          className="btn-glow w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {uploading ? 'Uploading...' : 'Add Project'}
        </button>
      </form>
    </motion.div>
  );
};

export default ProjectForm;

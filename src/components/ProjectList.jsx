import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiExternalLink, FiGithub, FiAlertTriangle, FiX, FiFolder } from 'react-icons/fi';
import { deleteProject } from '../services/projectService';

/**
 * Displays all projects with image preview, links, and delete functionality.
 * Delete includes confirmation dialog and removes both Storage file and Firestore doc.
 */
const ProjectList = ({ projects, onProjectDeleted }) => {
  const [deletingId, setDeletingId] = useState(null);          // Currently deleting item
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // Delete confirmation target
  const [error, setError] = useState(null);

  /**
   * Show confirmation dialog before deleting
   */
  const handleDeleteClick = (projectId) => {
    setConfirmDeleteId(projectId);
    setError(null);
  };

  /**
   * Cancel delete confirmation
   */
  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  /**
   * Execute delete: removes image from Storage + document from Firestore
   */
  const confirmDelete = async (project) => {
    setDeletingId(project.id);
    setConfirmDeleteId(null);

    const result = await deleteProject(project.id, project.image_path);

    if (result.error) {
      setError(`Failed to delete "${project.title}": ${result.error}`);
    } else {
      // Notify parent to refresh list
      if (onProjectDeleted) onProjectDeleted();
    }

    setDeletingId(null);
  };

  // Empty state
  if (!projects || projects.length === 0) {
    return (
      <div className="glass-card p-8 text-center" id="project-list-empty">
        <FiFolder className="mx-auto text-text-muted mb-3" size={36} />
        <p className="text-text-muted text-sm">No projects added yet.</p>
        <p className="text-text-muted text-xs mt-1">Use the form above to add your first project.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" id="project-list">
      <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
        📁 Projects
        <span className="text-sm text-text-muted font-normal">({projects.length})</span>
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

      {/* Project cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            className="glass-card overflow-hidden group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            layout
          >
            {/* Image Preview */}
            {project.image_url && (
              <div className="relative w-full h-40 bg-dark-600 overflow-hidden">
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-text-primary truncate">{project.title}</h4>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">{project.description}</p>
                </div>
              </div>

              {/* Tech Stack Tags */}
              {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {project.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-[10px] rounded-md bg-accent-primary/10 text-accent-primary border border-accent-primary/20 font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {/* Links + Delete */}
              <div className="flex items-center gap-2 pt-2 border-t border-glass-border">
                {project.github_link && (
                  <a
                    href={project.github_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent-primary transition-colors"
                  >
                    <FiGithub size={13} />
                    GitHub
                  </a>
                )}
                {project.deployed_link && (
                  <a
                    href={project.deployed_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent-secondary transition-colors"
                  >
                    <FiExternalLink size={13} />
                    Live
                  </a>
                )}

                {/* Delete button */}
                <div className="ml-auto relative">
                  {confirmDeleteId === project.id ? (
                    // Confirmation UI
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-error">Delete?</span>
                      <button
                        onClick={() => confirmDelete(project)}
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
                      onClick={() => handleDeleteClick(project.id)}
                      disabled={deletingId === project.id}
                      className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-all disabled:opacity-50"
                      title="Delete project"
                    >
                      {deletingId === project.id ? (
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

export default ProjectList;

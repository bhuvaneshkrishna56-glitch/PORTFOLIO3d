import { motion } from 'framer-motion';
import { FiExternalLink, FiGithub } from 'react-icons/fi';

/**
 * Project card component with hover animations and glassmorphism
 * Shows project details in a card with 3D tilt effect on hover
 */
const ProjectCard = ({ project, index }) => {
  return (
    <motion.div
      className="glass-card p-6 flex flex-col gap-4 group cursor-pointer"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      id={`project-card-${index}`}
    >
      {/* Project Image / Gradient Placeholder */}
      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gradient-to-br from-dark-600 to-dark-500">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl">{project.emoji || '🚀'}</span>
        </div>
      </div>

      {/* Project Info */}
      <div className="flex-1 space-y-3">
        <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-text-muted text-sm leading-relaxed">
          {project.description}
        </p>
      </div>

      {/* Tech Stack Tags */}
      <div className="flex flex-wrap gap-2">
        {project.tags?.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 text-xs rounded-md bg-accent-primary/10 text-accent-primary border border-accent-primary/20 font-medium"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Links */}
      <div className="flex gap-3 pt-2 border-t border-glass-border">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent-secondary transition-colors"
          >
            <FiExternalLink size={14} />
            Live Demo
          </a>
        )}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent-primary transition-colors"
          >
            <FiGithub size={14} />
            Source Code
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectCard;

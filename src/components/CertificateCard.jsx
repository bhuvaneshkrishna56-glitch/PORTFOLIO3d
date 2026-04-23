import { motion } from 'framer-motion';
import { FiAward, FiCalendar, FiEye } from 'react-icons/fi';
import { getFileCategory } from '../utils/helpers';

/**
 * Individual certificate display card
 * Shows a thumbnail preview, title, issuer, and date
 */
const CertificateCard = ({ certificate, index, onClick }) => {
  const fileCategory = getFileCategory(certificate.file_type, certificate.file_name);

  return (
    <motion.div
      className="glass-card overflow-hidden cursor-pointer group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ scale: 1.03 }}
      onClick={() => onClick(certificate)}
      id={`certificate-card-${certificate.id}`}
    >
      {/* Thumbnail */}
      <div className="relative w-full h-48 bg-gradient-to-br from-dark-600 to-dark-500 overflow-hidden">
        {fileCategory === 'image' ? (
          <img
            src={certificate.file_url}
            alt={certificate.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <div className="w-14 h-14 rounded-xl bg-accent-primary/10 flex items-center justify-center">
              <FiAward className="text-accent-primary" size={28} />
            </div>
            <span className="text-text-muted text-xs uppercase tracking-wider">PDF Document</span>
          </div>
        )}

        {/* Hover overlay with view icon */}
        <div className="absolute inset-0 bg-dark-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-accent-primary/20 backdrop-blur-sm flex items-center justify-center border border-accent-primary/30">
            <FiEye className="text-white" size={20} />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h4 className="text-sm font-semibold text-text-primary truncate group-hover:text-accent-primary transition-colors">
          {certificate.title}
        </h4>
        <div className="flex items-center justify-between text-xs text-text-muted">
          {certificate.issuer && (
            <span className="flex items-center gap-1 truncate">
              <FiAward size={12} />
              {certificate.issuer}
            </span>
          )}
          {certificate.date && (
            <span className="flex items-center gap-1 shrink-0">
              <FiCalendar size={12} />
              {certificate.date}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CertificateCard;

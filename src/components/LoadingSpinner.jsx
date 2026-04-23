import { motion } from 'framer-motion';

const LoadingSpinner = ({ fullScreen = false, message = 'Loading Ebinesar\'s Portfolio...' }) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${fullScreen ? 'fixed inset-0 z-[100] bg-dark-950' : 'py-20'}`}>
      <div className="relative">
        {/* Outer Ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-accent-primary/10 border-t-accent-primary rounded-full"
        />
        {/* Inner Logo */}
        <div className="absolute inset-0 flex items-center justify-center font-bold text-accent-primary">
          E
        </div>
      </div>
      
      {/* Loading Skeletal Text simulation */}
      <div className="flex flex-col items-center space-y-2">
        <motion.p 
            animate={{ opacity: [1, 0.5, 1] }} 
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs font-bold uppercase tracking-widest text-text-muted"
        >
          {message}
        </motion.p>
        <div className="flex gap-1.5 pt-2">
          {[0, 1, 2].map(i => (
            <motion.div 
              key={i}
              animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-accent-secondary"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;

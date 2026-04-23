import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiBriefcase, FiAward } from 'react-icons/fi';
import { fetchExperiences } from '../services/cmsService';

const Experience = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getExperiences = async () => {
      const { experiences } = await fetchExperiences();
      setExperiences(experiences);
      setLoading(false);
    };
    getExperiences();
  }, []);

  if (loading || experiences.length === 0) return null;

  return (
    <section className="py-24 px-6 sm:px-8 border-t border-glass-border bg-dark-900/50" id="experience">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">My <span className="gradient-text">Journey</span></h2>
            <p className="text-text-muted text-sm uppercase tracking-widest">Professional path & achievements</p>
          </div>
        </div>

        <div className="space-y-12">
          {experiences.map((exp, idx) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-8 md:pl-0"
            >
              {/* Timeline line */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-accent-primary via-accent-secondary to-transparent md:left-1/2" />
              
              <div className={`flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Content Card */}
                <div className="w-full md:w-[45%]">
                  <div className="glass-morphism p-8 rounded-[2.5rem] border-white/5 hover:border-accent-primary/20 transition-all duration-500">
                    <div className="flex items-center gap-3 text-accent-primary text-xs font-bold mb-4">
                      <FiCalendar /> {exp.duration}
                    </div>
                    <h3 className="text-xl font-bold mb-1">{exp.role}</h3>
                    <p className="text-accent-secondary text-sm font-medium mb-4">{exp.company}</p>
                    <p className="text-text-secondary text-sm leading-relaxed mb-6">
                      {exp.description}
                    </p>
                    
                    {exp.achievements && exp.achievements.length > 0 && (
                      <div className="space-y-2">
                        {exp.achievements.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-text-muted">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-tertiary mt-1 shrink-0" />
                            {item}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Center Circle */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-dark-900 border-2 border-accent-primary items-center justify-center z-10 shadow-[0_0_15px_rgba(108,99,255,0.4)]">
                   <FiBriefcase className="text-accent-primary" size={16} />
                </div>

                {/* Empty space for alternate layout */}
                <div className="hidden md:block w-[45%]" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;

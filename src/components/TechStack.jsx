import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchSkills } from '../services/skillService';

const TechStack = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSkills = async () => {
      const { skills } = await fetchSkills();
      setSkills(skills);
      setLoading(false);
    };
    getSkills();
  }, []);

  const categories = ['Frontend', 'Backend', 'Programming', 'Tools'];

  if (loading) return null;

  return (
    <section className="py-24 px-6 relative overflow-hidden" id="tech-stack">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Professional <span className="gradient-text">Skillset</span></h2>
          <p className="text-text-muted text-sm uppercase tracking-[0.2em]">Crafting digital excellence with modern tools</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-morphism p-8 rounded-[2.5rem] border-white/5 hover:border-accent-primary/20 transition-all duration-500 group"
            >
              <h3 className="text-xs font-black uppercase tracking-widest text-accent-primary mb-8 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary shadow-[0_0_8px_rgba(108,99,255,0.8)]" />
                {cat}
              </h3>
              
              <div className="space-y-4">
                {skills.filter(s => s.category === cat).map((skill, i) => (
                  <div 
                    key={skill.id} 
                    className="flex items-center gap-3 group/item transition-transform hover:translate-x-2"
                  >
                    <div className="w-1 h-1 rounded-full bg-white/20 group-hover/item:bg-accent-primary transition-colors" />
                    <span className="text-sm font-medium text-text-secondary group-hover/item:text-white transition-colors">
                      {skill.name}
                    </span>
                  </div>
                ))}
                {skills.filter(s => s.category === cat).length === 0 && (
                  <p className="text-xs text-text-muted italic">No {cat.toLowerCase()} skills added yet.</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;

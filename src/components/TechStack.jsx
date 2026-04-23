import { motion } from 'framer-motion';
import { FiCode, FiDatabase, FiCloud, FiCpu } from 'react-icons/fi';

const TechStack = () => {
  const categories = [
    {
      title: 'Frontend',
      icon: <FiCode />,
      skills: ['React', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'Three.js']
    },
    {
      title: 'Backend',
      icon: <FiDatabase />,
      skills: ['Node.js', 'Express', 'Firebase', 'Supabase', 'Python']
    },
    {
      title: 'Tools',
      icon: <FiCloud />,
      skills: ['Docker', 'AWS', 'Vercel', 'Git & GitHub', 'Postman']
    },
    {
      title: 'Programming',
      icon: <FiCpu />,
      skills: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++']
    }
  ];

  return (
    <section className="py-20 px-6 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">Tech <span className="gradient-text">Stack</span></h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-morphism p-6 rounded-2xl hover:border-accent-primary/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary mb-4 text-xl">
                {cat.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4">{cat.title}</h3>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 rounded-full bg-white/5 text-xs text-text-secondary border border-white/5">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;

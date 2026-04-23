import { motion } from 'framer-motion';

const Experience = () => {
  const experiences = [
    {
      company: 'AppDost',
      role: 'Full Stack Development Intern',
      period: 'Jan 2024 - Present',
      desc: 'Developed scalable frontend architectures and integrated AI microservices using React and Node.js.',
      achievements: ['Optimized dashboard performance by 40%', 'Integrated LLM-based chatbots']
    },
    {
      company: 'Smart India Hackathon',
      role: 'Participant / Winner',
      period: 'Sept 2023',
      desc: 'Built a real-time disaster management system using Three.js and Firebase in 36 hours.',
      achievements: ['Won the Zonal Level prize', 'Managed lead frontend tasks']
    }
  ];

  return (
    <section className="py-20 px-6 sm:px-8 bg-black/20">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-16 text-center">My <span className="gradient-text">Journey</span></h2>
        <div className="space-y-12">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.company}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative pl-8 border-l-2 border-accent-primary/30"
            >
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-accent-primary shadow-[0_0_10px_rgba(108,99,255,0.5)]" />
              <p className="text-accent-primary font-mono text-sm mb-1">{exp.period}</p>
              <h3 className="text-2xl font-bold">{exp.company}</h3>
              <p className="text-lg text-text-secondary mb-3">{exp.role}</p>
              <p className="text-text-muted mb-4 leading-relaxed">{exp.desc}</p>
              <ul className="space-y-2">
                {exp.achievements.map((ach, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
                    {ach}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;

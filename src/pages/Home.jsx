import { lazy, Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiDownload, FiCheckCircle } from 'react-icons/fi';
import { fetchProfile } from '../services/profileService';
import { fetchProjects } from '../services/projectService';
import { fetchLearnings, fetchServices } from '../services/cmsService';
import TechStack from '../components/TechStack';
import Experience from '../components/Experience';

const HeroScene = lazy(() => import('../3d/HeroScene'));

const Home = () => {
  const [resumeUrl, setResumeUrl] = useState('/resume.pdf');
  const [projectCount, setProjectCount] = useState(0);
  const [techCount, setTechCount] = useState(0);
  const [dynLearnings, setDynLearnings] = useState([]);
  const [dynServices, setDynServices] = useState([]);

  useEffect(() => {
    const getStats = async () => {
      // 1. Fetch Profile for Resume
      const { profile } = await fetchProfile();
      if (profile?.resume_url) setResumeUrl(profile.resume_url);

      // 2. Fetch Projects for Stats
      const { projects } = await fetchProjects();
      if (projects) {
        setProjectCount(projects.length);
        const allTech = projects.flatMap(p => p.tech_stack || []);
        const uniqueTech = [...new Set(allTech)];
        setTechCount(uniqueTech.length);
      }

      // 3. Fetch CMS Data
      const [learnRes, servRes] = await Promise.all([fetchLearnings(), fetchServices()]);
      setDynLearnings(learnRes.learnings);
      setDynServices(servRes.services);
    };
    getStats();
  }, []);

  const stats = [
    { value: projectCount > 0 ? `${projectCount}+` : '0', label: 'Projects Built', color: 'text-accent-primary' },
    { value: techCount > 0 ? `${techCount}+` : '0', label: 'Technologies', color: 'text-accent-secondary' },
    { value: '1', label: 'Hackathon Win', color: 'text-accent-tertiary' },
    { value: 'Yes', label: 'Internships', color: 'text-green-400' },
  ];

  const services = [
    { title: 'Frontend Development', desc: 'Crafting responsive, high-performance UIs using React and Next.js.' },
    { title: 'Full Stack Web Apps', desc: 'End-to-end applications with secure backends and database design.' },
    { title: 'UI/UX Design', desc: 'Designing intuitive user interfaces with a focus on modern aesthetics.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden px-6 pt-16">
        <Suspense fallback={null}>
          <div className="absolute inset-0 z-0">
             <HeroScene />
          </div>
        </Suspense>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-morphism text-accent-primary text-xs font-bold uppercase tracking-widest"
          >
            <span className="w-2 h-2 rounded-full bg-accent-primary animate-ping" />
            Open for Internships
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-7xl font-extrabold leading-tight"
          >
            Building Scalable & <br />
            <span className="gradient-text">Modern Web Applications</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed"
          >
            Hi, I'm <span className="text-white font-semibold">Ebinesar A</span>. I specialize in Frontend & Full Stack development with a deep interest in AI integration and interactive 3D graphics.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/projects" className="btn-primary flex items-center gap-2">
              View Projects <FiArrowRight />
            </Link>
            <Link to="/contact" className="btn-secondary">Contact Me</Link>
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2 text-accent-primary border-accent-primary/20">
              <FiDownload /> Download Resume
            </a>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-morphism p-8 rounded-3xl text-center"
            >
              <h3 className={`text-4xl font-black mb-2 ${s.color}`}>{s.value}</h3>
              <p className="text-text-muted text-sm font-medium uppercase tracking-tight">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech Stack Visual Grid */}
      <TechStack />

      {/* Experience Timeline */}
      <Experience />

      {/* Learning Section */}
      <section className="py-20 px-6 sm:px-8">
        <div className="max-w-4xl mx-auto glass-morphism p-10 rounded-[2.5rem] border-accent-primary/10">
          <h2 className="text-2xl font-bold mb-8">🧠 Current <span className="text-accent-tertiary">Learning</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {dynLearnings.length > 0 ? dynLearnings.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <FiCheckCircle className="text-accent-secondary shrink-0" />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
            )) : (
               <p className="text-xs text-text-muted">Loading learnings...</p>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-6 sm:px-8 border-t border-glass-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {dynServices.length > 0 ? dynServices.map((svc, i) => (
              <div key={svc.id} className="space-y-4">
                <div className="w-12 h-0.5 bg-accent-primary" />
                <h3 className="text-xl font-bold">{svc.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{svc.description}</p>
              </div>
            )) : (
               <p className="text-xs text-text-muted">Loading services...</p>
            )}
          </div>
        </div>
      </section>

      {/* GitHub Integration Section */}
      <section className="py-20 px-6 bg-black/40">
        <div className="max-w-5xl mx-auto text-center space-y-12">
            <h2 className="text-3xl font-bold">Open Source <span className="gradient-text">Activity</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <img 
                    src="https://github-readme-stats.vercel.app/api?username=EbinesarA&show_icons=true&theme=transparent&title_color=6c63ff&text_color=adb5bd&icon_color=00d4ff" 
                    alt="GitHub Stats" 
                    className="w-full rounded-2xl border border-glass-border p-4 bg-dark-800/50"
                />
                <img 
                    src="https://github-readme-streak-stats.herokuapp.com/?user=EbinesarA&theme=transparent&ring=6c63ff&fire=ff6b9d&currStreakNum=adb5bd" 
                    alt="GitHub Streak" 
                    className="w-full rounded-2xl border border-glass-border p-4 bg-dark-800/50"
                />
            </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

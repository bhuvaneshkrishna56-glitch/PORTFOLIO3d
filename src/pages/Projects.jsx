import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiExternalLink, FiGithub, FiFolder, FiSearch, FiLayers, FiZap } from 'react-icons/fi';
import { fetchProjects } from '../services/projectService';
import LoadingSpinner from '../components/LoadingSpinner';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', 'HTML', 'JS', 'Full Stack', 'AI'];

  const loadProjects = useCallback(async () => {
    setLoading(true);
    const result = await fetchProjects();
    if (!result.error) setProjects(result.projects);
    setLoading(false);
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || p.techStack?.includes(activeFilter);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Advanced <span className="gradient-text">Project Gallery</span></h1>
          <p className="text-text-secondary max-w-2xl mx-auto">Showcasing real-world impact through innovative solutions and scalable code.</p>
        </motion.div>

        {/* Controls Container */}
        <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          {/* Search */}
          <div className="relative w-full md:max-w-xs group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search skills, projects..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-dark-800 border border-glass-border rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-accent-primary transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeFilter === cat 
                  ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20' 
                  : 'bg-dark-800 text-text-secondary border border-glass-border hover:bg-dark-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Project Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode='popLayout'>
              {filteredProjects.map((project, i) => (
                <motion.div
                  layout
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="glass-morphism rounded-3xl overflow-hidden group hover:border-accent-primary/30 transition-all flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="relative h-56 overflow-hidden">
                    {project.image_url ? (
                      <img src={project.image_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={project.title} />
                    ) : (
                      <div className="w-full h-full bg-dark-800 flex items-center justify-center text-accent-primary"><FiFolder size={40} /></div>
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 rounded-lg bg-dark-900/80 backdrop-blur-md text-[10px] font-bold text-accent-secondary border border-glass-border uppercase tracking-widest flex items-center gap-1">
                        <FiLayers size={10} /> Impact Project
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-7 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-accent-primary transition-colors">{project.title}</h3>
                    <p className="text-text-secondary text-sm mb-6 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>

                    {/* Features List Mini */}
                    <div className="mb-6 space-y-2">
                       <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-2">Key Highlights</p>
                       <div className="flex flex-wrap gap-2">
                          <span className="text-[11px] text-text-primary bg-white/5 px-2 py-0.5 rounded-md border border-white/5 flex items-center gap-1">
                            <FiZap className="text-yellow-400" size={10}/> Real-time Auth
                          </span>
                           <span className="text-[11px] text-text-primary bg-white/5 px-2 py-0.5 rounded-md border border-white/5 flex items-center gap-1">
                            <FiZap className="text-green-400" size={10}/> Scalable
                          </span>
                       </div>
                    </div>

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {project.tech_stack?.map(tag => (
                        <span key={tag} className="text-[10px] font-bold px-2 py-1 rounded bg-accent-primary/10 text-accent-primary border border-accent-primary/10 uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto pt-6 border-t border-glass-border flex items-center justify-between">
                      <div className="flex gap-4">
                        {project.github_link && (
                          <a href={project.github_link} className="text-text-muted hover:text-white transition-colors" title="View Source">
                            <FiGithub size={20} />
                          </a>
                        )}
                        {project.deployed_link && (
                          <a href={project.deployed_link} className="text-text-muted hover:text-accent-secondary transition-colors" title="Live Demo">
                            <FiExternalLink size={20} />
                          </a>
                        )}
                      </div>
                      <Link to={`/projects/${project.id}`} className="text-xs font-bold text-accent-primary hover:underline">
                        Case Study 
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;

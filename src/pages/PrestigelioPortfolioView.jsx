import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiGithub, 
  FiLinkedin, 
  FiInstagram, 
  FiTwitter, 
  FiArrowRight, 
  FiDownload, 
  FiCheckCircle, 
  FiCalendar, 
  FiBriefcase, 
  FiLayers, 
  FiZap, 
  FiFolder, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiAward, 
  FiSend, 
  FiStar,
  FiExternalLink
} from 'react-icons/fi';
import { fetchProfile } from '../services/profileService';
import { fetchProjects } from '../services/projectService';
import { fetchSkills } from '../services/skillService';
import { fetchExperiences } from '../services/cmsService';
import { fetchCertificates } from '../services/certificateService';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import CertificateModal from '../components/CertificateModal';
import LoadingSpinner from '../components/LoadingSpinner';

const HeroScene = lazy(() => import('../3d/HeroScene'));

// --- 3D TILT HOVER COMPONENT ---
const TiltCard = ({ children, className = '', glowColor = 'rgba(168, 85, 247, 0.12)' }) => {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCoords({ x, y });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setCoords({ x: 0, y: 0 });
  };

  const rotateX = isHovering ? -coords.y * 10 : 0;
  const rotateY = isHovering ? coords.x * 10 : 0;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${isHovering ? 1.015 : 1}, ${isHovering ? 1.015 : 1}, 1)`,
        transition: isHovering ? 'none' : 'transform 0.4s ease',
        transformStyle: 'preserve-3d',
        boxShadow: isHovering ? `0 0 25px ${glowColor}` : 'none'
      }}
      className={`glass-morphism transition-all duration-300 rounded-[2.5rem] overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
};

// --- 3D INTERACTIVE AVATAR SCENE ---
const PrestigelioAvatarScene = () => {
  const [texture, setTexture] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(1);
  const ref = useRef();

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load('/avatar.png', (tex) => {
      setTexture(tex);
      const img = tex.image;
      if (img) {
        setAspectRatio(img.width / img.height);
      }
    });
  }, []);

  useFrame((state) => {
    if (!texture || !ref.current) return;
    const { x, y } = state.pointer;

    // Tilt the entire 3D body structure to follow cursor
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, x * 0.45, 0.08);
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -y * 0.35, 0.08);

    // Parallax shift with gentle floating float animation
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, x * 0.4, 0.08);
    ref.current.position.y = THREE.MathUtils.lerp(
      ref.current.position.y,
      -0.2 - y * 0.25 + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.1,
      0.08
    );
  });

  if (!texture) return null;

  return (
    <group>
      {/* Dynamic cinematic spotlights hitting the character */}
      <spotLight position={[0, 8, 4]} angle={0.6} penumbra={1} intensity={12} color="#ffffff" castShadow />
      
      {/* Strong backlight purple neon glow directly behind the character */}
      <pointLight position={[0, 0, -2]} intensity={18} distance={8} color="#a855f7" />
      
      {/* Accent secondary glow */}
      <pointLight position={[-3, -1, -1]} intensity={8} distance={8} color="#c084fc" />

      {/* Floating particles around character */}
      <Sparkles count={80} scale={6} color="#a855f7" speed={1} size={2.5} />
      <Sparkles count={40} scale={5} color="#c084fc" speed={0.8} size={2} />

      {/* Main Avatar Mesh */}
      <mesh ref={ref} position={[0, -0.4, 0]}>
        <planeGeometry args={[4.2 * aspectRatio, 4.2]} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>
    </group>
  );
};

const PrestigelioPortfolioView = () => {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('/resume.pdf');

  // Form State
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [profRes, projRes, skillRes, expRes, certRes] = await Promise.all([
          fetchProfile(),
          fetchProjects(),
          fetchSkills(),
          fetchExperiences(),
          fetchCertificates()
        ]);

        if (profRes.profile) {
          setProfile(profRes.profile);
          if (profRes.profile.resume_url) setResumeUrl(profRes.profile.resume_url);
        }
        setProjects(projRes.projects || []);
        setSkills(skillRes.skills || []);
        setExperiences(expRes.experiences || []);
        setCertificates(certRes.certificates || []);
      } catch (e) {
        console.error('Failed to load prestigelio data:', e);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleInputChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormLoading(true);
    setTimeout(() => {
      setFormLoading(false);
      setFormSuccess(true);
      setFormState({ name: '', email: '', message: '' });
      setTimeout(() => setFormSuccess(false), 5000);
    }, 1500);
  };

  if (loading) return <LoadingSpinner fullScreen message="Setting up Prestigelio digital studio..." />;

  // Default Stats if empty
  const statItems = [
    { value: '5+', label: 'Years Experience', color: 'from-purple-400 to-indigo-400' },
    { value: projects.length > 0 ? `${projects.length}+` : '50+', label: 'Global Clients', color: 'from-blue-400 to-cyan-400' },
    { value: '12', label: 'Design Awards', color: 'from-pink-400 to-rose-400' }
  ];

  // Default Skills if empty
  const defaultSkills = [
    { name: 'React', category: 'Frontend' },
    { name: 'Tailwind CSS', category: 'Frontend' },
    { name: 'Next.js', category: 'Frontend' },
    { name: 'HTML', category: 'Frontend' },
    { name: 'CSS', category: 'Frontend' },
    { name: 'JavaScript', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Express.js', category: 'Backend' },
    { name: 'Nest.js', category: 'Backend' },
    { name: 'Python', category: 'Backend' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'Redis', category: 'Database' },
    { name: 'MySQL', category: 'Database' },
    { name: 'Git', category: 'Tools' },
    { name: 'Figma', category: 'Tools' },
    { name: 'Docker', category: 'Tools' },
    { name: 'VS Code', category: 'Tools' }
  ];

  const displaySkills = skills.length > 0 ? skills : defaultSkills;
  const categories = ['Frontend', 'Backend', 'Database', 'Tools'];

  // Default Projects if empty
  const defaultProjects = [
    {
      id: 'p1',
      title: 'Admin Dashboard',
      description: 'A real-time analytical tracking platform built with React and Tailwind CSS. Features multi-tenant auth, design architecture and dynamic chart statistics.',
      tech_stack: ['React', 'Tailwind', 'Recharts'],
      github_link: '#',
      deployed_link: '#'
    },
    {
      id: 'p2',
      title: 'Neural Connect',
      description: 'An AI-powered networking tool using Node.js and OpenAI API. Designed for high-speed connectivity and sub-millisecond response latency.',
      tech_stack: ['Node.js', 'OpenAI', 'Redis'],
      github_link: '#',
      deployed_link: '#'
    }
  ];

  const displayProjects = projects.length > 0 ? projects : defaultProjects;

  // Default Experiences if empty
  const defaultExperiences = [
    {
      id: 'e1',
      company: 'Digital Solutions Agency',
      role: 'Senior Web Assistant',
      duration: '2023 - Present',
      description: 'Working on core web product architectures, client portal setups, and optimizing page load speeds by 40% using Next.js code splitting.'
    },
    {
      id: 'e2',
      company: 'Tech Institute of Technology',
      role: 'B.S. in Computer Science',
      duration: '2021 - 2025',
      description: 'Acquired core knowledge in software development, data structures, algorithms, and 3D web technologies.'
    }
  ];

  const displayExperiences = experiences.length > 0 ? experiences : defaultExperiences;

  return (
    <div 
      style={{ backgroundColor: 'var(--color-dark-950)', color: 'var(--color-text-primary)' }}
      className="min-h-screen selection:bg-purple-500/30 overflow-x-hidden relative"
    >
      
      {/* GLOW DECORATIONS */}
      <div className="absolute top-[25%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[60%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[150px] pointer-events-none z-0" />

      {/* HERO SECTION */}
      <section className="relative min-h-screen w-full flex items-center justify-center px-6 sm:px-16 overflow-hidden pt-28 pb-16" id="hero">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-7xl mx-auto w-full z-10">
          
          {/* Left Side: Avatar Card */}
          <div className="lg:col-span-5 flex justify-center">
            <TiltCard 
              className="w-full max-w-[380px] aspect-[4/5] bg-dark-900 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative flex items-center justify-center pointer-events-auto"
              glowColor="rgba(168, 85, 247, 0.25)"
            >
              {/* Inner card glow backing */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none" />
              
              <div className="w-full h-full relative z-10">
                <Suspense fallback={<div className="w-full h-full bg-dark-800 animate-pulse rounded-[2.5rem]" />}>
                  <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} className="w-full h-full">
                    <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
                    <Suspense fallback={null}>
                      <PrestigelioAvatarScene />
                      <Environment preset="studio" />
                      <ambientLight intensity={0.6} />
                      <pointLight position={[10, 10, 10]} intensity={1.5} />
                    </Suspense>
                  </Canvas>
                </Suspense>
              </div>
            </TiltCard>
          </div>

          {/* Right Side: Hero Text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.span 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-bold uppercase tracking-[0.25em] text-purple-400 block"
            >
              {profile?.role || "Creative Fullstack"}
            </motion.span>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-1"
            >
              <h1 className="text-4xl sm:text-5xl font-black uppercase leading-none tracking-tight text-white">
                {profile?.full_name || "Ebinesar A"}
              </h1>
              <h1 className="text-3xl sm:text-4xl font-extrabold uppercase leading-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
                {profile?.hero_title || "Building Scalable & Modern Web Applications"}
              </h1>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-sm max-w-lg leading-relaxed"
            >
              {profile?.hero_description || "I specialize in constructing scaleable, robust web applications with a focus on immersive interactive experiences and responsive user interfaces."}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-4 flex flex-wrap gap-4"
            >
              <a href="#projects" className="px-8 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-purple-600/20 transition-all">
                Explore Work
              </a>
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-3 rounded-full border border-purple-500/30 text-white font-bold text-sm tracking-wide hover:bg-purple-500/10 transition-all flex items-center gap-2">
                <FiDownload /> Download Resume
              </a>
              <a href="#contact" className="px-8 py-3 rounded-full border border-white/10 text-white font-bold text-sm tracking-wide hover:bg-white/5 transition-all">
                Let's Talk
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ABOUT ME SECTION */}
      <section className="py-24 px-6 sm:px-16 max-w-7xl mx-auto relative z-10" id="about">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-extrabold uppercase text-left mb-16 tracking-tight"
        >
          <span className="text-purple-400">01.</span> About Me
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
        >
          {/* Bio & Details Card */}
          <div className="lg:col-span-8">
            <TiltCard className="p-10 h-full border border-white/5 bg-dark-900/50 flex flex-col justify-between" glowColor="rgba(108, 99, 255, 0.08)">
              <div className="space-y-8 text-left">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">High-Quality Engineering</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {profile?.hero_description || "I contribute to building critical, robust and responsive web applications with a focus on Frontend and Full Stack. My design systems bridge the gap between creative visual experiences and high-performance server structures."}
                  </p>
                </div>

                <div id="experience" className="border-t border-white/5 pt-8 space-y-6">
                  {displayExperiences.map((exp, idx) => (
                    <div key={exp.id || idx} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-purple-400 shrink-0 mt-1">
                        {exp.role.includes('B.S.') || exp.role.includes('Degree') || exp.role.includes('Education') ? <FiAward size={18} /> : <FiBriefcase size={18} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-md">{exp.role}</h4>
                        <p className="text-xs text-gray-400 font-semibold">{exp.company} ({exp.duration})</p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TiltCard>
          </div>

          {/* Vertical Stats Column */}
          <div className="lg:col-span-4 flex flex-col gap-6 justify-between">
            {statItems.map((stat, idx) => (
              <TiltCard 
                key={idx} 
                className="py-8 px-6 border border-white/5 bg-dark-900/40 text-center flex flex-col justify-center items-center flex-1 h-28" 
                glowColor="rgba(59, 130, 246, 0.1)"
              >
                <h3 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </h3>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
              </TiltCard>
            ))}
          </div>
        </motion.div>
      </section>

      {/* TECHNICAL STACK SECTION */}
      <section className="py-24 px-6 sm:px-16 max-w-7xl mx-auto relative z-10" id="skills">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-extrabold uppercase text-left mb-16 tracking-tight"
        >
          <span className="text-purple-400">02.</span> Technical Stack
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
        >
          {/* Left side: Skills grid */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {categories.map((cat) => (
              <div key={cat} className="glass-morphism p-6 rounded-3xl border border-white/5 bg-dark-900/30">
                <h4 className="text-xs font-black uppercase text-purple-400 tracking-[0.2em] mb-4 pb-1.5 border-b border-white/5 flex items-center gap-1.5">
                  <FiStar size={12} className="text-purple-400 animate-pulse" /> {cat === 'Database' ? 'Database & Cloud' : cat}
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {displaySkills.filter(s => {
                    const mappedCat = s.category === 'Programming' ? 'Database' : s.category;
                    return mappedCat === cat;
                  }).map(skill => (
                    <span 
                      key={skill.name} 
                      className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:border-purple-500/50 hover:bg-purple-600/5 transition-all"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right side: 3D Laptop Canvas */}
          <div className="lg:col-span-5 h-[380px] w-full relative z-10 flex items-center justify-center rounded-[2.5rem] overflow-hidden border border-white/5 bg-dark-900/20">
            <Suspense fallback={<LoadingSpinner message="Assembling 3D Laptop..." />}>
              <HeroScene />
            </Suspense>
          </div>
        </motion.div>
      </section>

      {/* FEATURED WORKS SECTION */}
      <section className="py-24 px-6 sm:px-16 max-w-7xl mx-auto relative z-10" id="projects">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-extrabold uppercase text-left mb-16 tracking-tight"
        >
          <span className="text-purple-400">03.</span> Featured Works
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {displayProjects.map((project, idx) => (
            <TiltCard key={project.id || idx} className="p-8 border border-white/5 bg-dark-900/40 flex flex-col justify-between" glowColor="rgba(192, 132, 252, 0.1)">
              <div className="space-y-6 text-left">
                {/* Visual mockup block */}
                <div className="relative aspect-[16/10] w-full rounded-2xl bg-gradient-to-br from-indigo-950 to-purple-950 border border-white/5 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-grid-white/[0.02] z-0" />
                  <div className="relative z-10 p-6 w-full text-center">
                    {/* Mock dashboard screenshot layout */}
                    {idx === 0 ? (
                      <div className="w-[85%] mx-auto bg-dark-900 rounded-xl border border-white/10 p-4 shadow-2xl scale-95 hover:scale-100 transition-transform duration-500">
                        <div className="flex gap-1.5 mb-3">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="w-2 h-2 rounded-full bg-yellow-500" />
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-1 h-20 rounded bg-white/5 border border-white/5" />
                          <div className="col-span-2 h-20 rounded bg-white/5 border border-white/5" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-28 h-28 mx-auto flex items-center justify-center bg-white/5 border border-white/5 rounded-full animate-float">
                        <div className="w-16 h-16 border-2 border-dashed border-purple-500 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
                        <FiZap className="absolute text-purple-400" size={32} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-white flex justify-between items-center">
                    {project.title}
                    <FiFolder size={18} className="text-purple-400" />
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5">
                <div className="flex gap-4">
                  {project.deployed_link && (
                    <a href={project.deployed_link} className="px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] tracking-wider uppercase transition-all" target="_blank" rel="noopener noreferrer">
                      Live Demo
                    </a>
                  )}
                  {project.github_link && (
                    <a href={project.github_link} className="px-4 py-1.5 rounded-full border border-white/10 text-white font-bold text-[10px] tracking-wider uppercase hover:bg-white/5 transition-all flex items-center gap-1" target="_blank" rel="noopener noreferrer">
                      <FiGithub /> GitHub
                    </a>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                  Production
                </span>
              </div>
            </TiltCard>
          ))}
        </motion.div>
      </section>

      {/* CERTIFICATES SECTION */}
      <section className="py-24 px-6 sm:px-16 max-w-7xl mx-auto relative z-10" id="certificates">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-left mb-16 space-y-2"
        >
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-purple-400">04. Achievements</h2>
          <h3 className="text-4xl font-extrabold uppercase tracking-tight">Certifications</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {certificates.map((cert) => (
              <div 
                key={cert.id} 
                onClick={() => {
                  setSelectedCert(cert);
                  setModalOpen(true);
                }}
                className="cursor-pointer"
              >
                <TiltCard className="p-6 border border-white/5 bg-dark-900/40 h-full flex flex-col justify-between" glowColor="rgba(59, 130, 246, 0.12)">
                  <div className="space-y-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-purple-650/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <FiAward size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm line-clamp-2">{cert.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{cert.issuer}</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    <span>{cert.date}</span>
                    <span className="text-purple-400 hover:text-purple-355 transition-colors">View Preview →</span>
                  </div>
                </TiltCard>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-morphism p-10 rounded-[2rem] text-center border border-white/5 bg-dark-900/20 text-gray-400 text-sm">
             No certificates uploaded yet. Manage them in the dashboard.
          </div>
        )}
        </motion.div>
      </section>

      {/* CONTACT SECTION */}
      <section className="py-24 px-6 sm:px-16 max-w-4xl mx-auto relative z-10" id="contact">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-4xl font-extrabold uppercase tracking-tight">Get In <span className="text-purple-400">Touch</span></h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">Have a project in mind? Let's build something exceptional together.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <TiltCard className="p-10 border border-white/5 bg-dark-900/40" glowColor="rgba(168, 85, 247, 0.1)">
            <form onSubmit={handleFormSubmit} className="space-y-6 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formState.name}
                    onChange={handleInputChange}
                    placeholder="John Doe" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm outline-none focus:border-purple-500 transition-all text-white placeholder-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formState.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm outline-none focus:border-purple-500 transition-all text-white placeholder-gray-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Message</label>
                <textarea 
                  name="message"
                  required
                  rows="5"
                  value={formState.message}
                  onChange={handleInputChange}
                  placeholder="Tell me about your project..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm outline-none focus:border-purple-500 transition-all text-white placeholder-gray-600 resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={formLoading}
                className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {formLoading ? 'Sending message...' : <><FiSend /> Send Message</>}
              </button>
              
              <AnimatePresence>
                {formSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center text-xs font-bold"
                  >
                    ✓ Thank you! Your message has been sent successfully.
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </TiltCard>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 sm:px-16 border-t border-white/5 bg-black/60 relative z-10 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-sm font-black uppercase text-white tracking-widest">{profile?.full_name || 'Ebinesar A'}</span>
            <span>© 2026 {profile?.full_name || 'Ebinesar A'}, Engineered to standard.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Open Source</a>
          </div>
        </div>
      </footer>
      <CertificateModal
        certificate={selectedCert}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCert(null);
        }}
      />
    </div>
  );
};

export default PrestigelioPortfolioView;

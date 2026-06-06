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
  FiCpu,
  FiSettings
} from 'react-icons/fi';
import { fetchProfile } from '../services/profileService';
import { fetchProjects } from '../services/projectService';
import { fetchSkills } from '../services/skillService';
import { fetchExperiences } from '../services/cmsService';
import { fetchCertificates } from '../services/certificateService';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Grid, Sparkles, TorusKnot, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import CertificateModal from '../components/CertificateModal';
import LoadingSpinner from '../components/LoadingSpinner';

const HeroScene = lazy(() => import('../3d/HeroScene'));

// --- 3D TILT HOVER COMPONENT ---
const TiltCard = ({ children, className = '', glowColor = 'rgba(224, 90, 43, 0.15)' }) => {
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

// --- 3D INTERACTIVE INDUSTRIAL SCENE ---
const ForgedGarageScene = () => {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    const { x, y } = state.pointer;

    // Gentle camera follow/tilt for mechanical core inside the card
    ref.current.rotation.y = THREE.MathUtils.lerp(
      ref.current.rotation.y,
      state.clock.getElapsedTime() * 0.15 + x * 0.35,
      0.08
    );
    ref.current.rotation.x = THREE.MathUtils.lerp(
      ref.current.rotation.x,
      state.clock.getElapsedTime() * 0.1 - y * 0.25,
      0.08
    );

    // Dynamic floating translation
    ref.current.position.y = THREE.MathUtils.lerp(
      ref.current.position.y,
      -0.4 + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.1,
      0.08
    );
  });

  return (
    <group>
      {/* Industrial spotlight safety lights */}
      <spotLight position={[3, 6, 3]} angle={0.5} penumbra={1} intensity={12} color="#e05a2b" castShadow />
      <spotLight position={[-3, 6, 3]} angle={0.5} penumbra={1} intensity={8} color="#7a7a85" />
      
      {/* Molten amber backlight */}
      <pointLight position={[0, -0.5, -2]} intensity={15} distance={6} color="#d97706" />

      {/* Safety orange grid floor closer to core */}
      <group position={[0, -2.5, -3]} rotation={[Math.PI / 2.2, 0, 0]}>
        <Grid infiniteGrid sectionSize={1} sectionColor="#e05a2b" sectionThickness={1.2} fadeDistance={15} cellColor="#1c1917" />
      </group>

      {/* Floating Orange Sparks */}
      <Sparkles count={100} scale={5} color="#e05a2b" speed={1.5} size={2.5} />
      <Sparkles count={60} scale={4} color="#d97706" speed={1.2} size={1.8} />

      {/* Rotating Industrial Mechanical Core */}
      <group ref={ref} position={[0, -0.4, 0]}>
        <TorusKnot args={[1.1, 0.32, 100, 16]}>
          <meshStandardMaterial 
            color="#222" 
            metalness={1.0} 
            roughness={0.15} 
          />
        </TorusKnot>
        
        {/* Inner core sphere */}
        <Sphere args={[0.55, 32, 32]}>
          <meshBasicMaterial color="#d97706" toneMapped={false} />
        </Sphere>
        
        <pointLight intensity={6} distance={4} color="#d97706" />
      </group>

      {/* Steel Column Columns */}
      <group position={[-2.5, 0.5, -2]} rotation={[0, 0.3, 0]}>
        <mesh>
          <boxGeometry args={[0.2, 5, 0.2]} />
          <meshStandardMaterial color="#111" metalness={0.8} roughness={0.4} />
        </mesh>
        <mesh scale={[1.05, 1.05, 1.05]}>
          <boxGeometry args={[0.2, 5, 0.2]} />
          <meshBasicMaterial color="#e05a2b" wireframe transparent opacity={0.3} />
        </mesh>
      </group>

      <group position={[2.5, 0.5, -2]} rotation={[0, -0.3, 0]}>
        <mesh>
          <boxGeometry args={[0.2, 5, 0.2]} />
          <meshStandardMaterial color="#111" metalness={0.8} roughness={0.4} />
        </mesh>
        <mesh scale={[1.05, 1.05, 1.05]}>
          <boxGeometry args={[0.2, 5, 0.2]} />
          <meshBasicMaterial color="#e05a2b" wireframe transparent opacity={0.3} />
        </mesh>
      </group>
    </group>
  );
};

const ForgedGaragePortfolioView = () => {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);

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
        console.error('Failed to load forged_garage data:', e);
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

  if (loading) return <LoadingSpinner fullScreen message="Activating Industrial Systems..." />;

  // Default Stats
  const statItems = [
    { value: projects.length > 0 ? `${projects.length}+` : '15+', label: 'COMPILATIONS_FINISHED', color: 'from-orange-500 to-amber-500' },
    { value: skills.length > 0 ? `${skills.length}+` : '20+', label: 'SKILLS_REGISTERED', color: 'from-amber-500 to-yellow-600' },
    { value: '2+', label: 'OPERATIONAL_YEARS', color: 'from-zinc-400 to-zinc-650' }
  ];

  // Default Skills
  const defaultSkills = [
    { name: 'HTML', category: 'Frontend' },
    { name: 'CSS', category: 'Frontend' },
    { name: 'JavaScript', category: 'Frontend' },
    { name: 'React', category: 'Frontend' },
    { name: 'Tailwind CSS', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Express.js', category: 'Backend' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'MySQL', category: 'Database' },
    { name: 'Git', category: 'Tools' },
    { name: 'GitHub', category: 'Tools' },
    { name: 'Figma', category: 'Tools' },
    { name: 'VS Code', category: 'Tools' }
  ];

  const displaySkills = skills.length > 0 ? skills : defaultSkills;
  const categories = ['Frontend', 'Backend', 'Database', 'Tools'];

  // Default Projects
  const defaultProjects = [
    {
      id: 'p1',
      title: 'Forged Monitor',
      description: 'An advanced telemetry dashboard tracking live hardware nodes, temperature logs, and GPU execution matrices. Built with React and Three.js.',
      tech_stack: ['React', 'Three.js', 'Vite', 'Tailwind'],
      github_link: '#',
      deployed_link: '#'
    },
    {
      id: 'p2',
      title: 'Distributed Core',
      description: 'Distributed network message queue handler managing multi-threaded tasks and socket sync. Features sub-millisecond dispatch cycles.',
      tech_stack: ['Node.js', 'Express', 'Socket.io', 'Supabase'],
      github_link: '#',
      deployed_link: '#'
    }
  ];

  const displayProjects = projects.length > 0 ? projects : defaultProjects;

  // Default Experiences
  const defaultExperiences = [
    {
      id: 'e1',
      company: 'Industrial Tech Lab',
      role: 'Full Stack Engineer Intern',
      duration: 'May 2025 - Present',
      description: 'Developing high-performance user interfaces and building scalable Node.js microservices. Integrated advanced AI features into the company’s analytical tools.'
    },
    {
      id: 'e2',
      company: 'Mechanical Systems Studio',
      role: 'Frontend Systems Intern',
      duration: 'Jan 2025 - Apr 2025',
      description: 'Assisted in building immersive web spaces using Three.js and webXR. Authored robust components in React and optimized Tailwind styles.'
    }
  ];

  const displayExperiences = experiences.length > 0 ? experiences : defaultExperiences;

  const socialLinks = [
    { icon: <FiGithub size={20} />, url: profile?.github_url || 'https://github.com', label: 'GitHub' },
    { icon: <FiLinkedin size={20} />, url: profile?.linkedin_url || 'https://linkedin.com', label: 'LinkedIn' },
    { icon: <FiInstagram size={20} />, url: 'https://instagram.com', label: 'Instagram' },
    { icon: <FiTwitter size={20} />, url: profile?.twitter_url || 'https://twitter.com', label: 'X/Twitter' }
  ];

  return (
    <div 
      style={{ backgroundColor: 'var(--color-dark-950)', color: 'var(--color-text-primary)' }}
      className="min-h-screen selection:bg-orange-500/30 overflow-x-hidden relative font-mono"
    >
      
      {/* CARBON INDUSTRIAL BACKGROUND PATTERN */}
      <div className="absolute inset-0 bg-grid-white/[0.015] pointer-events-none z-0" />
      
      {/* GLOW DECORATIONS */}
      <div className="absolute top-[15%] left-[-15%] w-[600px] h-[600px] rounded-full bg-orange-600/5 blur-[180px] pointer-events-none z-0" />
      <div className="absolute top-[50%] right-[-15%] w-[600px] h-[600px] rounded-full bg-yellow-600/5 blur-[180px] pointer-events-none z-0" />

      {/* HERO SECTION */}
      <section className="relative min-h-screen w-full flex items-center justify-center px-6 sm:px-16 overflow-hidden pt-28 pb-16" id="hero">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-7xl mx-auto w-full z-10">
          
          {/* Left Side: Industrial 3D WebGL Canvas */}
          <div className="lg:col-span-5 flex justify-center">
            <TiltCard 
              className="w-full max-w-[380px] aspect-[4/5] bg-[#0c0c0e]/85 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative flex items-center justify-center pointer-events-auto"
              glowColor="rgba(224, 90, 43, 0.2)"
            >
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-orange-500/60 pointer-events-none" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-orange-500/60 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-orange-500/60 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-orange-500/60 pointer-events-none" />

              {/* Inner card glow backing */}
              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent pointer-events-none" />
              
              <div className="w-full h-full relative z-10">
                <Suspense fallback={<div className="w-full h-full bg-dark-800 animate-pulse rounded-[2.5rem]" />}>
                  <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} className="w-full h-full">
                    <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
                    <Suspense fallback={null}>
                      <ForgedGarageScene />
                      <Environment preset="warehouse" />
                      <ambientLight intensity={0.4} />
                      <pointLight position={[10, 10, 10]} intensity={1.2} />
                    </Suspense>
                  </Canvas>
                </Suspense>
              </div>
            </TiltCard>
          </div>

          {/* Right Side: Bold Typography & Specifications */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-orange-600/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest"
            >
              <FiSettings size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
              <span>SYSTEM_NODE // {profile?.role || "SYSTEM ENGINEER"}</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
                {profile?.full_name || "Ebinesar A"}
              </h1>
              <h2 className="text-xl sm:text-2xl font-bold uppercase text-orange-400/90 leading-tight">
                // {profile?.hero_title || "BUILDING SCALABLE WEB CORES"}
              </h2>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-400 text-sm max-w-xl leading-relaxed font-sans"
            >
              {profile?.hero_description || "Welcome to the Forged Workshop. I engineer high-performance web systems, database pipelines, and interactive 3D mechanics using premium design specs."}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-4 flex flex-wrap gap-4"
            >
              <a href="#projects" className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20">
                INITIALIZE_MANIFEST
              </a>
              {resumeUrl && (
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-4 border border-orange-500/30 text-zinc-300 font-bold text-xs uppercase tracking-widest hover:bg-orange-500/10 transition-all flex items-center gap-2">
                  <FiDownload /> DOWNLOAD_RESUME
                </a>
              )}
              <a href="#contact" className="px-8 py-4 border border-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all">
                REQUEST_HANDSHAKE
              </a>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex gap-4 pt-4 text-zinc-600"
            >
              {socialLinks.map((link, idx) => (
                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors p-1" title={link.label}>
                  {link.icon}
                </a>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* BIOGRAPHY SECTION */}
      <section className="py-24 px-6 sm:px-16 max-w-7xl mx-auto relative z-10" id="about">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl font-bold uppercase text-left mb-16 tracking-widest flex items-center gap-3"
        >
          <span className="text-orange-500">01 //</span> SYSTEM_SPECIFICATION.LOG
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
        >
          
          {/* Objective blueprint */}
          <div className="lg:col-span-8">
            <TiltCard className="p-10 h-full border border-white/5 bg-[#0c0c0e]/60 flex flex-col justify-between" glowColor="rgba(224, 90, 43, 0.08)">
              <div className="space-y-8 text-left text-xs text-zinc-300">
                <div className="space-y-4">
                  <div className="text-orange-500 font-bold">// CORE OBJECTIVE</div>
                  <p className="text-zinc-300 text-sm leading-relaxed font-sans">
                    {profile?.hero_description || "I am a dedicated systems developer focused on building scalable frontend and backend infrastructures. I specialize in merging robust backend engineering with immersive interactive web graphics using Three.js and React."}
                  </p>
                </div>

                <div id="experience" className="border-t border-white/5 pt-8 space-y-6">
                  <div className="text-orange-400 font-bold text-sm flex items-center gap-2"><FiBriefcase /> COMPILED_HISTORY</div>
                  {displayExperiences.map((exp, idx) => (
                    <div key={exp.id || idx} className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-orange-400 shrink-0 mt-1">
                        {exp.role.includes('B.E.') || exp.role.includes('Degree') || exp.role.includes('Education') ? <FiAward size={18} /> : <FiBriefcase size={18} />}
                      </div>
                      <div className="font-sans">
                        <h4 className="font-bold text-white text-sm">{exp.role}</h4>
                        <p className="text-xs text-zinc-400 font-semibold">{exp.company} // {exp.duration}</p>
                        <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TiltCard>
          </div>

          {/* Stats blueprint column */}
          <div className="lg:col-span-4 flex flex-col gap-6 justify-between">
            {statItems.map((stat, idx) => (
              <TiltCard 
                key={idx} 
                className="py-8 px-6 border border-white/5 bg-[#0c0c0e]/45 text-center flex flex-col justify-center items-center flex-1 h-28" 
                glowColor="rgba(224, 90, 43, 0.08)"
              >
                <h3 className="text-4xl font-black bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent mb-1 font-mono">
                  {stat.value}
                </h3>
                <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">{stat.label}</p>
              </TiltCard>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SKILLS SECTION */}
      <section className="py-24 px-6 sm:px-16 max-w-7xl mx-auto relative z-10" id="skills">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl font-bold uppercase text-left mb-16 tracking-widest"
        >
          <span className="text-orange-500">02 //</span> MODULE_ARCHITECTURES
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left"
        >
          {categories.map((cat) => (
            <TiltCard key={cat} className="p-8 border border-white/5 bg-[#0c0c0e]/50" glowColor="rgba(224, 90, 43, 0.08)">
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-orange-500 tracking-[0.2em] mb-4 pb-2 border-b border-white/5 flex items-center gap-2">
                  $ SPEC --{cat.toUpperCase()}
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {displaySkills.filter(s => {
                    const mappedCat = s.category === 'Programming' ? 'Database' : s.category;
                    return mappedCat === cat;
                  }).map(skill => (
                    <span 
                      key={skill.name} 
                      className="px-3 py-1.5 bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </TiltCard>
          ))}
        </motion.div>
      </section>

      {/* PROJECTS SECTION */}
      <section className="py-24 px-6 sm:px-16 max-w-7xl mx-auto relative z-10" id="projects">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl font-bold uppercase text-left mb-16 tracking-widest"
        >
          <span className="text-orange-500">03 //</span> BUILDS_ARCHIVE
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {displayProjects.map((project, idx) => (
            <TiltCard key={project.id || idx} className="p-8 border border-white/5 bg-[#0c0c0e]/60 flex flex-col justify-between" glowColor="rgba(224, 90, 43, 0.1)">
              <div className="space-y-6 text-left">
                {/* Visual mockup block */}
                <div className="relative aspect-[16/10] w-full rounded bg-[#040405] border border-white/5 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-grid-white/[0.01] z-0" />
                  
                  {/* Warning strip decoration */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-stripes-orange pointer-events-none" />

                  <div className="relative z-10 p-6 w-full text-center">
                    {idx === 0 ? (
                      <div className="w-[85%] mx-auto bg-[#08080a] border border-white/10 p-4 shadow-2xl scale-95 hover:scale-100 transition-transform duration-500 font-mono text-[9px] text-orange-400 text-left">
                        <div className="flex gap-1.5 mb-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                        </div>
                        <div className="space-y-1">
                          <p>&gt; sys_compile --engine</p>
                          <p className="text-zinc-650">compiling mechanical node...</p>
                          <p>&gt; sys_run --port:5000</p>
                          <p className="text-orange-500">✓ Operational: port 5000 initialized</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-24 h-24 mx-auto flex items-center justify-center bg-white/5 border border-white/5 rounded-full">
                        <div className="w-16 h-16 border border-dashed border-orange-500/60 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
                        <FiSettings className="absolute text-orange-400 animate-spin" size={24} style={{ animationDuration: '4s' }} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-white flex justify-between items-center">
                    {project.title}
                    <FiFolder size={18} className="text-orange-400" />
                  </h4>
                  <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3 font-sans">
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5">
                <div className="flex gap-4">
                  {project.deployed_link && (
                    <a href={project.deployed_link} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-[9px] tracking-wider uppercase transition-all" target="_blank" rel="noopener noreferrer">
                      ACTIVATE
                    </a>
                  )}
                  {project.github_link && (
                    <a href={project.github_link} className="px-4 py-2 border border-white/10 text-zinc-300 font-bold text-[9px] tracking-wider uppercase hover:bg-white/5 transition-all flex items-center gap-1" target="_blank" rel="noopener noreferrer">
                      <FiGithub /> CODE
                    </a>
                  )}
                </div>
                <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                  INTEGRITY_STABLE
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
          <h2 className="text-2xl font-bold uppercase tracking-widest">04 // CREDENTIAL_BLUEPRINTS</h2>
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
                <TiltCard className="p-6 border border-white/5 bg-[#0c0c0e]/60 h-full flex flex-col justify-between" glowColor="rgba(224, 90, 43, 0.12)">
                  <div className="space-y-4 text-left">
                    <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                      <FiAward size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm line-clamp-2">{cert.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1">{cert.issuer}</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-wider font-mono">
                    <span>{cert.date}</span>
                    <span className="text-orange-400 hover:text-orange-355 transition-colors">DECODE →</span>
                  </div>
                </TiltCard>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-morphism p-10 rounded text-center border border-white/5 bg-[#0c0c0e]/30 text-zinc-500 text-xs">
             NO DECRYPTED SCHEMATICS. IMPORT CREDENTIAL BLUEPRINTS VIA SECURE SYSTEM CONSOLE.
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
          <h2 className="text-2xl font-bold uppercase tracking-widest">05 // INITIALIZE_CONNECTION_HANDSHAKE</h2>
          <p className="text-zinc-400 text-xs max-w-md mx-auto font-sans">Register system request coefficients below to trigger real-time dispatch transmission.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <TiltCard className="p-10 border border-white/5 bg-[#0c0c0e]/60 font-mono text-xs text-zinc-300" glowColor="rgba(224, 90, 43, 0.1)">
            <div className="text-orange-400 font-bold mb-6">// DISPATCH_TRANSMISSION_PROTOCOL.sh</div>
            
            <form onSubmit={handleFormSubmit} className="space-y-6 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">let client_node_identity =</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formState.name}
                    onChange={handleInputChange}
                    placeholder='"John Doe";' 
                    className="w-full bg-white/5 border border-white/10 rounded p-3.5 text-xs outline-none focus:border-orange-500 transition-all text-white placeholder-zinc-700 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">let client_return_address =</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formState.email}
                    onChange={handleInputChange}
                    placeholder='"john@example.com";' 
                    className="w-full bg-white/5 border border-white/10 rounded p-3.5 text-xs outline-none focus:border-orange-500 transition-all text-white placeholder-zinc-700 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">let transmission_payload =</label>
                <textarea 
                  name="message"
                  required
                  rows="5"
                  value={formState.message}
                  onChange={handleInputChange}
                  placeholder='`Requesting custom core development handshake...`;' 
                  className="w-full bg-white/5 border border-white/10 rounded p-3.5 text-xs outline-none focus:border-orange-500 transition-all text-white placeholder-zinc-700 resize-none font-mono"
                />
              </div>

              <button 
                type="submit" 
                disabled={formLoading}
                className="w-full py-4 rounded bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-mono"
              >
                {formLoading ? './TRANSMITTING...' : <><FiSend /> ./run dispatch_protocol</>}
              </button>
              
              <AnimatePresence>
                {formSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded text-center text-xs font-bold"
                  >
                    ✓ CONNECTION ESTABLISHED // DATA DISPATCHED SUCCESSFULLY.
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </TiltCard>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 sm:px-16 border-t border-white/5 bg-black/80 relative z-10 text-[11px] text-zinc-650 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-xs font-black uppercase text-white tracking-widest">{profile?.full_name || 'Ebinesar A'}</span>
            <span>© 2026 {profile?.full_name || 'Ebinesar A'}. integrity_checked = true.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">system_privacy</a>
            <a href="#" className="hover:text-white transition-colors">terms_of_deployment</a>
            <a href="#" className="hover:text-white transition-colors">source_code</a>
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

export default ForgedGaragePortfolioView;

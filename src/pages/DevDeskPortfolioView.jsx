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
  FiTerminal
} from 'react-icons/fi';
import { fetchProfile } from '../services/profileService';
import { fetchProjects } from '../services/projectService';
import { fetchSkills } from '../services/skillService';
import { fetchExperiences } from '../services/cmsService';
import { fetchCertificates } from '../services/certificateService';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Grid, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import CertificateModal from '../components/CertificateModal';
import LoadingSpinner from '../components/LoadingSpinner';

const HeroScene = lazy(() => import('../3d/HeroScene'));

// --- 3D TILT HOVER COMPONENT ---
const TiltCard = ({ children, className = '', glowColor = 'rgba(16, 185, 129, 0.12)' }) => {
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

// --- 3D INTERACTIVE DEVELOPER AVATAR SCENE ---
const DevDeskScene = () => {
  const [texture, setTexture] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(1);
  const ref = useRef();

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load('/dev_desk_avatar.png', (tex) => {
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

    // Gentle cursor follow rotation
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, x * 0.3, 0.08);
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -y * 0.2, 0.08);

    // Parallax shift with gentle floating float animation
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, x * 0.35, 0.08);
    ref.current.position.y = THREE.MathUtils.lerp(
      ref.current.position.y,
      -0.4 - y * 0.2 + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.08,
      0.08
    );
  });

  if (!texture) return null;

  return (
    <group>
      {/* Dev workspace dynamic lights */}
      <spotLight position={[3, 6, 3]} angle={0.5} penumbra={1} intensity={10} color="#10B981" castShadow />
      <spotLight position={[-3, 6, 3]} angle={0.5} penumbra={1} intensity={6} color="#3B82F6" />
      
      {/* Backlight glow */}
      <pointLight position={[0, -0.5, -2]} intensity={12} distance={6} color="#10B981" />
      <pointLight position={[1.5, 0.5, -1.5]} intensity={8} distance={5} color="#3B82F6" />

      {/* Cyber Grid background */}
      <group position={[0, -2.5, -3]} rotation={[Math.PI / 2.2, 0, 0]}>
        <Grid infiniteGrid sectionSize={1} sectionColor="#10b981" sectionThickness={1.0} fadeDistance={15} cellColor="#1e293b" />
      </group>

      {/* Floating particles around coding workspace */}
      <Sparkles count={60} scale={5} color="#10b981" speed={0.8} size={2} />
      <Sparkles count={40} scale={4} color="#3b82f6" speed={0.6} size={1.5} />

      {/* Futuristic Code/Matrix lines on floating panels behind */}
      <group position={[-2.5, 0.5, -2]} rotation={[0, 0.4, 0]}>
        <mesh>
          <planeGeometry args={[2, 3.5]} />
          <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.12} />
        </mesh>
        <Sparkles count={15} scale={2} color="#10b981" speed={1.2} size={1.5} />
      </group>

      <group position={[2.5, 0.5, -2]} rotation={[0, -0.4, 0]}>
        <mesh>
          <planeGeometry args={[2, 3.5]} />
          <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.12} />
        </mesh>
        <Sparkles count={15} scale={2} color="#3b82f6" speed={1.2} size={1.5} />
      </group>

      {/* Main Dev Avatar Mesh */}
      <mesh ref={ref} position={[0, -0.4, 0]}>
        <planeGeometry args={[4.2 * aspectRatio, 4.2]} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>
    </group>
  );
};

const DevDeskPortfolioView = () => {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('/resume.pdf');

  // Form State (styled as terminal commands)
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
        console.error('Failed to load dev_desk data:', e);
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

  if (loading) return <LoadingSpinner fullScreen message="Powering up Dev Workstation..." />;

  // Default Stats
  const statItems = [
    { value: projects.length > 0 ? `${projects.length}+` : '12+', label: 'Projects Deployed', color: 'from-emerald-400 to-teal-400' },
    { value: skills.length > 0 ? `${skills.length}+` : '18+', label: 'Skills Mastered', color: 'from-blue-400 to-cyan-400' },
    { value: '2+', label: 'Active Years', color: 'from-sky-400 to-indigo-400' }
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
      title: 'Dev Workspace Monitor',
      description: 'An interactive system dashboard tracking workspace hardware, memory logs, and sub-millisecond network updates. Built with React and Three.js.',
      tech_stack: ['React', 'Three.js', 'Vite', 'Tailwind'],
      github_link: '#',
      deployed_link: '#'
    },
    {
      id: 'p2',
      title: 'Collaborative Editor',
      description: 'Real-time multi-user code workspace utilizing websockets and database synchronizations for smooth collaborative programming sessions.',
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
      company: 'Tech Innovations Lab',
      role: 'Full Stack Development Intern',
      duration: 'May 2025 - Present',
      description: 'Developing high-performance user interfaces and building scalable Node.js microservices. Integrated advanced AI features into the company’s analytical tools.'
    },
    {
      id: 'e2',
      company: 'Metaverse Dev Studio',
      role: 'Frontend Developer Intern',
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
      className="min-h-screen selection:bg-emerald-500/30 overflow-x-hidden relative"
    >
      
      {/* GLOW DECORATIONS */}
      <div className="absolute top-[20%] left-[-15%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[180px] pointer-events-none z-0" />
      <div className="absolute top-[55%] right-[-15%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[180px] pointer-events-none z-0" />

      {/* HERO SECTION */}
      <section className="relative min-h-screen w-full flex items-center justify-center px-6 sm:px-16 overflow-hidden pt-28 pb-16" id="hero">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-7xl mx-auto w-full z-10">
          
          {/* Left Side: Dynamic Avatar Scene */}
          <div className="lg:col-span-5 flex justify-center">
            <TiltCard 
              className="w-full max-w-[380px] aspect-[4/5] bg-[#0c1220]/75 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative flex items-center justify-center pointer-events-auto"
              glowColor="rgba(16, 185, 129, 0.25)"
            >
              {/* Inner card glow backing */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
              
              <div className="w-full h-full relative z-10">
                <Suspense fallback={<div className="w-full h-full bg-dark-800 animate-pulse rounded-[2.5rem]" />}>
                  <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} className="w-full h-full">
                    <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
                    <Suspense fallback={null}>
                      <DevDeskScene />
                      <Environment preset="city" />
                      <ambientLight intensity={0.5} />
                      <pointLight position={[10, 10, 10]} intensity={1.5} />
                    </Suspense>
                  </Canvas>
                </Suspense>
              </div>
            </TiltCard>
          </div>

          {/* Right Side: Workstation Title & Badges */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider"
            >
              <FiTerminal size={14} className="animate-pulse" />
              <span>{profile?.role || "Software Engineer & Architect"}</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white">
                {profile?.full_name || "Ebinesar A"}
              </h1>
              <h2 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-blue-400 to-sky-400 leading-tight">
                {profile?.hero_title || "Building Scalable & Modern Web Applications"}
              </h2>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-sm max-w-xl leading-relaxed"
            >
              {profile?.hero_description || "Welcome to my digital studio. I build full stack architectures, responsive components, and highly interactive 3D visual environments using cutting-edge developer layouts."}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-4 flex flex-wrap gap-4"
            >
              <a href="#projects" className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-600/20 transition-all">
                Access Codebase
              </a>
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 rounded-xl border border-emerald-500/30 text-white font-bold text-sm tracking-wide hover:bg-emerald-500/10 transition-all flex items-center gap-2">
                <FiDownload /> Download Resume
              </a>
              <a href="#contact" className="px-8 py-3.5 rounded-xl border border-white/10 text-white font-bold text-sm tracking-wide hover:bg-white/5 transition-all">
                Initialize Contact
              </a>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex gap-4 pt-4 text-gray-500"
            >
              {socialLinks.map((link, idx) => (
                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors" title={link.label}>
                  {link.icon}
                </a>
              ))}
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
          className="text-3xl font-extrabold uppercase text-left mb-16 tracking-tight flex items-center gap-2"
        >
          <span className="text-emerald-400">01.</span> profile_spec.json
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
        >
          
          {/* Main Info Terminal */}
          <div className="lg:col-span-8">
            <TiltCard className="p-10 h-full border border-white/5 bg-[#0c1220]/40 flex flex-col justify-between" glowColor="rgba(16, 185, 129, 0.08)">
              <div className="space-y-8 text-left font-mono text-xs text-gray-300">
                <div className="space-y-4">
                  <div className="text-emerald-400 font-bold text-sm">// Biography</div>
                  <p className="text-gray-300 text-sm leading-relaxed font-sans">
                    {profile?.hero_description || "I am a dedicated developer focused on building scalable frontend and backend infrastructures. I specialize in merging robust backend engineering with immersive interactive web graphics using Three.js and React."}
                  </p>
                </div>

                <div id="experience" className="border-t border-white/5 pt-8 space-y-6">
                  <div className="text-blue-400 font-bold text-sm font-sans flex items-center gap-1.5"><FiBriefcase /> experience_timeline</div>
                  {displayExperiences.map((exp, idx) => (
                    <div key={exp.id || idx} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
                        {exp.role.includes('B.E.') || exp.role.includes('Degree') || exp.role.includes('Education') ? <FiAward size={18} /> : <FiBriefcase size={18} />}
                      </div>
                      <div className="font-sans">
                        <h4 className="font-bold text-white text-sm">{exp.role}</h4>
                        <p className="text-xs text-gray-400 font-semibold">{exp.company} ({exp.duration})</p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TiltCard>
          </div>

          {/* Stats column */}
          <div className="lg:col-span-4 flex flex-col gap-6 justify-between">
            {statItems.map((stat, idx) => (
              <TiltCard 
                key={idx} 
                className="py-8 px-6 border border-white/5 bg-[#0c1220]/30 text-center flex flex-col justify-center items-center flex-1 h-28" 
                glowColor="rgba(59, 130, 246, 0.1)"
              >
                <h3 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-1 font-mono">
                  {stat.value}
                </h3>
                <p className="text-gray-450 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
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
          className="text-3xl font-extrabold uppercase text-left mb-16 tracking-tight"
        >
          <span className="text-emerald-400">02.</span> tech_stack.sh
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left"
        >
          {categories.map((cat) => (
            <TiltCard key={cat} className="p-8 border border-white/5 bg-[#0c1220]/30" glowColor="rgba(16, 185, 129, 0.08)">
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-emerald-400 tracking-[0.2em] mb-4 pb-2 border-b border-white/5 flex items-center gap-1.5 font-mono">
                  $ cat {cat === 'Database' ? 'database_cloud.txt' : `${cat.toLowerCase()}.txt`}
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {displaySkills.filter(s => {
                    const mappedCat = s.category === 'Programming' ? 'Database' : s.category;
                    return mappedCat === cat;
                  }).map(skill => (
                    <span 
                      key={skill.name} 
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
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
          className="text-3xl font-extrabold uppercase text-left mb-16 tracking-tight"
        >
          <span className="text-emerald-400">03.</span> projects_compiled
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {displayProjects.map((project, idx) => (
            <TiltCard key={project.id || idx} className="p-8 border border-white/5 bg-[#0c1220]/40 flex flex-col justify-between" glowColor="rgba(59, 130, 246, 0.1)">
              <div className="space-y-6 text-left">
                {/* Visual mockup block */}
                <div className="relative aspect-[16/10] w-full rounded-2xl bg-[#090e19] border border-white/5 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-grid-white/[0.02] z-0" />
                  <div className="relative z-10 p-6 w-full text-center">
                    {idx === 0 ? (
                      <div className="w-[85%] mx-auto bg-[#070b13] rounded-xl border border-white/10 p-4 shadow-2xl scale-95 hover:scale-100 transition-transform duration-500 font-mono text-[9px] text-emerald-400 text-left">
                        <div className="flex gap-1.5 mb-3">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="w-2 h-2 rounded-full bg-yellow-500" />
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                        </div>
                        <div className="space-y-1">
                          <p>&gt; npm install three</p>
                          <p className="text-gray-500">installing packages...</p>
                          <p>&gt; npm run dev --host</p>
                          <p className="text-blue-400">✓ Local: http://localhost:5173/</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-28 h-28 mx-auto flex items-center justify-center bg-white/5 border border-white/5 rounded-full animate-float">
                        <div className="w-16 h-16 border-2 border-dashed border-emerald-500 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
                        <FiZap className="absolute text-emerald-400" size={32} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-white flex justify-between items-center">
                    {project.title}
                    <FiFolder size={18} className="text-emerald-400" />
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5">
                <div className="flex gap-4">
                  {project.deployed_link && (
                    <a href={project.deployed_link} className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] tracking-wider uppercase transition-all" target="_blank" rel="noopener noreferrer">
                      Run Live
                    </a>
                  )}
                  {project.github_link && (
                    <a href={project.github_link} className="px-4 py-1.5 rounded-lg border border-white/10 text-white font-bold text-[10px] tracking-wider uppercase hover:bg-white/5 transition-all flex items-center gap-1" target="_blank" rel="noopener noreferrer">
                      <FiGithub /> Source
                    </a>
                  )}
                </div>
                <span className="text-[10px] text-gray-550 font-bold uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  STATUS_OK
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
          <h2 className="text-3xl font-extrabold uppercase tracking-tight">04. credentials_vault</h2>
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
                <TiltCard className="p-6 border border-white/5 bg-[#0c1220]/40 h-full flex flex-col justify-between" glowColor="rgba(59, 130, 246, 0.12)">
                  <div className="space-y-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <FiAward size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm line-clamp-2">{cert.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{cert.issuer}</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">
                    <span>{cert.date}</span>
                    <span className="text-emerald-400 hover:text-emerald-355 transition-colors">Decrypt →</span>
                  </div>
                </TiltCard>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-morphism p-10 rounded-[2rem] text-center border border-white/5 bg-[#0c1220]/20 text-gray-400 text-sm">
             No certificates decrypted yet. Add credentials in the secure console dashboard.
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
          <h2 className="text-3xl font-extrabold uppercase tracking-tight">05. initialize_handshake</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">Input terminal arguments below to send a network dispatch directly to my desk.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <TiltCard className="p-10 border border-white/5 bg-[#0c1220]/40 font-mono text-xs text-gray-300" glowColor="rgba(16, 185, 129, 0.1)">
            <div className="text-emerald-400 font-bold mb-6">// dev_handshake_service.sh</div>
            
            <form onSubmit={handleFormSubmit} className="space-y-6 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">let clientName =</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formState.name}
                    onChange={handleInputChange}
                    placeholder='"John Doe";' 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm outline-none focus:border-emerald-500 transition-all text-white placeholder-gray-600 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">let clientEmail =</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formState.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm outline-none focus:border-emerald-500 transition-all text-white placeholder-gray-600 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">let messagePayload =</label>
                <textarea 
                  name="message"
                  required
                  rows="5"
                  value={formState.message}
                  onChange={handleInputChange}
                  placeholder="Tell me about your project..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm outline-none focus:border-emerald-500 transition-all text-white placeholder-gray-600 resize-none font-mono"
                />
              </div>

              <button 
                type="submit" 
                disabled={formLoading}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {formLoading ? 'Sending message...' : <><FiSend /> Send Message</>}
              </button>
              
              <AnimatePresence>
                {formSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-xl text-center text-xs font-bold"
                  >
                    ✓ Dispatch complete! Connection handshake succeeded.
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </TiltCard>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 sm:px-16 border-t border-white/5 bg-black/60 relative z-10 text-xs text-gray-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-sm font-black uppercase text-white tracking-widest">{profile?.full_name || 'Ebinesar A'}</span>
            <span>© 2026 {profile?.full_name || 'Ebinesar A'}. connection_established = true.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">privacy_policy</a>
            <a href="#" className="hover:text-white transition-colors">terms_of_service</a>
            <a href="#" className="hover:text-white transition-colors">open_source</a>
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

export default DevDeskPortfolioView;

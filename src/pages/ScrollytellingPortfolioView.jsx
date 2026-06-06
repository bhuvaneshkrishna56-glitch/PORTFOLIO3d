import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  FiGithub, 
  FiLinkedin, 
  FiTwitter, 
  FiMail, 
  FiArrowRight, 
  FiDownload, 
  FiCheckCircle, 
  FiCalendar, 
  FiBriefcase, 
  FiFolder, 
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

// --- 3D TILT HOVER COMPONENT ---
const TiltCard = ({ children, className = '', glowColor = 'rgba(108, 99, 255, 0.15)' }) => {
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

// --- 3D MORPHING CORE COMPONENT ---
const MorphingScrollyCore = () => {
  const meshRef = useRef();
  const wireframeRef = useRef();
  const pointLight1 = useRef();
  const pointLight2 = useRef();

  useFrame((state) => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const p = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;

    // Smooth scroll interpolation
    state.smoothP = THREE.MathUtils.lerp(state.smoothP || 0, p, 0.08);
    const sp = state.smoothP;
    const time = state.clock.getElapsedTime();

    if (meshRef.current) {
      // Rotation: base rotation + scroll speed up
      meshRef.current.rotation.x = time * 0.15 + sp * Math.PI * 1.5;
      meshRef.current.rotation.y = time * 0.25 + sp * Math.PI * 3.0;
      meshRef.current.rotation.z = time * 0.1 + sp * Math.PI;

      // Scale: morph shape slightly on scroll
      const scaleVal = 1.4 + Math.sin(time * 1.5) * 0.05 + sp * 0.6;
      meshRef.current.scale.set(scaleVal, scaleVal, scaleVal);

      // Material morphs: roughness decreases, metalness increases
      if (meshRef.current.material) {
        meshRef.current.material.roughness = THREE.MathUtils.lerp(0.3, 0.05, sp);
        meshRef.current.material.metalness = THREE.MathUtils.lerp(0.15, 0.9, sp);
        meshRef.current.material.transmission = THREE.MathUtils.lerp(0.9, 0.15, sp);
        meshRef.current.material.clearcoat = THREE.MathUtils.lerp(0.6, 1.0, sp);
      }
    }

    if (wireframeRef.current) {
      wireframeRef.current.rotation.x = -time * 0.05 - sp * Math.PI * 0.5;
      wireframeRef.current.rotation.y = -time * 0.1 - sp * Math.PI * 1.0;
      const wireScale = 2.3 + sp * 0.5;
      wireframeRef.current.scale.set(wireScale, wireScale, wireScale);
    }

    // Camera movement: fly closer/further and pan
    state.camera.position.z = THREE.MathUtils.lerp(5.2, 7.5, sp);
    state.camera.position.y = THREE.MathUtils.lerp(0, 1.6, sp);
    state.camera.position.x = THREE.MathUtils.lerp(0, -1.2, sp);
    state.camera.lookAt(0, 0, 0);

    // Color shifting lights
    // Deep blue (0, 0.2, 1) -> Fiery orange (1, 0.35, 0)
    if (pointLight1.current) {
      const r = THREE.MathUtils.lerp(0.0, 1.0, sp);
      const g = THREE.MathUtils.lerp(0.2, 0.35, sp);
      const b = THREE.MathUtils.lerp(1.0, 0.0, sp);
      pointLight1.current.color.setRGB(r, g, b);
      pointLight1.current.intensity = THREE.MathUtils.lerp(15, 30, sp);
    }

    // Cyan (0, 1, 1) -> Hot pink (1, 0.1, 0.5)
    if (pointLight2.current) {
      const r = THREE.MathUtils.lerp(0.0, 1.0, sp);
      const g = THREE.MathUtils.lerp(1.0, 0.1, sp);
      const b = THREE.MathUtils.lerp(1.0, 0.5, sp);
      pointLight2.current.color.setRGB(r, g, b);
      pointLight2.current.intensity = THREE.MathUtils.lerp(10, 20, sp);
    }
  });

  return (
    <group>
      {/* Lights */}
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
      <pointLight ref={pointLight1} position={[-4, 3, 2]} intensity={15} distance={15} />
      <pointLight ref={pointLight2} position={[4, -3, 2]} intensity={10} distance={15} />
      <pointLight position={[0, 0, -3]} intensity={6} color="#ff6b9d" distance={10} />

      {/* Morphing Glass Mesh */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <torusKnotGeometry args={[1.0, 0.32, 120, 16]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.25}
          metalness={0.1}
          transmission={0.9}
          thickness={1.2}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
          ior={1.6}
          attenuationColor="#ffffff"
          attenuationDistance={1}
        />
      </mesh>

      {/* Wireframe outer shell */}
      <mesh ref={wireframeRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#6c63ff" wireframe transparent opacity={0.15} />
      </mesh>

      {/* Sparkles */}
      <Sparkles count={120} scale={6.5} color="#00d4ff" speed={1.2} size={3} />
      <Sparkles count={60} scale={5} color="#ff6b9d" speed={0.8} size={2} />
    </group>
  );
};

const ScrollytellingPortfolioView = () => {
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
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Scroll target for Framer Motion scroll scrubbing
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Overlays animation maps
  const opacity1 = useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.25], [0, -60]);

  const opacity2 = useTransform(scrollYProgress, [0.2, 0.3, 0.45, 0.55], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.2, 0.55], [60, -60]);

  const opacity3 = useTransform(scrollYProgress, [0.5, 0.6, 0.75, 0.85], [0, 1, 1, 0]);
  const y3 = useTransform(scrollYProgress, [0.5, 0.85], [60, -60]);

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
          else {
            const localUrl = localStorage.getItem('portfolio_resume_url');
            if (localUrl) setResumeUrl(localUrl);
          }
        }
        setProjects(projRes.projects || []);
        setSkills(skillRes.skills || []);
        setExperiences(expRes.experiences || []);
        setCertificates(certRes.certificates || []);
      } catch (e) {
        console.error('Failed to load scrollytelling template data:', e);
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
      setFormState({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setFormSuccess(false), 5000);
    }, 1500);
  };

  if (loading) return <LoadingSpinner fullScreen message="Activating Satya Scrolly canvas..." />;

  // Default Stats if empty
  const statItems = [
    { value: projects.length > 0 ? `${projects.length}+` : '6+', label: 'Projects Built', color: 'from-accent-primary to-accent-secondary' },
    { value: skills.length > 0 ? `${skills.length}+` : '12+', label: 'Technologies Used', color: 'from-accent-secondary to-accent-tertiary' },
    { value: '1', label: 'Hackathon Win', color: 'from-accent-tertiary to-accent-primary' }
  ];

  // Default Skills if empty
  const defaultSkills = [
    { name: 'React', category: 'Frontend' },
    { name: 'Tailwind CSS', category: 'Frontend' },
    { name: 'Next.js', category: 'Frontend' },
    { name: 'JavaScript', category: 'Frontend' },
    { name: 'HTML5', category: 'Frontend' },
    { name: 'CSS3', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Express.js', category: 'Backend' },
    { name: 'Python', category: 'Backend' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'Git', category: 'Tools' },
    { name: 'Figma', category: 'Tools' },
    { name: 'Docker', category: 'Tools' }
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
      company: 'Build With Satya',
      role: 'Full Stack Developer',
      duration: '2024 - Present',
      description: 'Developing highly customized portfolio sites and high-performance WebGL/WebGPU structures.'
    },
    {
      id: 'e2',
      company: 'Tech Academy',
      role: 'B.S. in Computer Science',
      duration: '2021 - 2025',
      description: 'Focused on algorithms, design patterns, and creative developer frameworks.'
    }
  ];

  const displayExperiences = experiences.length > 0 ? experiences : defaultExperiences;

  return (
    <div 
      style={{ backgroundColor: 'var(--color-dark-950)', color: 'var(--color-text-primary)' }}
      className="min-h-screen selection:bg-indigo-500/30 overflow-x-hidden relative"
    >
      
      {/* --- WebGL Backdrop (Fixed position behind everything) --- */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute inset-0 z-0" style={{ backgroundColor: 'var(--color-dark-950)' }}>
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-text-muted" style={{ backgroundColor: 'var(--color-dark-950)' }}>Loading 3D Engine...</div>}>
              <Canvas dpr={[1, 2]} gl={{ antialias: true }} className="w-full h-full">
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
                <MorphingScrollyCore />
                <Environment preset="studio" />
              </Canvas>
            </Suspense>
          </div>

          {/* Glow backdrop overlay to blend canvas */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#121212]/30 via-transparent to-[#121212] z-1" />

          {/* Parallax Overlay Cards */}
          <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-center items-center px-6 sm:px-16">
            
            {/* Section 1: 0% to 25% scroll */}
            <motion.div style={{ opacity: opacity1, y: y1 }} className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 max-w-4xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent-secondary mb-4 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                {profile?.role || "Creative Developer"}
              </span>
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight uppercase leading-none mb-6">
                Build With <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-tertiary">{profile?.full_name || "Ebinesar A"}</span>
              </h1>
              <p className="text-text-secondary text-base sm:text-xl max-w-2xl leading-relaxed font-medium">
                {profile?.hero_title || "Building Scalable & Modern Web Applications"}
              </p>
              <div className="mt-8 flex gap-4 pointer-events-auto">
                <a href="#about" className="px-8 py-3.5 rounded-full bg-accent-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-accent-primary/80 transition-all shadow-lg shadow-accent-primary/25">
                  Explore Details
                </a>
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 rounded-full border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/5 transition-all">
                  Get Resume
                </a>
              </div>
            </motion.div>

            {/* Section 2: 25% to 55% scroll */}
            <motion.div style={{ opacity: opacity2, y: y2 }} className="absolute inset-0 flex flex-col items-start justify-center text-left p-6 max-w-2xl mr-auto sm:pl-24">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent-tertiary mb-3">
                01 / Philosophy
              </span>
              <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-none mb-5">
                Interactive<br/>Experiences.
              </h2>
              <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-lg font-medium">
                {profile?.hero_description || "I specialize in constructing scaleable, robust web applications with a focus on immersive interactive experiences and responsive user interfaces."}
              </p>
            </motion.div>

            {/* Section 3: 55% to 85% scroll */}
            <motion.div style={{ opacity: opacity3, y: y3 }} className="absolute inset-0 flex flex-col items-end justify-center text-right p-6 max-w-2xl ml-auto sm:pr-24">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent-primary mb-3">
                02 / Synthesis
              </span>
              <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-none mb-5">
                Art &<br/>Engineering.
              </h2>
              <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-lg font-medium">
                Combining custom WebGL mechanics with responsive database systems. Creating interfaces that feel alive, intuitive, and performant.
              </p>
            </motion.div>

          </div>

          {/* Floating indicator */}
          <motion.div 
            style={{ opacity: opacity1 }}
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted text-[10px] font-black uppercase tracking-[0.2em] z-10"
          >
            <span>Scroll to Enter</span>
            <div className="w-1 h-6 bg-gradient-to-b from-white/30 to-white/0 rounded-full" />
          </motion.div>

        </div>

      {/* --- CONTENT BLOCK --- */}
      <div 
        style={{ backgroundColor: 'var(--color-dark-950)' }}
        className="relative z-20 pt-28 pb-32 px-6 sm:px-12 md:px-24"
      >
        
        {/* ABOUT & TIMELINE GRID */}
        <section className="max-w-7xl mx-auto mb-32" id="about">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-black uppercase mb-16 tracking-tight flex items-center gap-4"
          >
            <span className="text-accent-primary">01.</span> About & Journey
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Bio Card */}
            <div className="lg:col-span-8">
              <TiltCard className="p-8 sm:p-12 h-full border border-white/5 bg-dark-900/40 text-left flex flex-col justify-between" glowColor="rgba(108, 99, 255, 0.1)">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-accent-secondary">
                      Creative Developer
                    </span>
                    <p className="text-text-secondary text-sm sm:text-base leading-relaxed font-medium">
                      {profile?.hero_description || "I specialize in constructing scaleable, robust web applications with a focus on immersive interactive experiences and responsive user interfaces."}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-8 space-y-6">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-accent-tertiary mb-6">
                      Milestones
                    </h4>
                    <div className="space-y-6">
                      {displayExperiences.map((exp, idx) => (
                        <div key={exp.id || idx} className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-accent-primary shrink-0 mt-1">
                            <FiBriefcase size={18} />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-md">{exp.role}</h4>
                            <p className="text-xs text-text-muted font-semibold">{exp.company} ({exp.duration})</p>
                            <p className="text-xs text-text-muted mt-2 leading-relaxed font-medium">{exp.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TiltCard>
            </div>

            {/* Vertical Stats Column */}
            <div className="lg:col-span-4 flex flex-col gap-6 justify-between">
              {statItems.map((stat, idx) => (
                <TiltCard 
                  key={idx} 
                  className="py-10 px-6 border border-white/5 bg-dark-900/40 text-center flex flex-col justify-center items-center flex-1 h-32" 
                  glowColor="rgba(0, 212, 255, 0.1)"
                >
                  <h3 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-tertiary bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </h3>
                  <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>

        {/* TECHNICAL STACK */}
        <section className="max-w-7xl mx-auto mb-32" id="skills">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-black uppercase mb-16 tracking-tight flex items-center gap-4"
          >
            <span className="text-accent-secondary">02.</span> Technical Stack
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {categories.map((cat) => (
              <div key={cat} className="glass-morphism p-8 rounded-3xl border border-white/5 bg-dark-900/25">
                <h4 className="text-xs font-black uppercase text-accent-secondary tracking-[0.2em] mb-6 pb-2 border-b border-white/5 flex items-center gap-2">
                  <FiStar size={12} className="text-accent-secondary animate-pulse" /> {cat === 'Database' ? 'Database & Cloud' : cat}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {displaySkills.filter(s => {
                    const mappedCat = s.category === 'Programming' ? 'Database' : s.category;
                    return mappedCat === cat;
                  }).map(skill => (
                    <span 
                      key={skill.name} 
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-text-secondary hover:border-accent-secondary/50 hover:bg-accent-secondary/5 transition-all cursor-default"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURED PROJECTS */}
        <section className="max-w-7xl mx-auto mb-32" id="projects">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-black uppercase mb-16 tracking-tight flex items-center gap-4"
          >
            <span className="text-accent-tertiary">03.</span> Featured Works
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayProjects.map((project, idx) => (
              <TiltCard key={project.id || idx} className="p-8 border border-white/5 bg-dark-900/40 flex flex-col justify-between" glowColor="rgba(255, 107, 157, 0.1)">
                <div className="space-y-6 text-left">
                  {/* Decorative Project Image Placeholder Canvas */}
                  <div className="relative aspect-[16/10] w-full rounded-2xl bg-gradient-to-br from-indigo-950/40 to-[#121212] border border-white/5 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/[0.01] z-0" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-accent-primary/10 to-transparent pointer-events-none" />
                    <div className="relative z-10 text-center">
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-accent-tertiary flex items-center justify-center mx-auto animate-spin" style={{ animationDuration: '12s' }}>
                        <FiFolder className="text-accent-tertiary animate-pulse" size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xl font-bold text-white flex justify-between items-center">
                      {project.title}
                    </h4>
                    <p className="text-text-secondary text-xs leading-relaxed font-medium line-clamp-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {project.tech_stack?.map(tech => (
                        <span key={tech} className="text-[10px] font-bold text-accent-secondary bg-accent-secondary/5 border border-accent-secondary/10 px-2 py-0.5 rounded-md">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5">
                  <div className="flex gap-3">
                    {project.deployed_link && (
                      <a href={project.deployed_link} className="px-5 py-2 rounded-full bg-accent-primary hover:bg-accent-primary/80 text-white font-bold text-[10px] tracking-wider uppercase transition-all shadow-md shadow-accent-primary/15" target="_blank" rel="noopener noreferrer">
                        Demo
                      </a>
                    )}
                    {project.github_link && (
                      <a href={project.github_link} className="px-5 py-2 rounded-full border border-white/10 text-white font-bold text-[10px] tracking-wider uppercase hover:bg-white/5 transition-all flex items-center gap-1.5" target="_blank" rel="noopener noreferrer">
                        <FiGithub size={12} /> Source
                      </a>
                    )}
                  </div>
                  <span className="text-[10px] text-text-muted font-black uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    Completed
                  </span>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* CERTIFICATIONS */}
        {certificates.length > 0 && (
          <section className="max-w-7xl mx-auto mb-32" id="certificates">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-5xl font-black uppercase mb-16 tracking-tight flex items-center gap-4"
            >
              <span className="text-accent-primary">04.</span> Certifications
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {certificates.map((cert) => (
                <motion.div 
                  key={cert.id}
                  whileHover={{ y: -6 }}
                  className="glass-morphism border border-white/5 bg-dark-900/40 p-6 rounded-3xl flex flex-col justify-between cursor-pointer text-left"
                  onClick={() => {
                    setSelectedCert(cert);
                    setModalOpen(true);
                  }}
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
                      <FiAward size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-md line-clamp-2">{cert.title}</h4>
                      <p className="text-xs text-accent-secondary font-semibold mt-1">{cert.issuer}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                    <span className="text-[10px] text-text-muted font-bold flex items-center gap-1.5">
                      <FiCalendar /> {cert.date}
                    </span>
                    <span className="text-[10px] text-accent-primary font-bold uppercase tracking-wider hover:underline">
                      Verify
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* CONTACT */}
        <section className="max-w-4xl mx-auto" id="contact">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-black uppercase mb-16 tracking-tight text-center"
          >
            Get In Touch
          </motion.h2>

          <TiltCard className="p-8 sm:p-12 border border-white/5 bg-dark-900/40 text-left" glowColor="rgba(255, 107, 157, 0.15)">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-text-secondary">Your Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    value={formState.name}
                    onChange={handleInputChange}
                    placeholder="John Doe" 
                    className="w-full bg-[#121212]/50 border border-white/10 px-4 py-3 rounded-xl text-sm focus:border-accent-primary transition-all outline-none font-medium text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-text-secondary">Your Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    value={formState.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com" 
                    className="w-full bg-[#121212]/50 border border-white/10 px-4 py-3 rounded-xl text-sm focus:border-accent-primary transition-all outline-none font-medium text-white" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-text-secondary">Subject</label>
                <input 
                  type="text" 
                  name="subject" 
                  required 
                  value={formState.subject}
                  onChange={handleInputChange}
                  placeholder="Inquiry / Partnership" 
                  className="w-full bg-[#121212]/50 border border-white/10 px-4 py-3 rounded-xl text-sm focus:border-accent-primary transition-all outline-none font-medium text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-text-secondary">Message</label>
                <textarea 
                  name="message" 
                  required 
                  rows="5"
                  value={formState.message}
                  onChange={handleInputChange}
                  placeholder="Tell me about your project..." 
                  className="w-full bg-[#121212]/50 border border-white/10 p-4 rounded-xl text-sm focus:border-accent-primary transition-all outline-none font-medium text-white resize-none" 
                />
              </div>

              <div className="pt-4 flex items-center justify-between flex-wrap gap-4">
                <div className="flex gap-3">
                  {profile?.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-accent-primary hover:text-accent-primary flex items-center justify-center text-text-muted transition-all">
                      <FiGithub size={18} />
                    </a>
                  )}
                  {profile?.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-accent-primary hover:text-accent-primary flex items-center justify-center text-text-muted transition-all">
                      <FiLinkedin size={18} />
                    </a>
                  )}
                  {profile?.twitter_url && (
                    <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-accent-primary hover:text-accent-primary flex items-center justify-center text-text-muted transition-all">
                      <FiTwitter size={18} />
                    </a>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={formLoading}
                  className="px-8 py-3.5 rounded-full bg-accent-primary hover:bg-accent-primary/80 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-accent-primary/25 pointer-events-auto cursor-pointer"
                >
                  {formLoading ? 'Sending...' : 'Send Message'} <FiSend />
                </button>
              </div>

              <AnimatePresence>
                {formSuccess && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-green-400 font-bold text-center mt-4"
                  >
                    Thank you! Your message was sent successfully.
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </TiltCard>
        </section>

      </div>

      {/* Certificate Modal Overlay */}
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

export default ScrollytellingPortfolioView;

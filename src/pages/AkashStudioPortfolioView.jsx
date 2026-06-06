import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  FiGithub, 
  FiLinkedin, 
  FiTwitter, 
  FiMail, 
  FiArrowRight, 
  FiDownload, 
  FiCalendar, 
  FiBriefcase, 
  FiFolder, 
  FiAward, 
  FiSend, 
  FiCpu,
  FiTerminal
} from 'react-icons/fi';
import { fetchProfile } from '../services/profileService';
import { fetchProjects } from '../services/projectService';
import { fetchSkills } from '../services/skillService';
import { fetchExperiences } from '../services/cmsService';
import { fetchCertificates } from '../services/certificateService';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Sparkles, Stars, Grid } from '@react-three/drei';
import * as THREE from 'three';
import CertificateModal from '../components/CertificateModal';
import LoadingSpinner from '../components/LoadingSpinner';

// --- CUSTOM CURSOR INERTIA COMPONENT ---
const CustomCursor = ({ cursorScale }) => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  const springConfig = { damping: 35, stiffness: 350, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const dotSpringConfig = { damping: 20, stiffness: 850 };
  const dotXSpring = useSpring(dotX, dotSpringConfig);
  const dotYSpring = useSpring(dotY, dotSpringConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
      dotX.set(e.clientX - 4);
      dotY.set(e.clientY - 4);
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY, dotX, dotY]);

  return (
    <>
      {/* Outer tracking ring */}
      <motion.div 
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          scale: cursorScale,
        }}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-[#66fcf1] pointer-events-none z-[9999] hidden md:block"
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      {/* Inner solid dot */}
      <motion.div 
        style={{
          x: dotXSpring,
          y: dotYSpring,
        }}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-[#66fcf1] pointer-events-none z-[9999] hidden md:block"
      />
    </>
  );
};

// --- 3D ORBITAL TECH SPHERE COMPONENT ---
const OrbitalSphere = ({ color, speed, radius, offset, name }) => {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * speed + offset;
    
    // Spherical orbit layout
    const targetX = Math.cos(t) * radius;
    const targetZ = Math.sin(t) * radius;
    const targetY = Math.sin(t * 1.3) * 0.5;

    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, targetX, 0.1);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, 0.1);
    ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, targetZ, 0.1);
    
    ref.current.rotation.y += 0.01;
    ref.current.rotation.x += 0.005;
  });

  return (
    <group ref={ref}>
      <mesh 
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.24, 32, 32]} />
        <meshStandardMaterial 
          color={hovered ? '#ffffff' : color} 
          emissive={color}
          emissiveIntensity={hovered ? 3.0 : 1.2}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
};

// --- 3D DEVELOPER WORKSPACE SCENE ---
const StudioWorkspaceScene = () => {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const { x, y } = state.pointer;
    // Camera response looking at mouse pointer
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x * 0.45, 0.06);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -y * 0.35, 0.06);
  });

  const orbitals = [
    { name: 'React', color: '#66fcf1', speed: 0.5, radius: 2.4, offset: 0 },
    { name: 'Node', color: '#45a29e', speed: 0.35, radius: 2.9, offset: Math.PI * 0.5 },
    { name: 'JS', color: '#fbbf24', speed: 0.45, radius: 2.0, offset: Math.PI },
    { name: 'Git', color: '#ff6b9d', speed: 0.3, radius: 2.6, offset: Math.PI * 1.5 }
  ];

  return (
    <group ref={groupRef}>
      {/* Lights */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-4, 3, -1]} intensity={15} color="#66fcf1" distance={10} />
      <pointLight position={[4, -2, 1]} intensity={12} color="#45a29e" distance={10} />

      {/* Cyber Grid background */}
      <group position={[0, -2.5, -3]} rotation={[Math.PI / 2.2, 0, 0]}>
        <Grid infiniteGrid sectionSize={1} sectionColor="#45a29e" sectionThickness={1.0} fadeDistance={20} cellColor="#0b0c10" />
      </group>

      {/* Workspace Desk Surface */}
      <mesh position={[0, -1.2, 0]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[4.5, 0.08, 2.5]} />
        <meshStandardMaterial color="#1a1c23" roughness={0.6} metalness={0.8} />
      </mesh>

      {/* Main Computer Monitor Display */}
      <group position={[0, -0.4, -0.5]}>
        {/* Monitor Base Stand */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.5, 16]} />
          <meshStandardMaterial color="#0b0c10" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Stand bottom plate */}
        <mesh position={[0, -0.75, 0]}>
          <boxGeometry args={[0.8, 0.02, 0.6]} />
          <meshStandardMaterial color="#0b0c10" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Monitor back screen frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.2, 1.8, 0.1]} />
          <meshStandardMaterial color="#0b0c10" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Monitor Glowing Screen Display */}
        <mesh position={[0, 0, 0.051]}>
          <planeGeometry args={[3.0, 1.6]} />
          <meshBasicMaterial color="#66fcf1" toneMapped={false} />
        </mesh>
        {/* Projection Spotlight glow out of screen */}
        <pointLight position={[0, 0, 0.8]} intensity={8} distance={6} color="#66fcf1" />
      </group>

      {/* Keyboard */}
      <mesh position={[0, -1.1, 0.6]} rotation={[0.05, 0, 0]}>
        <boxGeometry args={[1.8, 0.04, 0.6]} />
        <meshStandardMaterial color="#0b0c10" roughness={0.7} />
      </mesh>

      {/* Coffee Mug */}
      <mesh position={[1.4, -1.05, 0.5]}>
        <cylinderGeometry args={[0.15, 0.15, 0.35, 16]} />
        <meshStandardMaterial color="#45a29e" roughness={0.2} metalness={0.5} />
      </mesh>

      {/* Orbiting spheres */}
      {orbitals.map((o, idx) => (
        <OrbitalSphere key={idx} color={o.color} speed={o.speed} radius={o.radius} offset={o.offset} name={o.name} />
      ))}

      {/* Floating particles */}
      <Sparkles count={80} scale={6} color="#66fcf1" speed={1} size={2} />
      <Sparkles count={40} scale={5} color="#45a29e" speed={0.8} size={1.5} />
      <Stars radius={100} depth={50} count={300} factor={4} saturation={0.5} fade speed={1.5} />
    </group>
  );
};

const AkashStudioPortfolioView = () => {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [cursorScale, setCursorScale] = useState(1);

  // Form State
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
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
        console.error('Failed to load akash studio template data:', e);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // Listen to interactive components to change cursor sizes
  useEffect(() => {
    if (loading) return;

    const handleMouseEnter = () => setCursorScale(1.8);
    const handleMouseLeave = () => setCursorScale(1);

    const interactiveElements = document.querySelectorAll('a, button, [role="button"], input, textarea, select, .cursor-interactive');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [loading, projects, skills, certificates]);

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

  if (loading) return <LoadingSpinner fullScreen message="Setting up Akash Studio Workspace..." />;

  // Default Stats if empty
  const statItems = [
    { value: projects.length > 0 ? `${projects.length}+` : '8+', label: 'Developments', color: 'text-[#66fcf1]' },
    { value: skills.length > 0 ? `${skills.length}+` : '15+', label: 'Tech Modules', color: 'text-[#45a29e]' },
    { value: '1', label: 'Hackathon Win', color: 'text-[#c5c6c7]' }
  ];

  // Default Skills if empty
  const defaultSkills = [
    { name: 'React', category: 'Frontend' },
    { name: 'Tailwind CSS', category: 'Frontend' },
    { name: 'Next.js', category: 'Frontend' },
    { name: 'TypeScript', category: 'Frontend' },
    { name: 'JavaScript', category: 'Frontend' },
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
      role: 'Creative Engineer',
      duration: '2024 - Present',
      description: 'Assembling interactive layouts, customizing 3D animations and visual nodes.'
    },
    {
      id: 'e2',
      company: 'Tech Institute',
      role: 'B.S. in Computer Science',
      duration: '2021 - 2025',
      description: 'Studied core web engineering, algorithms, graphics, and database architectures.'
    }
  ];

  const displayExperiences = experiences.length > 0 ? experiences : defaultExperiences;

  // Horizontal Scrolling marquee content
  const marqueeItems = [
    'REACT', 'TYPESCRIPT', 'THREE.JS', 'GSAP', 'FIBER', 'SUPABASE', 'TAILWIND', 
    'NODE.JS', 'PYTHON', 'DOCKER', 'POSTGRESQL', 'GIT', 'FIGMA', 'NEXT.JS'
  ];

  // Framer Motion spring scroll slide-up variant
  const slideUpVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 80, damping: 18 }
    }
  };

  return (
    <div 
      style={{ backgroundColor: 'var(--color-dark-950)', color: 'var(--color-text-primary)' }}
      className="min-h-screen selection:bg-[#66fcf1]/30 overflow-x-hidden relative font-sans"
    >
      
      {/* Custom Pointer */}
      <CustomCursor cursorScale={cursorScale} />

      {/* Decorative Starry sky backings */}
      <div className="absolute top-[20%] left-[-15%] w-[500px] h-[500px] rounded-full bg-[#66fcf1]/3 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[65%] right-[-15%] w-[500px] h-[500px] rounded-full bg-[#45a29e]/3 blur-[120px] pointer-events-none z-0" />

      {/* --- HERO / LANDING SECTION --- */}
      <section className="relative min-h-screen w-full flex items-center justify-center px-6 sm:px-16 overflow-hidden pt-28 pb-16" id="hero">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-7xl mx-auto w-full z-10">
          
          {/* Left Text details */}
          <div className="lg:col-span-6 space-y-8 text-left order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#45a29e]/30 bg-[#1f2833]/30 backdrop-blur-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#66fcf1] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#66fcf1]">
                {profile?.role || "Creative Engineer"}
              </span>
            </motion.div>

            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-none text-white"
              >
                {profile?.full_name || "Ebinesar A"}
              </motion.h1>
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl font-extrabold uppercase leading-tight bg-gradient-to-r from-[#66fcf1] via-[#45a29e] to-[#c5c6c7] bg-clip-text text-transparent"
              >
                {profile?.hero_title || "Building Scalable & Modern Web Applications"}
              </motion.h2>
            </div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[#c5c6c7] text-sm leading-relaxed max-w-lg font-medium"
            >
              {profile?.hero_description || "I specialize in constructing scaleable, robust web applications with a focus on immersive interactive experiences and responsive user interfaces."}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <a href="#projects" className="px-8 py-3.5 rounded-xl bg-[#66fcf1] hover:bg-[#66fcf1]/80 text-[#0b0c10] font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-[#66fcf1]/15">
                Inspect Builds
              </a>
              {resumeUrl && (
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 rounded-xl border border-[#45a29e]/30 hover:border-[#66fcf1]/50 text-white font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2">
                  Download Resume <FiDownload />
                </a>
              )}
            </motion.div>
          </div>

          {/* Right 3D Scene */}
          <div className="lg:col-span-6 flex justify-center order-1 lg:order-2 h-[400px] sm:h-[480px] w-full relative">
            <div className="w-full h-full rounded-[2.5rem] border border-[#45a29e]/10 bg-[#1f2833]/15 overflow-hidden shadow-2xl relative">
              <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-[#c5c6c7] text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: 'var(--color-dark-950)' }}>Compiling 3D scene...</div>}>
                <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} className="w-full h-full">
                  <PerspectiveCamera makeDefault position={[0, 0.4, 5]} fov={45} />
                  <StudioWorkspaceScene />
                  <Environment preset="studio" />
                </Canvas>
              </Suspense>
            </div>
          </div>

        </div>
      </section>

      {/* --- SCROLLING MARQUEE TECH BANNER --- */}
      <div className="w-full bg-[#1f2833]/25 border-y border-[#45a29e]/10 py-6 overflow-hidden relative z-10 flex">
        <motion.div 
          className="flex whitespace-nowrap gap-16 text-xs font-black uppercase tracking-[0.3em] text-[#66fcf1]/70"
          animate={{ x: [0, -1000] }}
          transition={{ ease: "linear", duration: 24, repeat: Infinity }}
        >
          {/* Duplicate to make loop seamless */}
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, idx) => (
            <span key={idx} className="flex items-center gap-4 cursor-default">
              <span>{item}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#45a29e]" />
            </span>
          ))}
        </motion.div>
      </div>

      {/* --- ABOUT & JOURNEY SECTION --- */}
      <section className="py-32 px-6 sm:px-16 max-w-7xl mx-auto relative z-10" id="about">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={slideUpVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch"
        >
          
          {/* Biography */}
          <div className="lg:col-span-8 space-y-8 text-left">
            <h3 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
              <span className="text-[#66fcf1]">/01.</span> About & Journeys
            </h3>
            
            <div className="glass-morphism p-8 sm:p-12 border border-[#45a29e]/15 bg-[#1f2833]/15 rounded-[2rem] space-y-6">
              <p className="text-[#c5c6c7] text-sm sm:text-base leading-relaxed font-medium">
                {profile?.hero_description || "I specialize in constructing scaleable, robust web applications with a focus on immersive interactive experiences and responsive user interfaces."}
              </p>
              
              <div className="border-t border-[#45a29e]/10 pt-8 space-y-8">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#45a29e]">
                  Experience logs
                </h4>
                
                <div id="experience" className="space-y-6">
                  {displayExperiences.map((exp, idx) => (
                    <div key={exp.id || idx} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#0b0c10] border border-[#45a29e]/20 flex items-center justify-center text-[#66fcf1] shrink-0 mt-1">
                        <FiBriefcase size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-md">{exp.role}</h4>
                        <p className="text-xs text-[#66fcf1] font-semibold">{exp.company} ({exp.duration})</p>
                        <p className="text-xs text-[#c5c6c7] mt-2 leading-relaxed font-medium">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Grid Stats */}
          <div className="lg:col-span-4 flex flex-col gap-6 justify-between">
            {statItems.map((stat, idx) => (
              <div 
                key={idx}
                className="glass-morphism p-8 border border-[#45a29e]/15 bg-[#1f2833]/15 rounded-[2rem] text-center flex flex-col justify-center items-center flex-1 min-h-[140px] hover:border-[#66fcf1]/40 transition-colors duration-300"
              >
                <h4 className={`text-4xl sm:text-5xl font-black ${stat.color} mb-2`}>
                  {stat.value}
                </h4>
                <p className="text-[#c5c6c7] text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>

        </motion.div>
      </section>

      {/* --- TECHNICAL MODULES SECTION --- */}
      <section className="py-32 px-6 sm:px-16 max-w-7xl mx-auto relative z-10 border-t border-[#45a29e]/10" id="skills">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={slideUpVariants}
          className="space-y-16"
        >
          <div className="text-left">
            <h3 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
              <span className="text-[#66fcf1]">/02.</span> Tech Stack
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {categories.map((cat) => (
              <div key={cat} className="glass-morphism p-8 border border-[#45a29e]/15 bg-[#1f2833]/15 rounded-[2rem] hover:border-[#66fcf1]/40 transition-colors duration-300">
                <h4 className="text-xs font-black uppercase text-[#66fcf1] tracking-[0.2em] mb-6 pb-2 border-b border-[#45a29e]/10 flex items-center gap-2">
                  <FiCpu size={14} className="text-[#66fcf1] animate-pulse" /> {cat === 'Database' ? 'Database & Cloud' : cat}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {displaySkills.filter(s => {
                    const mappedCat = s.category === 'Programming' ? 'Database' : s.category;
                    return mappedCat === cat;
                  }).map(skill => (
                    <span 
                      key={skill.name} 
                      className="px-3.5 py-1.5 rounded-lg bg-[#0b0c10] border border-[#45a29e]/25 text-xs font-semibold text-[#c5c6c7] hover:border-[#66fcf1]/50 hover:text-white transition-all cursor-default"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </motion.div>
      </section>

      {/* --- PROJECTS PORTFOLIO GRID --- */}
      <section className="py-32 px-6 sm:px-16 max-w-7xl mx-auto relative z-10 border-t border-[#45a29e]/10" id="projects">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={slideUpVariants}
          className="space-y-16"
        >
          <div className="text-left">
            <h3 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
              <span className="text-[#66fcf1]">/03.</span> Featured Works
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayProjects.map((project, idx) => (
              <div 
                key={project.id || idx}
                className="glass-morphism p-8 border border-[#45a29e]/15 bg-[#1f2833]/15 rounded-[2rem] flex flex-col justify-between hover:border-[#66fcf1]/40 hover:shadow-[0_10px_30px_rgba(102,252,241,0.03)] transition-all duration-300 group cursor-default"
              >
                <div className="space-y-6 text-left">
                  {/* Mockup screen overlay */}
                  <div className="relative aspect-[16/10] w-full rounded-2xl bg-[#0b0c10] border border-[#45a29e]/20 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/[0.01] z-0" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#66fcf1]/5 to-transparent z-1 pointer-events-none" />
                    <div className="relative z-10 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-[#1f2833]/60 border border-[#45a29e]/30 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500">
                        <FiFolder className="text-[#66fcf1]" size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xl font-bold text-white group-hover:text-[#66fcf1] transition-colors">
                      {project.title}
                    </h4>
                    <p className="text-[#c5c6c7] text-xs leading-relaxed font-medium line-clamp-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {project.tech_stack?.map(tech => (
                        <span key={tech} className="text-[10px] font-bold text-[#66fcf1] bg-[#66fcf1]/5 border border-[#66fcf1]/10 px-2.5 py-0.5 rounded-md">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#45a29e]/10">
                  <div className="flex gap-3">
                    {project.deployed_link && (
                      <a href={project.deployed_link} className="px-5 py-2 rounded-lg bg-[#66fcf1] hover:bg-[#66fcf1]/80 text-[#0b0c10] font-black text-[10px] tracking-wider uppercase transition-all shadow-md shadow-[#66fcf1]/10 cursor-pointer pointer-events-auto" target="_blank" rel="noopener noreferrer">
                        Demo
                      </a>
                    )}
                    {project.github_link && (
                      <a href={project.github_link} className="px-5 py-2 rounded-lg border border-[#45a29e]/30 text-white font-black text-[10px] tracking-wider uppercase hover:border-[#66fcf1]/50 hover:bg-white/5 transition-all flex items-center gap-1.5 cursor-pointer pointer-events-auto" target="_blank" rel="noopener noreferrer">
                        <FiGithub size={12} /> Source
                      </a>
                    )}
                  </div>
                  <span className="text-[10px] text-[#45a29e] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#66fcf1] animate-pulse" />
                    Verified
                  </span>
                </div>
              </div>
            ))}
          </div>

        </motion.div>
      </section>

      {/* --- CERTIFICATIONS SECTION --- */}
      {certificates.length > 0 && (
        <section className="py-32 px-6 sm:px-16 max-w-7xl mx-auto relative z-10 border-t border-[#45a29e]/10" id="certificates">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={slideUpVariants}
            className="space-y-16"
          >
            <div className="text-left">
              <h3 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
                <span className="text-[#66fcf1]">/04.</span> Achievements
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {certificates.map((cert) => (
                <div 
                  key={cert.id}
                  className="glass-morphism border border-[#45a29e]/15 bg-[#1f2833]/15 p-6 rounded-2xl flex flex-col justify-between hover:border-[#66fcf1]/40 transition-colors duration-300 cursor-pointer text-left"
                  onClick={() => {
                    setSelectedCert(cert);
                    setModalOpen(true);
                  }}
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-[#0b0c10] border border-[#66fcf1]/20 flex items-center justify-center text-[#66fcf1]">
                      <FiAward size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm line-clamp-2">{cert.title}</h4>
                      <p className="text-xs text-[#45a29e] font-semibold mt-1">{cert.issuer}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#45a29e]/10">
                    <span className="text-[10px] text-[#c5c6c7] font-medium flex items-center gap-1.5">
                      <FiCalendar /> {cert.date}
                    </span>
                    <span className="text-[10px] text-[#66fcf1] font-bold uppercase tracking-wider">
                      Open
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* --- TERMINAL CONTACT SECTION --- */}
      <section className="py-32 px-6 sm:px-16 max-w-4xl mx-auto relative z-10 border-t border-[#45a29e]/10" id="contact">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={slideUpVariants}
          className="space-y-16"
        >
          <div className="text-center">
            <h3 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
              Get In Touch
            </h3>
          </div>

          <div className="border border-[#45a29e]/20 bg-[#0b0c10] rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Terminal Top Window Bar */}
            <div className="bg-[#1f2833]/30 px-6 py-4 border-b border-[#45a29e]/15 flex items-center justify-between">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#45a29e] flex items-center gap-1.5">
                <FiTerminal /> bash - contact.sh
              </span>
              <div className="w-12" />
            </div>

            {/* Terminal Body */}
            <form onSubmit={handleFormSubmit} className="p-8 space-y-6 text-left">
              <div className="text-[#45a29e] text-xs font-semibold leading-relaxed mb-4">
                <p>{`// Initialize connection handshake`}</p>
                <p className="text-[#66fcf1]">{`$ contact --init`}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#45a29e]">{`// name_field`}</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    value={formState.name}
                    onChange={handleInputChange}
                    placeholder="name = 'Your Name'" 
                    className="w-full bg-[#1f2833]/20 border border-[#45a29e]/30 px-4 py-3 rounded-lg text-sm focus:border-[#66fcf1] transition-all outline-none font-mono text-white placeholder:text-[#45a29e]/50" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#45a29e]">{`// email_field`}</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    value={formState.email}
                    onChange={handleInputChange}
                    placeholder="email = 'email@example.com'" 
                    className="w-full bg-[#1f2833]/20 border border-[#45a29e]/30 px-4 py-3 rounded-lg text-sm focus:border-[#66fcf1] transition-all outline-none font-mono text-white placeholder:text-[#45a29e]/50" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#45a29e]">{`// subject_field`}</label>
                <input 
                  type="text" 
                  name="subject" 
                  required 
                  value={formState.subject}
                  onChange={handleInputChange}
                  placeholder="subject = 'Project Proposal'" 
                  className="w-full bg-[#1f2833]/20 border border-[#45a29e]/30 px-4 py-3 rounded-lg text-sm focus:border-[#66fcf1] transition-all outline-none font-mono text-white placeholder:text-[#45a29e]/50" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#45a29e]">{`// message_payload`}</label>
                <textarea 
                  name="message" 
                  required 
                  rows="5"
                  value={formState.message}
                  onChange={handleInputChange}
                  placeholder="payload = 'Type your message details here...'" 
                  className="w-full bg-[#1f2833]/20 border border-[#45a29e]/30 p-4 rounded-lg text-sm focus:border-[#66fcf1] transition-all outline-none font-mono text-white placeholder:text-[#45a29e]/50 resize-none" 
                />
              </div>

              <div className="pt-6 flex items-center justify-between flex-wrap gap-4 border-t border-[#45a29e]/10">
                {/* Social icons */}
                <div className="flex gap-2">
                  {profile?.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#1f2833]/40 border border-[#45a29e]/20 hover:border-[#66fcf1] hover:text-[#66fcf1] flex items-center justify-center text-[#c5c6c7] transition-all pointer-events-auto">
                      <FiGithub size={18} />
                    </a>
                  )}
                  {profile?.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#1f2833]/40 border border-[#45a29e]/20 hover:border-[#66fcf1] hover:text-[#66fcf1] flex items-center justify-center text-[#c5c6c7] transition-all pointer-events-auto">
                      <FiLinkedin size={18} />
                    </a>
                  )}
                  {profile?.twitter_url && (
                    <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#1f2833]/40 border border-[#45a29e]/20 hover:border-[#66fcf1] hover:text-[#66fcf1] flex items-center justify-center text-[#c5c6c7] transition-all pointer-events-auto">
                      <FiTwitter size={18} />
                    </a>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={formLoading}
                  className="px-8 py-3.5 rounded-lg bg-[#66fcf1] hover:bg-[#66fcf1]/80 disabled:opacity-50 text-[#0b0c10] font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-[#66fcf1]/10 pointer-events-auto cursor-pointer"
                >
                  {formLoading ? 'sending...' : 'send --payload'} <FiSend />
                </button>
              </div>

              <AnimatePresence>
                {formSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-[#66fcf1] font-mono mt-4 border border-[#66fcf1]/30 bg-[#66fcf1]/5 p-3 rounded-lg"
                  >
                    {`[SUCCESS] Connection secure. Message payload dispatched to administrator.`}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </motion.div>
      </section>

      {/* Fullscreen Certificate Modal */}
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

export default AkashStudioPortfolioView;

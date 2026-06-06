import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiGithub, 
  FiLinkedin, 
  FiTwitter, 
  FiArrowRight, 
  FiDownload, 
  FiCalendar, 
  FiBriefcase, 
  FiFolder, 
  FiAward, 
  FiSend, 
  FiTerminal
} from 'react-icons/fi';
import { fetchProfile } from '../services/profileService';
import { fetchProjects } from '../services/projectService';
import { fetchSkills } from '../services/skillService';
import { fetchExperiences } from '../services/cmsService';
import { fetchCertificates } from '../services/certificateService';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Stars, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';
import CertificateModal from '../components/CertificateModal';
import LoadingSpinner from '../components/LoadingSpinner';

// --- 3D TILT CONTAINER ---
const TiltCard = ({ children, className = '', glowColor = 'rgba(139, 92, 246, 0.15)' }) => {
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

// --- PROCEDURAL 3D SCRUBBABLE CHARACTER ---
const ScrubCharacter = ({ scrollProgress }) => {
  const bodyRef = useRef();
  const neckRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const eyeLidsRef = useRef();

  // Joint definitions at each keyframe
  const keyframes = useMemo(() => [
    // 0: Hero (Neutral head, waving hello)
    {
      neckX: (t) => 0,
      neckY: (t) => 0,
      leftArmZ: (t) => Math.PI / 2.8 + Math.sin(t * 6.0) * 0.15,
      rightArmZ: (t) => -0.15,
      bodyY: 0,
      glowIntensity: 1.5,
      glowColor: '#8b5cf6'
    },
    // 1: About (Head nodding, leaning forward)
    {
      neckX: (t) => 0.18 + Math.sin(t * 2.2) * 0.05,
      neckY: (t) => 0,
      leftArmZ: (t) => 0.1,
      rightArmZ: (t) => -0.1,
      bodyY: 0.15,
      glowIntensity: 2.0,
      glowColor: '#ec4899'
    },
    // 2: Skills (Hands raised, presenting core)
    {
      neckX: (t) => -0.08,
      neckY: (t) => 0,
      leftArmZ: (t) => 1.35 + Math.sin(t * 1.5) * 0.05,
      rightArmZ: (t) => -1.35 - Math.sin(t * 1.5) * 0.05,
      bodyY: -0.05,
      glowIntensity: 4.5,
      glowColor: '#f59e0b'
    },
    // 3: Projects (Head looking to the right/content)
    {
      neckX: (t) => 0,
      neckY: (t) => -0.5,
      leftArmZ: (t) => 0.25,
      rightArmZ: (t) => -0.25,
      bodyY: 0,
      glowIntensity: 2.5,
      glowColor: '#8b5cf6'
    },
    // 4: Awards (Right hand placed on heart)
    {
      neckX: (t) => 0.1,
      neckY: (t) => 0.2,
      leftArmZ: (t) => 0.3,
      rightArmZ: (t) => -0.65 - Math.sin(t * 2) * 0.02,
      bodyY: 0.05,
      glowIntensity: 3.5,
      glowColor: '#ec4899'
    },
    // 5: Contact (Waving goodbye)
    {
      neckX: (t) => 0,
      neckY: (t) => 0,
      leftArmZ: (t) => Math.PI / 2.6 + Math.sin(t * 7.5) * 0.2,
      rightArmZ: (t) => -0.15,
      bodyY: 0,
      glowIntensity: 2.0,
      glowColor: '#f59e0b'
    }
  ], []);

  // Frame animation runner
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Calculate fractional scroll indexes
    const count = keyframes.length - 1;
    const rawIdx = scrollProgress * count;
    const idx = Math.min(Math.floor(rawIdx), count - 1);
    const fraction = rawIdx - idx;

    const k1 = keyframes[idx];
    const k2 = keyframes[idx + 1];

    // LERP all joints
    const nX = THREE.MathUtils.lerp(k1.neckX(t), k2.neckX(t), fraction);
    const nY = THREE.MathUtils.lerp(k1.neckY(t), k2.neckY(t), fraction);
    const lA = THREE.MathUtils.lerp(k1.leftArmZ(t), k2.leftArmZ(t), fraction);
    const rA = THREE.MathUtils.lerp(k1.rightArmZ(t), k2.rightArmZ(t), fraction);
    const bY = THREE.MathUtils.lerp(k1.bodyY, k2.bodyY, fraction);

    // Apply translations & rotations
    if (neckRef.current) {
      neckRef.current.rotation.x = nX;
      neckRef.current.rotation.y = nY;
    }
    if (leftArmRef.current) {
      leftArmRef.current.rotation.z = lA;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.z = rA;
    }
    if (bodyRef.current) {
      bodyRef.current.position.y = -0.55 + bY + Math.sin(t * 1.8) * 0.02; // floating breathing
    }

    // Wink/Blink controller (Blinks every 4s)
    if (eyeLidsRef.current) {
      const isBlinking = Math.floor(t) % 4 === 0 && (t % 1 < 0.15);
      eyeLidsRef.current.scale.y = isBlinking ? 0.15 : 1;
    }
  });

  return (
    <group ref={bodyRef} position={[0, -0.55, 0]}>
      {/* Torso/Jacket */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.44, 0.64, 16]} />
        <meshStandardMaterial color="#2e1065" roughness={0.65} />
      </mesh>
      {/* Hoodie Collar */}
      <mesh position={[0, 0.54, 0]}>
        <torusGeometry args={[0.16, 0.045, 8, 24]} />
        <meshStandardMaterial color="#4c1d95" roughness={0.7} />
      </mesh>
      
      {/* Left Shoulder & Arm Joint */}
      <group position={[-0.35, 0.45, 0]}>
        <group ref={leftArmRef} rotation={[0, 0, 0.2]}>
          {/* Shoulder Cap */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#4c1d95" />
          </mesh>
          {/* Arm Cylinder */}
          <mesh position={[-0.05, -0.22, 0]} rotation={[0, 0, -0.1]}>
            <cylinderGeometry args={[0.05, 0.04, 0.45]} />
            <meshStandardMaterial color="#2e1065" />
          </mesh>
          {/* Hand Sphere */}
          <mesh position={[-0.08, -0.44, 0]}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshStandardMaterial color="#ffeedd" />
          </mesh>
        </group>
      </group>

      {/* Right Shoulder & Arm Joint */}
      <group position={[0.35, 0.45, 0]}>
        <group ref={rightArmRef} rotation={[0, 0, -0.2]}>
          {/* Shoulder Cap */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#4c1d95" />
          </mesh>
          {/* Arm Cylinder */}
          <mesh position={[0.05, -0.22, 0]} rotation={[0, 0, 0.1]}>
            <cylinderGeometry args={[0.05, 0.04, 0.45]} />
            <meshStandardMaterial color="#2e1065" />
          </mesh>
          {/* Hand Sphere */}
          <mesh position={[0.08, -0.44, 0]}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshStandardMaterial color="#ffeedd" />
          </mesh>
        </group>
      </group>

      {/* Neck */}
      <mesh position={[0, 0.59, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.16]} />
        <meshStandardMaterial color="#ffeedd" roughness={0.4} />
      </mesh>

      {/* Neck Joint & Head Group */}
      <group ref={neckRef} position={[0, 0.76, 0]}>
        {/* Skull */}
        <mesh castShadow>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshStandardMaterial color="#ffeedd" roughness={0.4} />
        </mesh>
        
        {/* Low-Poly Hair */}
        <group position={[0, 0.08, 0]}>
          <mesh position={[0, 0.18, 0.02]} castShadow>
            <sphereGeometry args={[0.19, 12, 12]} />
            <meshStandardMaterial color="#271c19" roughness={0.8} flatShading />
          </mesh>
          <mesh position={[0.1, 0.13, -0.06]} castShadow>
            <sphereGeometry args={[0.13, 8, 8]} />
            <meshStandardMaterial color="#271c19" roughness={0.8} flatShading />
          </mesh>
          <mesh position={[-0.1, 0.13, -0.06]} castShadow>
            <sphereGeometry args={[0.13, 8, 8]} />
            <meshStandardMaterial color="#271c19" roughness={0.8} flatShading />
          </mesh>
        </group>

        {/* Eyes Lids Group (Scales down to Blink) */}
        <group ref={eyeLidsRef}>
          {/* Eyes Spheres */}
          <mesh position={[-0.09, 0.02, 0.2]}>
            <sphereGeometry args={[0.026, 8, 8]} />
            <meshStandardMaterial color="#0b0a0f" roughness={0.1} />
          </mesh>
          <mesh position={[0.09, 0.02, 0.2]}>
            <sphereGeometry args={[0.026, 8, 8]} />
            <meshStandardMaterial color="#0b0a0f" roughness={0.1} />
          </mesh>
        </group>

        {/* Neon Purple Glasses */}
        <group position={[0, 0.02, 0.22]}>
          <mesh position={[-0.095, 0, 0]}>
            <torusGeometry args={[0.048, 0.007, 8, 20]} />
            <meshBasicMaterial color="#a78bfa" toneMapped={false} />
          </mesh>
          <mesh position={[0.095, 0, 0]}>
            <torusGeometry args={[0.048, 0.007, 8, 20]} />
            <meshBasicMaterial color="#a78bfa" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.09, 0.012, 0.01]} />
            <meshBasicMaterial color="#a78bfa" toneMapped={false} />
          </mesh>
        </group>

        {/* Smile */}
        <mesh position={[0, -0.1, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.045, 0.007, 4, 12, Math.PI]} />
          <meshStandardMaterial color="#f43f5e" />
        </mesh>
      </group>
    </group>
  );
};

// --- MAIN SCRUB VIEW COMPONENT ---
const ScrubAvatarPortfolioView = () => {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('/resume.pdf');

  // Scroll tracking (0 to 1)
  const [scrollProgress, setScrollProgress] = useState(0);

  // Contact Form state
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const defaultSkills = useMemo(() => [
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
  ], []);

  const displaySkills = useMemo(() => skills.length > 0 ? skills : defaultSkills, [skills, defaultSkills]);
  const categories = useMemo(() => ['Frontend', 'Backend', 'Database', 'Tools'], []);

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
        console.error('Failed to load scrub data:', e);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // Listen to global scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const progress = window.scrollY / scrollHeight;
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  if (loading) return <LoadingSpinner fullScreen message="Calibrating pose matrix..." />;

  const statItems = [
    { value: projects.length > 0 ? `${projects.length}+` : '8+', label: 'Featured Builds', color: 'from-[#8b5cf6] to-[#ec4899]' },
    { value: skills.length > 0 ? `${skills.length}+` : '15+', label: 'Tech Upgrade', color: 'from-[#ec4899] to-[#f59e0b]' },
    { value: '1', label: 'Hackathon Win', color: 'from-[#f59e0b] to-[#8b5cf6]' }
  ];

  const defaultExperiences = [
    {
      id: 'e1',
      company: 'Build With Satya',
      role: 'Creative Web Architect',
      duration: '2024 - Present',
      description: 'Crafting immersive 3D R3F scenes, WebGL components, and optimized layout routing.'
    },
    {
      id: 'e2',
      company: 'Software Enterprise',
      role: 'Creative Intern',
      duration: '2022 - 2024',
      description: 'Focused on UI design, Framer Motion transitions, and vanilla CSS component structures.'
    }
  ];

  const displayExperiences = experiences.length > 0 ? experiences : defaultExperiences;

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

  const slideUpVariants = {
    hidden: { opacity: 0, y: 45 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 90, damping: 20 }
    }
  };

  const safeName = profile?.full_name || 'Ebinesar A';

  return (
    <div 
      style={{ backgroundColor: 'var(--color-dark-950)', color: 'var(--color-text-primary)' }}
      className="min-h-[600vh] selection:bg-[#8b5cf6]/30 relative"
    >
      
      {/* Fixed Split-Screen WebGL Canvas (Left Half) */}
      <div className="fixed left-0 top-0 w-full md:w-1/2 h-screen z-0 pointer-events-none bg-radial-glow">
        <Suspense fallback={null}>
          <Canvas gl={{ antialias: true }} className="w-full h-full">
            <ambientLight intensity={0.3} />
            
            {/* Color Accent Spotlight */}
            <spotLight position={[0, 4, 3]} angle={0.8} penumbra={0.5} intensity={7} color="#8b5cf6" castShadow />
            <pointLight position={[-2, 1, 0]} intensity={5} color="#ec4899" />
            <pointLight position={[2, 1, 0]} intensity={5} color="#f59e0b" />
            
            <PerspectiveCamera makeDefault position={[0, 0.4, 2.0]} fov={45} />
            
            <ScrubCharacter scrollProgress={scrollProgress} />
            
            <Stars radius={100} depth={50} count={700} factor={4} saturation={0.5} fade speed={1.0} />
            <Sparkles count={50} scale={2} color="#8b5cf6" speed={1.5} size={2.5} />
            <Environment preset="city" />
          </Canvas>
        </Suspense>
      </div>

      {/* Scrollable Layout Overlay (Right Half on Desktop) */}
      <div className="relative z-10 w-full flex justify-end pointer-events-none">
        
        {/* Right side container */}
        <div className="w-full md:w-1/2 min-h-screen flex flex-col pt-24 px-6 sm:px-12 md:px-16 space-y-16">
          
          {/* Section 1: Hero */}
          <section className="h-[90vh] flex items-center justify-start" id="hero">
            <div className="space-y-6 pointer-events-auto max-w-xl">
              <motion.span 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-black uppercase tracking-[0.3em] text-[#8b5cf6] block animate-pulse"
              >
                {profile?.role || 'Creative Web Architect'}
              </motion.span>

              <motion.div
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-1"
              >
                <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
                  {safeName}
                </h1>
                <h2 className="text-xl sm:text-2xl font-extrabold uppercase leading-tight bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#f59e0b] bg-clip-text text-transparent">
                  {profile?.hero_title || 'Building Scalable & Modern Web Applications'}
                </h2>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-medium"
              >
                {profile?.hero_description || 'Watch the 3D character respond, wave, nod, wink, and shift postures as you scroll! Check out my experience, skills, projects, and connect.'}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-4 flex gap-4"
              >
                <a href="#about" className="px-8 py-3.5 rounded-full bg-[#8b5cf6] hover:bg-[#8b5cf6]/80 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#8b5cf6]/20">
                  Begin Tour <FiArrowRight className="inline-block ml-1" />
                </a>
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 rounded-full border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/5 transition-all flex items-center gap-2">
                  Resume <FiDownload />
                </a>
              </motion.div>
            </div>
          </section>

          {/* Section 2: Biography (About) */}
          <section className="min-h-screen flex items-center justify-start" id="about">
            <div className="space-y-6 pointer-events-auto max-w-xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideUpVariants}
                className="space-y-8 w-full"
              >
                <h3 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
                  <span className="text-[#8b5cf6]">01.</span> Rider Log
                </h3>

                <div className="space-y-6">
                  <TiltCard className="p-8 border border-white/5 bg-[#171123]/45 flex flex-col justify-between" glowColor="rgba(139, 92, 246, 0.08)">
                    <div className="space-y-6">
                      <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-medium">
                        {profile?.hero_description || 'I contribute to building critical, robust and responsive web applications. I focus on creative frontend animations, interactive 3D WebGL interfaces, and high-performance server structures.'}
                      </p>
                      
                      <div id="experience" className="border-t border-white/5 pt-6 space-y-4">
                        {displayExperiences.map((exp, idx) => (
                          <div key={exp.id || idx} className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[#8b5cf6] shrink-0 mt-1">
                              <FiBriefcase size={16} />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-xs">{exp.role}</h4>
                              <p className="text-[10px] text-zinc-400 font-semibold">{exp.company} ({exp.duration})</p>
                              <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed font-medium">{exp.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TiltCard>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    {statItems.map((stat, idx) => (
                      <div 
                        key={idx}
                        className="glass-morphism p-5 border border-white/5 bg-[#171123]/30 rounded-2xl text-center flex flex-col justify-center items-center hover:border-[#8b5cf6]/30 transition-all duration-300"
                      >
                        <h3 className={`text-2xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-0.5`}>
                          {stat.value}
                        </h3>
                        <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Section 3: Tech Stack */}
          <section className="min-h-screen flex items-center justify-start" id="skills">
            <div className="space-y-6 pointer-events-auto max-w-xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideUpVariants}
                className="space-y-6 w-full"
              >
                <h3 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
                  <span className="text-[#ec4899]">02.</span> Tech Upgrades
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-medium">
                  My skills revolve around building clean, high-performance client frameworks and deploying robust full-stack infrastructures.
                </p>

                <div className="space-y-4 pt-4 border-t border-white/5 text-left">
                  {categories.map(cat => (
                    <div key={cat} className="space-y-1.5">
                      <h5 className="text-[9px] font-black uppercase tracking-widest text-[#ec4899]">{cat} Stack</h5>
                      <div className="flex flex-wrap gap-1.5 justify-start">
                        {displaySkills.filter(s => {
                          const mappedCat = s.category === 'Programming' ? 'Database' : s.category;
                          return mappedCat === cat;
                        }).map(sk => (
                          <span key={sk.name} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-zinc-300 hover:border-[#ec4899]/30 transition-colors">
                            {sk.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Section 4: Projects */}
          <section className="min-h-screen flex items-center justify-start" id="projects">
            <div className="space-y-6 pointer-events-auto max-w-xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideUpVariants}
                className="space-y-8 w-full"
              >
                <h3 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
                  <span className="text-[#f59e0b]">03.</span> Featured Works
                </h3>

                <div className="space-y-4">
                  {displayProjects.map((project, idx) => (
                    <TiltCard key={project.id || idx} className="p-6 border border-white/5 bg-[#171123]/30 flex flex-col justify-between" glowColor="rgba(245, 158, 11, 0.08)">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-base font-bold text-white">{project.title}</h4>
                          <FiFolder className="text-[#8b5cf6]" size={16} />
                        </div>
                        <p className="text-zinc-400 text-xs leading-relaxed font-medium line-clamp-3">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {project.tech_stack?.map(tech => (
                            <span key={tech} className="text-[9px] font-bold text-[#f59e0b] bg-[#f59e0b]/5 border border-[#f59e0b]/10 px-2 py-0.5 rounded-md">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                        <div className="flex gap-2">
                          {project.deployed_link && (
                            <a href={project.deployed_link} className="px-3 py-1 rounded-lg bg-[#8b5cf6] hover:bg-[#8b5cf6]/80 text-white font-bold text-[9px] tracking-wider uppercase transition-all shadow-md animate-pulse" target="_blank" rel="noopener noreferrer">
                              Demo
                            </a>
                          )}
                          {project.github_link && (
                            <a href={project.github_link} className="px-3 py-1 rounded-lg border border-white/10 text-white font-bold text-[9px] tracking-wider uppercase hover:bg-white/5 transition-all flex items-center gap-1" target="_blank" rel="noopener noreferrer">
                              <FiGithub size={10} /> Source
                            </a>
                          )}
                        </div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Deploy
                        </span>
                      </div>
                    </TiltCard>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Section 5: Achievements */}
          {certificates.length > 0 && (
            <section className="min-h-screen flex items-center justify-start" id="certificates">
              <div className="space-y-6 pointer-events-auto max-w-xl">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={slideUpVariants}
                  className="space-y-6 w-full"
                >
                  <h3 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
                    <span className="text-[#8b5cf6]">04.</span> Commendations
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {certificates.map((cert) => (
                      <div 
                        key={cert.id}
                        className="glass-morphism border border-white/5 bg-[#171123]/30 p-5 rounded-2xl flex flex-col justify-between cursor-pointer hover:border-[#8b5cf6]/30 transition-all"
                        onClick={() => {
                          setSelectedCert(cert);
                          setModalOpen(true);
                        }}
                      >
                        <div className="space-y-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[#8b5cf6]">
                            <FiAward size={16} />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-xs line-clamp-1">{cert.title}</h4>
                            <p className="text-[9px] text-[#8b5cf6]/80 font-semibold mt-0.5">{cert.issuer}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
                          <span className="text-[9px] text-gray-400 font-medium flex items-center gap-1 font-mono">
                            <FiCalendar size={10} /> {cert.date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </section>
          )}

          {/* Section 6: Contact */}
          <section className="min-h-screen flex items-center justify-start" id="contact">
            <div className="space-y-6 pointer-events-auto max-w-xl w-full">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideUpVariants}
                className="space-y-6 w-full"
              >
                <h3 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
                  Establish Comms
                </h3>

                <div className="border border-white/10 bg-[#171123]/50 rounded-2xl overflow-hidden shadow-2xl relative text-left w-full">
                  {/* Console Header */}
                  <div className="bg-black/30 px-6 py-3 border-b border-white/5 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8b5cf6] flex items-center gap-1.5 font-mono">
                      <FiTerminal /> pose-comms.sh
                    </span>
                    <div className="w-10" />
                  </div>

                  {/* Form */}
                  <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-[#8b5cf6] font-mono">{`# username`}</label>
                        <input 
                          type="text" 
                          name="name" 
                          required 
                          value={formState.name}
                          onChange={handleInputChange}
                          placeholder="Enter name" 
                          className="w-full bg-[#05020c]/80 border border-white/10 px-4 py-2.5 rounded-xl text-xs focus:border-[#8b5cf6] transition-all outline-none font-mono text-white placeholder:text-zinc-600" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-[#8b5cf6] font-mono">{`# email_host`}</label>
                        <input 
                          type="email" 
                          name="email" 
                          required 
                          value={formState.email}
                          onChange={handleInputChange}
                          placeholder="Enter email" 
                          className="w-full bg-[#05020c]/80 border border-white/10 px-4 py-2.5 rounded-xl text-xs focus:border-[#8b5cf6] transition-all outline-none font-mono text-white placeholder:text-zinc-600" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold uppercase tracking-widest text-[#8b5cf6] font-mono">{`# payload`}</label>
                      <textarea 
                        name="message" 
                        required 
                        rows="3"
                        value={formState.message}
                        onChange={handleInputChange}
                        placeholder="Write transmission details..." 
                        className="w-full bg-[#05020c]/80 border border-white/10 p-4 rounded-xl text-xs focus:border-[#8b5cf6] transition-all outline-none font-mono text-white placeholder:text-zinc-600 resize-none" 
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-4">
                      <button 
                        type="submit" 
                        disabled={formLoading}
                        className="px-6 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#8b5cf6]/80 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#8b5cf6]/10 font-mono"
                      >
                        {formLoading ? 'dispatching...' : 'run --dispatch'} <FiSend />
                      </button>

                      <AnimatePresence>
                        {formSuccess && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-[9px] text-green-400 font-mono border border-green-500/20 bg-green-500/5 p-2 rounded-lg"
                          >
                            {`[SUCCESS] Packet dispatched.`}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </section>

        </div>

      </div>

      {/* Certificate Modal */}
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

export default ScrubAvatarPortfolioView;

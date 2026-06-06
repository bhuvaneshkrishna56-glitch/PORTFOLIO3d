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
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Sparkles, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import CertificateModal from '../components/CertificateModal';
import LoadingSpinner from '../components/LoadingSpinner';

// --- 3D TILT CONTAINER ---
const TiltCard = ({ children, className = '', glowColor = 'rgba(251, 191, 36, 0.15)' }) => {
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

// --- PROCEDURAL 3D ROOM OBJECTS ---

// Workstation Desk (X = -3.5, Z = 0)
const WorkstationMesh = () => {
  const screenColor = '#8b5cf6';
  return (
    <group position={[-3.5, 0, 0]} rotation={[0, Math.PI / 2.5, 0]}>
      {/* Desk Top */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[2.2, 0.08, 1.2]} />
        <meshStandardMaterial color="#2c253d" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Desk Legs */}
      <mesh position={[-1.0, 0.4, -0.5]}>
        <cylinderGeometry args={[0.04, 0.04, 0.8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[1.0, 0.4, -0.5]}>
        <cylinderGeometry args={[0.04, 0.04, 0.8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-1.0, 0.4, 0.5]}>
        <cylinderGeometry args={[0.04, 0.04, 0.8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[1.0, 0.4, 0.5]}>
        <cylinderGeometry args={[0.04, 0.04, 0.8]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Monitor Base */}
      <mesh position={[0, 0.86, -0.2]}>
        <boxGeometry args={[0.2, 0.04, 0.2]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Monitor Stand */}
      <mesh position={[0, 1.0, -0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Monitor Screen Frame */}
      <mesh position={[0, 1.25, -0.2]}>
        <boxGeometry args={[1.2, 0.7, 0.05]} />
        <meshStandardMaterial color="#1a1a24" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Monitor Display (Glowing Warm Purple) */}
      <mesh position={[0, 1.25, -0.17]}>
        <planeGeometry args={[1.15, 0.65]} />
        <meshBasicMaterial color={screenColor} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 1.25, 0.2]} intensity={4} distance={3} color={screenColor} />

      {/* Keyboard */}
      <mesh position={[0, 0.85, 0.2]}>
        <boxGeometry args={[0.5, 0.02, 0.2]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Chair */}
      <group position={[0, 0.2, 0.8]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.5, 0.05, 0.5]} />
          <meshStandardMaterial color="#1e1e24" />
        </mesh>
        <mesh position={[0, 0.6, 0.22]}>
          <boxGeometry args={[0.48, 0.55, 0.04]} />
          <meshStandardMaterial color="#1e1e24" />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>
    </group>
  );
};

// Floating Tech Crystal (X = 0, Y = 1.8, Z = -1.5)
const TechCrystalMesh = () => {
  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.8;
      ref.current.rotation.x = state.clock.getElapsedTime() * 0.4;
      ref.current.position.y = 1.8 + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.15;
    }
  });

  return (
    <group>
      <Float speed={3} rotationIntensity={1.5} floatIntensity={1.5}>
        <mesh ref={ref} position={[0, 1.8, -1.5]}>
          <octahedronGeometry args={[0.65, 0]} />
          <meshStandardMaterial 
            color="#fbbf24" 
            emissive="#fbbf24"
            emissiveIntensity={1.2}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
      </Float>
      {/* Spotlight directly down from crystal */}
      <pointLight position={[0, 1.8, -1.5]} intensity={8} distance={8} color="#fbbf24" />
      <Sparkles count={80} scale={3} position={[0, 1.8, -1.5]} color="#fbbf24" speed={1.5} size={3} />
    </group>
  );
};

// Project Frames on Wall (X = 3.8, Z = 0)
const WallGalleryMesh = () => {
  return (
    <group position={[3.8, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Main Backing Board */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[3.2, 1.8, 0.05]} />
        <meshStandardMaterial color="#181825" roughness={0.8} />
      </mesh>
      {/* Outer Glow frame outline */}
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[3.25, 1.85, 0.02]} />
        <meshBasicMaterial color="#f43f5e" wireframe />
      </mesh>

      {/* Dynamic light pointing onto gallery */}
      <spotLight position={[0, 3, 2]} angle={0.8} penumbra={1} intensity={12} color="#f43f5e" />

      {/* Picture Frame 1 (React Logo-like structure representation) */}
      <group position={[-0.8, 0.2, 0]}>
        <mesh>
          <planeGeometry args={[0.8, 0.8]} />
          <meshBasicMaterial color="#8b5cf6" wireframe />
        </mesh>
      </group>

      {/* Picture Frame 2 (Nodes structure representation) */}
      <group position={[0.8, 0.2, 0]}>
        <mesh>
          <planeGeometry args={[0.8, 0.8]} />
          <meshBasicMaterial color="#fbbf24" wireframe />
        </mesh>
      </group>

      {/* Bottom Center Plaque */}
      <mesh position={[0, -0.6, 0.01]}>
        <planeGeometry args={[0.6, 0.25]} />
        <meshStandardMaterial color="#222" metalness={0.8} />
      </mesh>
    </group>
  );
};

// Immersive Room Enclosure (Walls, Floor, Windows, Stars)
const RoomEnclosure = () => {
  return (
    <group>
      {/* Reflective Dark Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#0c0c16" roughness={0.2} metalness={0.9} />
      </mesh>
      <gridHelper args={[12, 24, '#fbbf24', '#2e1c4d']} position={[0, 0.01, 0]} />

      {/* Reflective Dark Ceiling */}
      <mesh position={[0, 3.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#08080f" roughness={0.5} />
      </mesh>

      {/* Back Wall with a large Glass Balcony/Window */}
      <group position={[0, 1.75, -6]}>
        {/* Wall panels left & right */}
        <mesh position={[-4, 0, 0]}>
          <boxGeometry args={[4, 3.5, 0.1]} />
          <meshStandardMaterial color="#101021" />
        </mesh>
        <mesh position={[4, 0, 0]}>
          <boxGeometry args={[4, 3.5, 0.1]} />
          <meshStandardMaterial color="#101021" />
        </mesh>
        {/* Window pane top header */}
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[4, 0.5, 0.1]} />
          <meshStandardMaterial color="#101021" />
        </mesh>
        {/* Transparent glass window */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[4, 2.5]} />
          <meshPhysicalMaterial 
            transmission={0.95} 
            thickness={0.5} 
            roughness={0.05} 
            color="#a78bfa" 
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>

      {/* Neon ceiling rails */}
      <mesh position={[-5.8, 3.4, 0]}>
        <boxGeometry args={[0.1, 0.1, 12]} />
        <meshBasicMaterial color="#8b5cf6" />
      </mesh>
      <mesh position={[5.8, 3.4, 0]}>
        <boxGeometry args={[0.1, 0.1, 12]} />
        <meshBasicMaterial color="#f43f5e" />
      </mesh>
      <mesh position={[0, 3.4, -5.8]}>
        <boxGeometry args={[12, 0.1, 0.1]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>

      {/* Nebula Starry Background (Outside the Window) */}
      <group position={[0, 2, -15]}>
        <Stars radius={60} depth={20} count={1200} factor={6} saturation={0.8} fade speed={1.5} />
        {/* Ambient glow light from outer space */}
        <pointLight position={[0, 0, -2]} intensity={12} distance={20} color="#8b5cf6" />
      </group>
    </group>
  );
};

// --- FLIGHT PATH KEYFRAME SOLVER ---
const pathPoints = [
  // 0: Entrance (Hero)
  { pos: new THREE.Vector3(0, 2.0, 7.5), look: new THREE.Vector3(0, 1.5, 0) },
  // 1: Workstation (About)
  { pos: new THREE.Vector3(-2.2, 1.25, 2.2), look: new THREE.Vector3(-3.5, 1.25, 0) },
  // 2: Tech Gemstone (Skills)
  { pos: new THREE.Vector3(0, 1.4, 1.6), look: new THREE.Vector3(0, 1.7, -1.5) },
  // 3: Wall Frames (Projects)
  { pos: new THREE.Vector3(2.3, 1.5, 2.3), look: new THREE.Vector3(3.8, 1.6, 0) },
  // 4: Close-up Wall Frames (Achievements)
  { pos: new THREE.Vector3(3.0, 1.6, 1.0), look: new THREE.Vector3(3.8, 1.6, 0) },
  // 5: Balcony/Window (Contact)
  { pos: new THREE.Vector3(0, 1.8, -3.2), look: new THREE.Vector3(0, 1.7, -8.0) }
];

const CameraFlightController = ({ scrollProgress }) => {
  const { camera } = useThree();
  const currentTarget = useRef(new THREE.Vector3(0, 1.5, 0));

  useFrame(() => {
    // 1. Calculate path keyframe interpolation
    const count = pathPoints.length - 1;
    const rawIdx = scrollProgress * count;
    const idx = Math.min(Math.floor(rawIdx), count - 1);
    const fraction = rawIdx - idx;

    const k1 = pathPoints[idx];
    const k2 = pathPoints[idx + 1];

    const targetPos = new THREE.Vector3().lerpVectors(k1.pos, k2.pos, fraction);
    const targetLook = new THREE.Vector3().lerpVectors(k1.look, k2.look, fraction);

    // 2. Smoothly slide camera position
    camera.position.lerp(targetPos, 0.05);

    // 3. Smoothly rotate camera view
    currentTarget.current.lerp(targetLook, 0.05);
    camera.lookAt(currentTarget.current);
  });

  return null;
};

// --- MAIN PORTFOLIO VIEW COMPONENT ---
const RoomTourPortfolioView = () => {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);

  // Scroll Progress (0 to 1)
  const [scrollProgress, setScrollProgress] = useState(0);

  // Form State
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
        }
        setProjects(projRes.projects || []);
        setSkills(skillRes.skills || []);
        setExperiences(expRes.experiences || []);
        setCertificates(certRes.certificates || []);
      } catch (e) {
        console.error('Failed to load room tour data:', e);
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

  if (loading) return <LoadingSpinner fullScreen message="Constructing Cozy 3D Studio..." />;

  // Default Stats if empty
  const statItems = [
    { value: projects.length > 0 ? `${projects.length}+` : '8+', label: 'Developments', color: 'from-[#fbbf24] to-[#8b5cf6]' },
    { value: skills.length > 0 ? `${skills.length}+` : '15+', label: 'Technologies', color: 'from-[#8b5cf6] to-[#f43f5e]' },
    { value: '1', label: 'Hackathon Win', color: 'from-[#f43f5e] to-[#fbbf24]' }
  ];

  // Default Experiences if empty
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

  // Default Skills if empty
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

  const slideUpVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 85, damping: 18 }
    }
  };

  const safeName = profile?.full_name || "Ebinesar A";

  return (
    <div 
      style={{ backgroundColor: 'var(--color-dark-950)', color: 'var(--color-text-primary)' }}
      className="min-h-[600vh] selection:bg-[#fbbf24]/30 relative"
    >
      
      {/* --- WebGL Canvas Backdrop (Fixed Position) --- */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <Suspense fallback={<div className="w-full h-full" style={{ backgroundColor: 'var(--color-dark-950)' }} />}>
          <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} className="w-full h-full">
            <PerspectiveCamera makeDefault position={[0, 2.0, 7.5]} fov={50} />
            <CameraFlightController scrollProgress={scrollProgress} />
            
            {/* Ambient Ambiance */}
            <ambientLight intensity={0.3} />
            <directionalLight position={[3, 5, 2]} intensity={1.5} color="#ffffff" castShadow />
            <pointLight position={[-3, 2, -1]} intensity={5} color="#8b5cf6" />
            <pointLight position={[3, 2, -1]} intensity={5} color="#f43f5e" />

            <RoomEnclosure />
            <WorkstationMesh />
            <TechCrystalMesh />
            <WallGalleryMesh />

            <Environment preset="studio" />
          </Canvas>
        </Suspense>
      </div>

      {/* --- HTML Overlay Content --- */}
      <div className="relative z-10 w-full pointer-events-none">
        
        {/* Section 1: Hero */}
        <section className="h-screen w-full flex items-center justify-center px-6 sm:px-16" id="hero">
          <div className="max-w-5xl mx-auto text-center space-y-6 pointer-events-auto">
            <motion.span 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-bold uppercase tracking-[0.3em] text-[#fbbf24] block"
            >
              {profile?.role || "Creative Web Architect"}
            </motion.span>

            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-1"
            >
              <h1 className="text-4xl sm:text-7xl font-black uppercase tracking-tight text-white leading-none">
                {safeName}
              </h1>
              <h2 className="text-xl sm:text-3xl font-extrabold uppercase leading-tight bg-gradient-to-r from-[#fbbf24] via-[#8b5cf6] to-[#f43f5e] bg-clip-text text-transparent">
                {profile?.hero_title || "Building Scalable & Modern Web Applications"}
              </h2>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed font-medium"
            >
              {profile?.hero_description || "Take a stroll through my cozy virtual workspace. Scroll down to travel along the path and check out my setup, skills, projects, and bio."}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-4 flex justify-center gap-4"
            >
              <a href="#about" className="px-8 py-3.5 rounded-full bg-[#fbbf24] hover:bg-[#fbbf24]/80 text-[#0c0c16] font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#fbbf24]/20">
                Begin Tour <FiArrowRight className="inline-block ml-1" />
              </a>
              {resumeUrl && (
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 rounded-full border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/5 transition-all flex items-center gap-2">
                  Download Resume <FiDownload />
                </a>
              )}
            </motion.div>
          </div>
        </section>

        {/* Section 2: About & Biography */}
        <section className="h-screen w-full flex items-center justify-start px-6 sm:px-16" id="about">
          <div className="max-w-4xl w-full text-left pointer-events-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUpVariants}
              className="space-y-8"
            >
              <h3 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
                <span className="text-[#fbbf24]">01.</span> Profile Specification
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Biography */}
                <div className="lg:col-span-8">
                  <TiltCard className="p-8 sm:p-10 h-full border border-white/5 bg-[#121221]/45 flex flex-col justify-between" glowColor="rgba(251, 191, 36, 0.08)">
                    <div className="space-y-6">
                      <p className="text-gray-300 text-sm leading-relaxed font-medium">
                        {profile?.hero_description || "I contribute to building critical, robust and responsive web applications. I focus on creative frontend animations, interactive 3D WebGL interfaces, and high-performance server structures."}
                      </p>
                      
                      <div id="experience" className="border-t border-white/5 pt-6 space-y-4">
                        {displayExperiences.map((exp, idx) => (
                          <div key={exp.id || idx} className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[#fbbf24] shrink-0 mt-1">
                              <FiBriefcase size={16} />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-sm">{exp.role}</h4>
                              <p className="text-[10px] text-gray-400 font-semibold">{exp.company} ({exp.duration})</p>
                              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed font-medium">{exp.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TiltCard>
                </div>

                {/* Stats */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  {statItems.map((stat, idx) => (
                    <div 
                      key={idx}
                      className="glass-morphism p-6 border border-white/5 bg-[#121221]/30 rounded-3xl text-center flex flex-col justify-center items-center flex-1 hover:border-[#fbbf24]/30 transition-all duration-300"
                    >
                      <h3 className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-0.5`}>
                        {stat.value}
                      </h3>
                      <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 3: Tech Stack */}
        <section className="h-screen w-full flex items-center justify-end px-6 sm:px-16" id="skills">
          <div className="max-w-xl w-full text-right pointer-events-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUpVariants}
              className="space-y-6"
            >
              <h3 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
                <span className="text-[#8b5cf6]">02.</span> Tech Stack
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed font-medium">
                My skills revolve around building clean, high-performance client frameworks and deploying robust full-stack infrastructures.
              </p>

              <div className="space-y-4 pt-4 border-t border-white/5 text-left">
                {categories.map(cat => (
                  <div key={cat} className="space-y-1.5">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-[#fbbf24]">{cat} Technologies</h5>
                    <div className="flex flex-wrap gap-1.5 justify-start">
                      {displaySkills.filter(s => {
                        const mappedCat = s.category === 'Programming' ? 'Database' : s.category;
                        return mappedCat === cat;
                      }).map(sk => (
                        <span key={sk.name} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-gray-300">
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
        <section className="h-screen w-full flex items-center justify-center px-6 sm:px-16" id="projects">
          <div className="max-w-5xl w-full text-left pointer-events-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUpVariants}
              className="space-y-8"
            >
              <h3 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
                <span className="text-[#f43f5e]">03.</span> Featured Works
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayProjects.map((project, idx) => (
                  <TiltCard key={project.id || idx} className="p-6 border border-white/5 bg-[#121221]/30 flex flex-col justify-between" glowColor="rgba(244, 63, 94, 0.08)">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-bold text-white">{project.title}</h4>
                        <FiFolder className="text-[#fbbf24]" size={16} />
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed font-medium line-clamp-3">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {project.tech_stack?.map(tech => (
                          <span key={tech} className="text-[9px] font-bold text-[#fbbf24] bg-[#fbbf24]/5 border border-[#fbbf24]/10 px-2 py-0.5 rounded-md">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                      <div className="flex gap-2">
                        {project.deployed_link && (
                          <a href={project.deployed_link} className="px-4 py-1.5 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-[#0c0c16] font-bold text-[9px] tracking-wider uppercase transition-all shadow-md" target="_blank" rel="noopener noreferrer">
                            Demo
                          </a>
                        )}
                        {project.github_link && (
                          <a href={project.github_link} className="px-4 py-1.5 rounded-lg border border-white/10 text-white font-bold text-[9px] tracking-wider uppercase hover:bg-white/5 transition-all flex items-center gap-1" target="_blank" rel="noopener noreferrer">
                            <FiGithub size={10} /> Source
                          </a>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
                      </span>
                    </div>
                  </TiltCard>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 5: Achievements (Certificates) */}
        {certificates.length > 0 && (
          <section className="h-screen w-full flex items-center justify-start px-6 sm:px-16" id="certificates">
            <div className="max-w-4xl w-full text-left pointer-events-auto">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideUpVariants}
                className="space-y-6"
              >
                <h3 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
                  <span className="text-[#fbbf24]">04.</span> Achievements
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certificates.map((cert) => (
                    <div 
                      key={cert.id}
                      className="glass-morphism border border-white/5 bg-[#121221]/30 p-5 rounded-2xl flex flex-col justify-between cursor-pointer hover:border-[#fbbf24]/30 transition-all"
                      onClick={() => {
                        setSelectedCert(cert);
                        setModalOpen(true);
                      }}
                    >
                      <div className="space-y-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[#fbbf24]">
                          <FiAward size={16} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs line-clamp-2">{cert.title}</h4>
                          <p className="text-[10px] text-[#fbbf24]/80 font-semibold mt-0.5">{cert.issuer}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
                        <span className="text-[9px] text-gray-400 font-medium flex items-center gap-1">
                          <FiCalendar size={10} /> {cert.date}
                        </span>
                        <span className="text-[9px] text-[#fbbf24] font-bold uppercase tracking-wider">
                          Verify
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Section 6: Contact Form */}
        <section className="h-screen w-full flex items-center justify-center px-6 sm:px-16" id="contact">
          <div className="max-w-3xl w-full text-center pointer-events-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUpVariants}
              className="space-y-6"
            >
              <h3 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
                Establish Link
              </h3>

              <div className="border border-white/10 bg-[#121221]/50 rounded-2xl overflow-hidden shadow-2xl relative text-left">
                {/* Console Bar */}
                <div className="bg-black/30 px-6 py-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#fbbf24] flex items-center gap-1.5 font-mono">
                    <FiTerminal /> room-comms.sh
                  </span>
                  <div className="w-10" />
                </div>

                {/* Form Content */}
                <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#fbbf24] font-mono">{`# name`}</label>
                      <input 
                        type="text" 
                        name="name" 
                        required 
                        value={formState.name}
                        onChange={handleInputChange}
                        placeholder="Enter name" 
                        className="w-full bg-[#0c0c16]/80 border border-white/10 px-4 py-2.5 rounded-xl text-xs focus:border-[#fbbf24] transition-all outline-none font-mono text-white placeholder:text-gray-600" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#fbbf24] font-mono">{`# email`}</label>
                      <input 
                        type="email" 
                        name="email" 
                        required 
                        value={formState.email}
                        onChange={handleInputChange}
                        placeholder="Enter email" 
                        className="w-full bg-[#0c0c16]/80 border border-white/10 px-4 py-2.5 rounded-xl text-xs focus:border-[#fbbf24] transition-all outline-none font-mono text-white placeholder:text-gray-600" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#fbbf24] font-mono">{`# subject`}</label>
                    <input 
                      type="text" 
                      name="subject" 
                      required 
                      value={formState.subject}
                      onChange={handleInputChange}
                      placeholder="Enter subject" 
                      className="w-full bg-[#0c0c16]/80 border border-white/10 px-4 py-2.5 rounded-xl text-xs focus:border-[#fbbf24] transition-all outline-none font-mono text-white placeholder:text-gray-600" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#fbbf24] font-mono">{`# message`}</label>
                    <textarea 
                      name="message" 
                      required 
                      rows="4"
                      value={formState.message}
                      onChange={handleInputChange}
                      placeholder="Type details..." 
                      className="w-full bg-[#0c0c16]/80 border border-white/10 p-4 rounded-xl text-xs focus:border-[#fbbf24] transition-all outline-none font-mono text-white placeholder:text-gray-600 resize-none" 
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-between flex-wrap gap-4 border-t border-white/5">
                    <div className="flex gap-2">
                      {profile?.github_url && (
                        <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-[#fbbf24] hover:text-[#fbbf24] flex items-center justify-center text-gray-400 transition-all">
                          <FiGithub size={14} />
                        </a>
                      )}
                      {profile?.linkedin_url && (
                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-[#fbbf24] hover:text-[#fbbf24] flex items-center justify-center text-gray-400 transition-all">
                          <FiLinkedin size={14} />
                        </a>
                      )}
                      {profile?.twitter_url && (
                        <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-[#fbbf24] hover:text-[#fbbf24] flex items-center justify-center text-gray-400 transition-all">
                          <FiTwitter size={14} />
                        </a>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      disabled={formLoading}
                      className="px-6 py-2.5 rounded-xl bg-[#fbbf24] hover:bg-[#fbbf24]/80 disabled:opacity-50 text-[#0c0c16] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#fbbf24]/10 font-mono"
                    >
                      {formLoading ? 'dispatching...' : 'run --dispatch'} <FiSend />
                    </button>
                  </div>

                  <AnimatePresence>
                    {formSuccess && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[10px] text-green-400 font-mono mt-3 border border-green-500/20 bg-green-500/5 p-2 rounded-lg"
                      >
                        {`[SUCCESS] Node connection secure. Handshake message successfully dispatched.`}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </motion.div>
          </div>
        </section>

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

export default RoomTourPortfolioView;

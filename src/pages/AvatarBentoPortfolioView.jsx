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
  FiTerminal,
  FiCpu,
  FiUser,
  FiLayers
} from 'react-icons/fi';
import { fetchProfile } from '../services/profileService';
import { fetchProjects } from '../services/projectService';
import { fetchSkills } from '../services/skillService';
import { fetchExperiences } from '../services/cmsService';
import { fetchCertificates } from '../services/certificateService';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import CertificateModal from '../components/CertificateModal';
import LoadingSpinner from '../components/LoadingSpinner';

// --- 3D TILT CONTAINER ---
const TiltCard = ({ children, className = '', glowColor = 'rgba(6, 182, 212, 0.15)' }) => {
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
      className={`glass-morphism transition-all duration-300 rounded-[2rem] overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
};

// --- ORBITING MATH SOLVER ---
const Orbiter = ({ radius, speed, children, delay = 0 }) => {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed + delay;
    if (ref.current) {
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
      ref.current.position.y = Math.sin(t * 2) * 0.22;
      ref.current.rotation.y = t * 1.5;
    }
  });
  return <group ref={ref}>{children}</group>;
};

// --- PROCEDURAL 3D AVATAR BUST ---
const AvatarBust = () => {
  const { pointer } = useThree();
  const headRef = useRef();

  useFrame(() => {
    const targetRotY = pointer.x * 0.48;
    const targetRotX = -pointer.y * 0.32;

    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetRotY, 0.1);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetRotX, 0.1);
    }
  });

  return (
    <group position={[0, -0.6, 0]}>
      {/* Torso/Hoodie */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.45, 0.7, 16]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.7} />
      </mesh>
      
      {/* Collar */}
      <mesh position={[0, 0.55, 0]}>
        <torusGeometry args={[0.16, 0.04, 8, 24]} />
        <meshStandardMaterial color="#312e81" roughness={0.8} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.62, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.2]} />
        <meshStandardMaterial color="#ffd8c2" roughness={0.4} />
      </mesh>

      {/* Head (Tracks cursor) */}
      <group ref={headRef} position={[0, 0.82, 0]}>
        {/* Skull */}
        <mesh castShadow>
          <sphereGeometry args={[0.26, 32, 32]} />
          <meshStandardMaterial color="#ffd8c2" roughness={0.45} />
        </mesh>

        {/* Low-Poly Hair */}
        <group position={[0, 0.08, 0]}>
          <mesh position={[0, 0.18, 0.02]} castShadow>
            <sphereGeometry args={[0.2, 10, 10]} />
            <meshStandardMaterial color="#1a120b" roughness={0.85} flatShading />
          </mesh>
          <mesh position={[0.1, 0.14, -0.06]} castShadow>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshStandardMaterial color="#1a120b" roughness={0.85} flatShading />
          </mesh>
          <mesh position={[-0.1, 0.14, -0.06]} castShadow>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshStandardMaterial color="#1a120b" roughness={0.85} flatShading />
          </mesh>
        </group>

        {/* Eyes */}
        <mesh position={[-0.09, 0.02, 0.21]}>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshStandardMaterial color="#0b0f19" roughness={0.2} />
        </mesh>
        <mesh position={[0.09, 0.02, 0.21]}>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshStandardMaterial color="#0b0f19" roughness={0.2} />
        </mesh>

        {/* Glasses Frame with Glowing Cyan Rims */}
        <group position={[0, 0.02, 0.23]}>
          <mesh position={[-0.095, 0, 0]}>
            <torusGeometry args={[0.05, 0.008, 8, 24]} />
            <meshBasicMaterial color="#06b6d4" toneMapped={false} />
          </mesh>
          <mesh position={[0.095, 0, 0]}>
            <torusGeometry args={[0.05, 0.008, 8, 24]} />
            <meshBasicMaterial color="#06b6d4" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.09, 0.012, 0.01]} />
            <meshBasicMaterial color="#06b6d4" toneMapped={false} />
          </mesh>
        </group>

        {/* Nose */}
        <mesh position={[0, -0.04, 0.24]} rotation={[0.2, 0, 0]}>
          <coneGeometry args={[0.03, 0.08, 4]} />
          <meshStandardMaterial color="#ffd8c2" roughness={0.45} />
        </mesh>

        {/* Smile */}
        <mesh position={[0, -0.11, 0.21]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.05, 0.007, 4, 12, Math.PI]} />
          <meshStandardMaterial color="#fb7185" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
};

// --- ORBITING TECH SPHERES ---
const OrbitingSkills = () => {
  return (
    <group position={[0, 0.2, 0]}>
      {/* React: Cyan */}
      <Orbiter radius={0.72} speed={1.3} delay={0}>
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
          <mesh>
            <sphereGeometry args={[0.075, 16, 16]} />
            <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.8} />
          </mesh>
        </Float>
      </Orbiter>

      {/* Node.js: Green */}
      <Orbiter radius={0.82} speed={-0.95} delay={Math.PI / 1.5}>
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
          <mesh>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} />
          </mesh>
        </Float>
      </Orbiter>

      {/* JS: Indigo */}
      <Orbiter radius={0.78} speed={1.5} delay={Math.PI * 1.2}>
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
          <mesh>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.8} />
          </mesh>
        </Float>
      </Orbiter>
    </group>
  );
};

// --- MAIN BENTO VIEW COMPONENT ---
const AvatarBentoPortfolioView = () => {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);

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
        }
        setProjects(projRes.projects || []);
        setSkills(skillRes.skills || []);
        setExperiences(expRes.experiences || []);
        setCertificates(certRes.certificates || []);
      } catch (e) {
        console.error('Failed to load bento data:', e);
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

  if (loading) return <LoadingSpinner fullScreen message="Syncing Bento Matrix..." />;

  const statItems = [
    { value: projects.length > 0 ? `${projects.length}+` : '8+', label: 'Featured Builds', color: 'from-[#06b6d4] to-[#6366f1]' },
    { value: skills.length > 0 ? `${skills.length}+` : '15+', label: 'Tech Stack', color: 'from-[#6366f1] to-[#10b981]' },
    { value: '1', label: 'Hackathon Win', color: 'from-[#10b981] to-[#06b6d4]' }
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
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
      className="min-h-screen pt-28 pb-16 px-6 sm:px-8 relative overflow-hidden"
    >
      
      {/* Background Star Canvas */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Canvas className="w-full h-full">
          <Stars radius={100} depth={50} count={600} factor={4} saturation={0.5} fade speed={1.0} />
        </Canvas>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">
        
        {/* Header Title Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-800 pb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-[#06b6d4]">Bento Dashboard</span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase mt-1">
              SYSTEM PORTFOLIO
            </h1>
          </div>
          {resumeUrl && (
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-full bg-[#06b6d4] hover:bg-[#06b6d4]/80 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#06b6d4]/20">
              Download Resume <FiDownload />
            </a>
          )}
        </div>

        {/* Bento Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-12 gap-6"
        >
          
          {/* Card 1: User Profile (Left top) */}
          <motion.div variants={cardVariants} className="col-span-12 md:col-span-6 lg:col-span-4 min-h-[300px]">
            <TiltCard className="p-8 h-full border border-zinc-800 bg-[#121217]/50 flex flex-col justify-between" glowColor="rgba(6, 182, 212, 0.1)">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#06b6d4]/10 border border-[#06b6d4]/20 flex items-center justify-center text-[#06b6d4]">
                  <FiUser size={22} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">{safeName}</h3>
                  <p className="text-xs font-black text-[#06b6d4] tracking-widest uppercase mt-0.5">{profile?.role || 'Creative Web Architect'}</p>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                  {profile?.hero_description || 'I build modular full-stack structures, creative frontend animations, and immersive WebGL interfaces.'}
                </p>
              </div>

              {/* Social Icons */}
              <div className="flex gap-2.5 pt-6 border-t border-zinc-800/60 mt-6">
                {profile?.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-zinc-800/40 border border-zinc-700/50 hover:border-[#06b6d4] hover:text-[#06b6d4] flex items-center justify-center text-zinc-400 transition-all">
                    <FiGithub size={16} />
                  </a>
                )}
                {profile?.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-zinc-800/40 border border-zinc-700/50 hover:border-[#06b6d4] hover:text-[#06b6d4] flex items-center justify-center text-zinc-400 transition-all">
                    <FiLinkedin size={16} />
                  </a>
                )}
                {profile?.twitter_url && (
                  <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-zinc-800/40 border border-zinc-700/50 hover:border-[#06b6d4] hover:text-[#06b6d4] flex items-center justify-center text-zinc-400 transition-all">
                    <FiTwitter size={16} />
                  </a>
                )}
              </div>
            </TiltCard>
          </motion.div>

          {/* Card 2: Interactive 3D Avatar (Center top) */}
          <motion.div variants={cardVariants} className="col-span-12 md:col-span-6 lg:col-span-4 h-[300px] lg:h-auto">
            <div className="relative rounded-[2rem] overflow-hidden border border-zinc-800 bg-[#121217]/50 h-full">
              {/* WebGL Canvas */}
              <div className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing">
                <Suspense fallback={<div className="w-full h-full bg-[#121217]/60" />}>
                  <Canvas shadows gl={{ antialias: true }} className="w-full h-full">
                    <ambientLight intensity={0.4} />
                    <directionalLight position={[2, 5, 2]} intensity={2.0} color="#ffffff" castShadow />
                    <pointLight position={[-2, 1, 1]} intensity={4} color="#06b6d4" />
                    <pointLight position={[2, 1, 1]} intensity={4} color="#6366f1" />
                    
                    <AvatarBust />
                    <OrbitingSkills />
                    
                    <Environment preset="city" />
                  </Canvas>
                </Suspense>
              </div>

              {/* Float badge */}
              <div className="absolute top-6 left-6 z-10 bg-black/40 border border-zinc-800 px-3 py-1.5 rounded-xl pointer-events-none">
                <span className="text-[9px] font-black uppercase text-[#06b6d4] tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] animate-ping" /> INTERACTIVE HOLOGRAPH
                </span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Skill Circle Proficiency (Right top) */}
          <motion.div variants={cardVariants} className="col-span-12 md:col-span-6 lg:col-span-4 min-h-[300px]">
            <TiltCard className="p-8 h-full border border-zinc-800 bg-[#121217]/50 flex flex-col justify-between" glowColor="rgba(99, 102, 241, 0.1)">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center text-[#6366f1]">
                  <FiCpu size={22} />
                </div>
                <h4 className="text-lg font-black text-white uppercase tracking-tight">System Proficiency</h4>
              </div>

              <div className="space-y-3.5 pt-4 border-t border-zinc-800/60 mt-4 text-left">
                {categories.map(cat => (
                  <div key={cat} className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#06b6d4]">{cat}</span>
                    <div className="flex flex-wrap gap-1">
                      {displaySkills.filter(s => {
                        const mappedCat = s.category === 'Programming' ? 'Database' : s.category;
                        return mappedCat === cat;
                      }).slice(0, 4).map(sk => (
                        <span key={sk.name} className="px-2.5 py-0.5 rounded-md bg-zinc-800/60 border border-zinc-700/30 text-[10px] font-black text-zinc-300">
                          {sk.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TiltCard>
          </motion.div>

          {/* Card 4: Quick Metrics (Left middle) */}
          <motion.div variants={cardVariants} className="col-span-12 lg:col-span-4 grid grid-cols-3 lg:grid-cols-1 gap-4">
            {statItems.map((stat, idx) => (
              <div 
                key={idx}
                className="border border-zinc-800 bg-[#121217]/30 rounded-2xl p-6 text-center flex flex-col justify-center items-center hover:border-[#06b6d4]/30 transition-all duration-300"
              >
                <h3 className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-0.5`}>
                  {stat.value}
                </h3>
                <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Card 5: Experience Journey (Right middle) */}
          <motion.div variants={cardVariants} className="col-span-12 lg:col-span-8">
            <TiltCard className="p-8 border border-zinc-800 bg-[#121217]/50" glowColor="rgba(16, 185, 129, 0.08)">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                  <FiLayers size={18} />
                </div>
                <h4 className="text-lg font-black text-white uppercase tracking-tight">Timeline Logs</h4>
              </div>

              <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {displayExperiences.map((exp, idx) => (
                  <div key={exp.id || idx} className="flex items-start gap-3.5 border-l-2 border-zinc-800 pl-4 relative py-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] absolute -left-[6px] top-2" />
                    <div className="space-y-1">
                      <div className="flex justify-between items-center gap-2">
                        <h5 className="font-bold text-white text-xs">{exp.role}</h5>
                        <span className="text-[9px] text-[#10b981] font-mono">{exp.duration}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-semibold">{exp.company}</p>
                      <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TiltCard>
          </motion.div>

          {/* Card 6: Horizontal Projects list (Bottom row full width) */}
          <motion.div variants={cardVariants} className="col-span-12">
            <div className="p-8 border border-zinc-800 bg-[#121217]/50 rounded-[2rem] space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#06b6d4]/10 border border-[#06b6d4]/20 flex items-center justify-center text-[#06b6d4]">
                  <FiFolder size={18} />
                </div>
                <h4 className="text-lg font-black text-white uppercase tracking-tight">Milestone Projects</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayProjects.slice(0, 3).map((project, idx) => (
                  <div 
                    key={project.id || idx} 
                    className="p-6 border border-zinc-800 bg-zinc-900/35 rounded-2xl flex flex-col justify-between hover:border-[#06b6d4]/40 transition-colors"
                  >
                    <div className="space-y-3">
                      <h5 className="font-bold text-white text-sm">{project.title}</h5>
                      <p className="text-zinc-400 text-[11px] leading-relaxed font-medium line-clamp-3">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {project.tech_stack?.slice(0, 3).map(tech => (
                          <span key={tech} className="text-[8px] font-black text-[#06b6d4] bg-[#06b6d4]/5 border border-[#06b6d4]/10 px-2 py-0.5 rounded-md">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-800/80">
                      {project.deployed_link && (
                        <a href={project.deployed_link} className="px-3.5 py-1.5 rounded-lg bg-[#06b6d4] hover:bg-[#06b6d4]/80 text-white font-bold text-[9px] tracking-wider uppercase transition-all" target="_blank" rel="noopener noreferrer">
                          Demo
                        </a>
                      )}
                      {project.github_link && (
                        <a href={project.github_link} className="px-3.5 py-1.5 rounded-lg border border-zinc-800 text-zinc-300 font-bold text-[9px] tracking-wider uppercase hover:bg-zinc-800 transition-all flex items-center gap-1" target="_blank" rel="noopener noreferrer">
                          <FiGithub size={10} /> Source
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Card 7: Certificates (Left bottom) */}
          {certificates.length > 0 && (
            <motion.div variants={cardVariants} className="col-span-12 lg:col-span-6">
              <TiltCard className="p-8 border border-zinc-800 bg-[#121217]/50 h-full" glowColor="rgba(236, 72, 153, 0.1)">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#ec4899]/10 border border-[#ec4899]/20 flex items-center justify-center text-[#ec4899]">
                    <FiAward size={18} />
                  </div>
                  <h4 className="text-lg font-black text-white uppercase tracking-tight">Commendations</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {certificates.slice(0, 2).map((cert) => (
                    <div 
                      key={cert.id}
                      className="border border-zinc-800/60 bg-zinc-900/25 p-4 rounded-xl flex flex-col justify-between cursor-pointer hover:border-[#ec4899]/30 transition-all"
                      onClick={() => {
                        setSelectedCert(cert);
                        setModalOpen(true);
                      }}
                    >
                      <div className="space-y-2.5">
                        <h5 className="font-bold text-white text-xs line-clamp-1">{cert.title}</h5>
                        <p className="text-[9px] text-[#ec4899] font-semibold">{cert.issuer}</p>
                      </div>
                      <span className="text-[9px] text-zinc-500 font-medium mt-3 flex items-center gap-1">
                        <FiCalendar size={10} /> {cert.date}
                      </span>
                    </div>
                  ))}
                </div>
              </TiltCard>
            </motion.div>
          )}

          {/* Card 8: Console Contact Terminal (Right bottom) */}
          <motion.div variants={cardVariants} className={`col-span-12 ${certificates.length > 0 ? 'lg:col-span-6' : ''}`}>
            <div className="border border-zinc-800 bg-[#121217]/50 rounded-[2rem] overflow-hidden">
              <div className="bg-black/35 px-6 py-3 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#06b6d4] flex items-center gap-1.5 font-mono">
                  <FiTerminal /> bento-terminal.sh
                </span>
                <div className="w-10" />
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-[#06b6d4] font-mono">{`# name`}</label>
                    <input 
                      type="text" 
                      name="name" 
                      required 
                      value={formState.name}
                      onChange={handleInputChange}
                      placeholder="Input client name" 
                      className="w-full bg-[#0b0f19]/80 border border-zinc-800 px-4 py-2.5 rounded-xl text-xs focus:border-[#06b6d4] transition-all outline-none font-mono text-white placeholder:text-zinc-600" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-[#06b6d4] font-mono">{`# email`}</label>
                    <input 
                      type="email" 
                      name="email" 
                      required 
                      value={formState.email}
                      onChange={handleInputChange}
                      placeholder="Input email address" 
                      className="w-full bg-[#0b0f19]/80 border border-zinc-800 px-4 py-2.5 rounded-xl text-xs focus:border-[#06b6d4] transition-all outline-none font-mono text-white placeholder:text-zinc-600" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-[#06b6d4] font-mono">{`# message`}</label>
                  <textarea 
                    name="message" 
                    required 
                    rows="3"
                    value={formState.message}
                    onChange={handleInputChange}
                    placeholder="Input message buffer..." 
                    className="w-full bg-[#0b0f19]/80 border border-zinc-800 p-4 rounded-xl text-xs focus:border-[#06b6d4] transition-all outline-none font-mono text-white placeholder:text-zinc-600 resize-none" 
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-4">
                  <button 
                    type="submit" 
                    disabled={formLoading}
                    className="px-6 py-2.5 rounded-xl bg-[#06b6d4] hover:bg-[#06b6d4]/80 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#06b6d4]/10 font-mono"
                  >
                    {formLoading ? 'dispatching...' : 'run --dispatch'} <FiSend />
                  </button>

                  <AnimatePresence>
                    {formSuccess && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
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

        </motion.div>
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

export default AvatarBentoPortfolioView;

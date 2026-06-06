import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiChevronDown,
  FiCpu
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

// --- 3D TILT CARD COMPONENT ---
const TiltCard = ({ children, className = '', glowColor = 'rgba(236, 72, 153, 0.15)' }) => {
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

// --- THREE.JS BOKEH BUBBLES LAYER ---
const ParallaxCamera = () => {
  useFrame((state) => {
    // Mouse parallax view tilt
    const { x, y } = state.pointer;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, x * 1.5, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, y * 1.2, 0.05);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};

const InstagramHarshPortfolioView = () => {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);

  // Video Playback states
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showSoundBadge, setShowSoundBadge] = useState(true);

  // Form State
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const fgVideoRef = useRef(null);
  const bgVideoRef = useRef(null);

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
        console.error('Failed to load instagram harsh template data:', e);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // Sync foreground and background videos
  useEffect(() => {
    if (loading) return;

    const syncPlayback = () => {
      const fg = fgVideoRef.current;
      const bg = bgVideoRef.current;
      if (fg && bg) {
        bg.currentTime = fg.currentTime;
      }
    };

    const interval = setInterval(syncPlayback, 1000);

    // Auto-hide the sound tooltip badge after 4 seconds
    const badgeTimeout = setTimeout(() => {
      setShowSoundBadge(false);
    }, 4500);

    return () => {
      clearInterval(interval);
      clearTimeout(badgeTimeout);
    };
  }, [loading]);

  const handlePlayPause = () => {
    const fg = fgVideoRef.current;
    const bg = bgVideoRef.current;
    if (fg && bg) {
      if (isPlaying) {
        fg.pause();
        bg.pause();
        setIsPlaying(false);
      } else {
        fg.play().catch(() => {});
        bg.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const handleMuteUnmute = () => {
    const fg = fgVideoRef.current;
    if (fg) {
      fg.muted = !fg.muted;
      setIsMuted(fg.muted);
      setShowSoundBadge(false);
    }
  };

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

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading cinematic studio..." />;

  // Default Stats if empty
  const statItems = [
    { value: projects.length > 0 ? `${projects.length}+` : '8+', label: 'Projects Built', color: 'from-[#ec4899] to-[#a855f7]' },
    { value: skills.length > 0 ? `${skills.length}+` : '18+', label: 'Skills Mastered', color: 'from-[#a855f7] to-[#eab308]' },
    { value: '1', label: 'Hackathon Win', color: 'from-[#eab308] to-[#ec4899]' }
  ];

  // Default Skills if empty
  const defaultSkills = [
    { name: 'React', category: 'Frontend' },
    { name: 'Tailwind CSS', category: 'Frontend' },
    { name: 'Next.js', category: 'Frontend' },
    { name: 'JavaScript', category: 'Frontend' },
    { name: 'Three.js', category: 'Frontend' },
    { name: 'GSAP', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Express.js', category: 'Backend' },
    { name: 'Python', category: 'Backend' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'Supabase', category: 'Database' },
    { name: 'Git', category: 'Tools' },
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
      role: 'Creative Web Architect',
      duration: '2024 - Present',
      description: 'Crafting premium digital portfolios, 3D WebGL scenes, and high-fidelity video hero assets.'
    },
    {
      id: 'e2',
      company: 'Software Institute',
      role: 'B.S. in Computer Science',
      duration: '2021 - 2025',
      description: 'Acquired core competencies in software development, computational graphics, and database structures.'
    }
  ];

  const displayExperiences = experiences.length > 0 ? experiences : defaultExperiences;

  const nameParts = profile?.full_name ? profile.full_name.split(' ') : ["Ebinesar", "A"];
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || "A";

  return (
    <div 
      style={{ backgroundColor: 'var(--color-dark-950)', color: 'var(--color-text-primary)' }}
      className="min-h-screen selection:bg-purple-500/30 overflow-x-hidden relative"
    >
      
      {/* --- CINEMATIC VIDEO HERO SECTION --- */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden z-10" id="hero">
        
        {/* Background Blurred Ambient Video Layer */}
        <div className="absolute inset-0 z-0 bg-black pointer-events-none select-none">
          <video
            ref={bgVideoRef}
            src="/video_20260606_125053_edit.mp4"
            loop
            muted
            playsInline
            autoPlay
            className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-35 scale-110"
          />
        </div>

        {/* Ambient Overlay Vignettes */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/50 via-transparent to-[#050505] z-1" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/60 via-transparent to-black/60 z-1" />

        {/* Floating Particles WebGL Layer */}
        <div className="absolute inset-0 z-2 pointer-events-none">
          <Suspense fallback={null}>
            <Canvas dpr={[1, 2]} className="w-full h-full">
              <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
              <ParallaxCamera />
              <Sparkles count={100} scale={10} color="#fb923c" speed={1.2} size={5} />
              <Sparkles count={50} scale={8} color="#ffffff" speed={0.8} size={2.5} />
            </Canvas>
          </Suspense>
        </div>


        {/* Fullscreen Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-7xl mx-auto w-full px-6 sm:px-16 z-10 relative">
          
          {/* Left Block: Name Stack & Subtitles */}
          <div className="lg:col-span-6 text-left space-y-6 order-2 lg:order-1 pt-12 lg:pt-0">
            <motion.span 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-bold uppercase tracking-[0.3em] text-[#ec4899] block"
            >
              {profile?.role || "Software Developer"}
            </motion.span>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              {/* Stacked big names */}
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-white">
                {firstName}
              </h1>
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] bg-clip-text text-transparent bg-gradient-to-r from-[#ec4899] via-[#a855f7] to-[#eab308]">
                {lastName}
              </h1>

            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-lg font-medium"
            >
              {profile?.hero_title || "Building Scalable & Modern Web Applications"}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <button onClick={scrollToAbout} className="px-8 py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/35 transition-all">
                Enter Studio
              </button>
              {resumeUrl && (
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 rounded-full border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/5 transition-all flex items-center gap-2">
                  Download CV <FiDownload />
                </a>
              )}
            </motion.div>
          </div>

          {/* Right Block: Styled Video Frame */}
          <div className="lg:col-span-6 flex justify-center order-1 lg:order-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
              className="relative w-full max-w-[420px] aspect-[4/5] rounded-[2.5rem] border border-white/10 overflow-hidden bg-black shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
            >
              <video
                ref={fgVideoRef}
                src="/video_20260606_125053_edit.mp4"
                loop
                muted={isMuted}
                playsInline
                autoPlay
                className="w-full h-full object-cover"
              />

              {/* Floating Media Controls (Glassmorphism) */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-10">
                <button 
                  onClick={handlePlayPause}
                  className="w-12 h-12 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                  {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} className="ml-0.5" />}
                </button>
                <button 
                  onClick={handleMuteUnmute}
                  className="w-12 h-12 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                  aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                >
                  {isMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                </button>
              </div>

              {/* Mute Helper Tooltip */}
              <AnimatePresence>
                {showSoundBadge && isMuted && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onClick={handleMuteUnmute}
                    className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-lg hover:bg-purple-700 select-none animate-bounce"
                  >
                    Tap for sound 🔊
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

        </div>

        {/* Scroll Indicator */}
        <motion.div 
          onClick={scrollToAbout}
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] z-10 cursor-pointer hover:text-white transition-colors"
        >
          <span>Scroll to enter</span>
          <FiChevronDown size={14} />
        </motion.div>

      </section>

      {/* --- CONTENT SEGMENTS BELOW THE HERO --- */}
      <div 
        style={{ backgroundColor: 'var(--color-dark-950)' }}
        className="relative z-20 pt-24 pb-32 px-6 sm:px-12 md:px-24"
      >
        
        {/* ABOUT & TIMELINE TIMEFRAME */}
        <section className="max-w-7xl mx-auto mb-32" id="about">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-black uppercase mb-16 tracking-tight flex items-center gap-4 text-left"
          >
            <span className="text-[#ec4899]">01.</span> About & Timeline
          </motion.h2>

          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
          >
            {/* Bio Box */}
            <div className="lg:col-span-8">
              <TiltCard className="p-8 sm:p-12 h-full border border-white/5 bg-[#121212]/30 text-left flex flex-col justify-between" glowColor="rgba(236, 72, 153, 0.08)">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#a855f7]">
                      Professional Overview
                    </span>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-medium">
                      {profile?.hero_description || "I contribute to building critical, robust and responsive web applications with a focus on Frontend and Full Stack. My design systems bridge the gap between creative visual experiences and high-performance server structures."}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-8 space-y-6">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#eab308] mb-6">
                      Journey Chronology
                    </h4>
                    <div className="space-y-6">
                      {displayExperiences.map((exp, idx) => (
                        <div key={exp.id || idx} className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#ec4899] shrink-0 mt-1">
                            <FiBriefcase size={18} />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-md">{exp.role}</h4>
                            <p className="text-xs text-gray-400 font-semibold">{exp.company} ({exp.duration})</p>
                            <p className="text-xs text-gray-500 mt-2 leading-relaxed font-medium">{exp.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TiltCard>
            </div>

            {/* Vertical Stats column */}
            <div className="lg:col-span-4 flex flex-col gap-6 justify-between">
              {statItems.map((stat, idx) => (
                <TiltCard 
                  key={idx} 
                  className="py-10 px-6 border border-white/5 bg-[#121212]/30 text-center flex flex-col justify-center items-center flex-1 h-32" 
                  glowColor="rgba(168, 85, 247, 0.08)"
                >
                  <h3 className={`text-4xl sm:text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                    {stat.value}
                  </h3>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                </TiltCard>
              ))}
            </div>
          </motion.div>
        </section>

        {/* TECHNICAL STACK CATEGORIES */}
        <section className="max-w-7xl mx-auto mb-32" id="skills">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-black uppercase mb-16 tracking-tight flex items-center gap-4 text-left"
          >
            <span className="text-[#a855f7]">02.</span> Tech Stack
          </motion.h2>

          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left"
          >
            {categories.map((cat) => (
              <div key={cat} className="glass-morphism p-8 rounded-3xl border border-white/5 bg-[#121212]/20">
                <h4 className="text-xs font-black uppercase text-[#ec4899] tracking-[0.2em] mb-6 pb-2 border-b border-white/5 flex items-center gap-2">
                  <FiCpu size={14} className="text-[#ec4899] animate-pulse" /> {cat === 'Database' ? 'Database & Cloud' : cat}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {displaySkills.filter(s => {
                    const mappedCat = s.category === 'Programming' ? 'Database' : s.category;
                    return mappedCat === cat;
                  }).map(skill => (
                    <span 
                      key={skill.name} 
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:border-[#a855f7]/50 hover:bg-[#a855f7]/5 transition-all cursor-default"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* DYNAMIC PROJECTS GALLERY */}
        <section className="max-w-7xl mx-auto mb-32" id="projects">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-black uppercase mb-16 tracking-tight flex items-center gap-4 text-left"
          >
            <span className="text-[#eab308]">03.</span> Featured Works
          </motion.h2>

          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {displayProjects.map((project, idx) => (
              <TiltCard key={project.id || idx} className="p-8 border border-white/5 bg-[#121212]/30 flex flex-col justify-between" glowColor="rgba(234, 179, 8, 0.08)">
                <div className="space-y-6 text-left">
                  {/* Decorative Video/Project layout panel */}
                  <div className="relative aspect-[16/10] w-full rounded-2xl bg-gradient-to-br from-purple-950/20 to-black border border-white/5 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/[0.01] z-0" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#a855f7]/10 to-transparent pointer-events-none" />
                    <div className="relative z-10 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                        <FiFolder className="text-[#eab308]" size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xl font-bold text-white flex justify-between items-center">
                      {project.title}
                    </h4>
                    <p className="text-gray-400 text-xs leading-relaxed font-medium line-clamp-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {project.tech_stack?.map(tech => (
                        <span key={tech} className="text-[10px] font-bold text-[#ec4899] bg-[#ec4899]/5 border border-[#ec4899]/10 px-2.5 py-0.5 rounded-md">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5">
                  <div className="flex gap-3">
                    {project.deployed_link && (
                      <a href={project.deployed_link} className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] tracking-wider uppercase transition-all shadow-md" target="_blank" rel="noopener noreferrer">
                        Demo
                      </a>
                    )}
                    {project.github_link && (
                      <a href={project.github_link} className="px-5 py-2 rounded-xl border border-white/10 text-white font-bold text-[10px] tracking-wider uppercase hover:bg-white/5 transition-all flex items-center gap-1.5" target="_blank" rel="noopener noreferrer">
                        <FiGithub size={12} /> Source
                      </a>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Complete
                  </span>
                </div>
              </TiltCard>
            ))}
          </motion.div>
        </section>

        {/* CERTIFICATIONS LIST */}
        {certificates.length > 0 && (
          <section className="max-w-7xl mx-auto mb-32" id="certificates">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-5xl font-black uppercase mb-16 tracking-tight flex items-center gap-4 text-left"
            >
              <span className="text-[#ec4899]">04.</span> Achievements
            </motion.h2>

            <motion.div 
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {certificates.map((cert) => (
                <div 
                  key={cert.id}
                  className="glass-morphism border border-white/5 bg-[#121212]/30 p-6 rounded-3xl flex flex-col justify-between cursor-pointer text-left hover:border-[#ec4899]/30 transition-colors"
                  onClick={() => {
                    setSelectedCert(cert);
                    setModalOpen(true);
                  }}
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#ec4899]">
                      <FiAward size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm line-clamp-2">{cert.title}</h4>
                      <p className="text-xs text-[#a855f7] font-semibold mt-1">{cert.issuer}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                    <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5">
                      <FiCalendar /> {cert.date}
                    </span>
                    <span className="text-[10px] text-[#ec4899] font-bold uppercase tracking-wider hover:underline">
                      Verify
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </section>
        )}

        {/* CONTACT HANDSHAKE FORM */}
        <section className="max-w-4xl mx-auto" id="contact">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-black uppercase mb-16 tracking-tight text-center"
          >
            Get In Touch
          </motion.h2>

          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <TiltCard className="p-8 sm:p-12 border border-white/5 bg-[#121212]/30 text-left" glowColor="rgba(168, 85, 247, 0.15)">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Your Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      required 
                      value={formState.name}
                      onChange={handleInputChange}
                      placeholder="John Doe" 
                      className="w-full bg-[#050505]/60 border border-white/10 px-4 py-3 rounded-2xl text-sm focus:border-purple-500 transition-all outline-none font-medium text-white" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Your Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      required 
                      value={formState.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com" 
                      className="w-full bg-[#050505]/60 border border-white/10 px-4 py-3 rounded-2xl text-sm focus:border-purple-500 transition-all outline-none font-medium text-white" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Subject</label>
                  <input 
                    type="text" 
                    name="subject" 
                    required 
                    value={formState.subject}
                    onChange={handleInputChange}
                    placeholder="Inquiry" 
                    className="w-full bg-[#050505]/60 border border-white/10 px-4 py-3 rounded-2xl text-sm focus:border-purple-500 transition-all outline-none font-medium text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Message</label>
                  <textarea 
                    name="message" 
                    required 
                    rows="5"
                    value={formState.message}
                    onChange={handleInputChange}
                    placeholder="Hello Harsh..." 
                    className="w-full bg-[#050505]/60 border border-white/10 p-4 rounded-2xl text-sm focus:border-purple-500 transition-all outline-none font-medium text-white resize-none" 
                  />
                </div>

                <div className="pt-4 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex gap-3">
                    {profile?.github_url && (
                      <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500 hover:text-[#ec4899] flex items-center justify-center text-gray-400 transition-all">
                        <FiGithub size={18} />
                      </a>
                    )}
                    {profile?.linkedin_url && (
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500 hover:text-[#ec4899] flex items-center justify-center text-gray-400 transition-all">
                        <FiLinkedin size={18} />
                      </a>
                    )}
                    {profile?.twitter_url && (
                      <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500 hover:text-[#ec4899] flex items-center justify-center text-gray-400 transition-all">
                        <FiTwitter size={18} />
                      </a>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={formLoading}
                    className="px-8 py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-purple-600/35"
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
          </motion.div>
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

export default InstagramHarshPortfolioView;

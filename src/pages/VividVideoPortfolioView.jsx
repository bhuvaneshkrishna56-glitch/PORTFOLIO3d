import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiGithub, 
  FiLinkedin, 
  FiInstagram, 
  FiTwitter, 
  FiArrowRight, 
  FiDownload, 
  FiCheckCircle, 
  FiBriefcase, 
  FiZap, 
  FiFolder, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiAward, 
  FiSend, 
  FiStar,
  FiVolume2,
  FiVolumeX 
} from 'react-icons/fi';
import { fetchProfile } from '../services/profileService';
import { fetchProjects } from '../services/projectService';
import { fetchSkills } from '../services/skillService';
import { fetchExperiences } from '../services/cmsService';
import { fetchCertificates } from '../services/certificateService';
import CertificateModal from '../components/CertificateModal';
import LoadingSpinner from '../components/LoadingSpinner';

// --- 3D TILT HOVER EFFECT COMPONENT ---
const TiltCard = ({ children, className = '', glowColor = 'rgba(236, 72, 153, 0.2)' }) => {
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

  const rotateX = isHovering ? -coords.y * 12 : 0;
  const rotateY = isHovering ? coords.x * 12 : 0;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${isHovering ? 1.02 : 1}, ${isHovering ? 1.02 : 1}, 1)`,
        transition: isHovering ? 'none' : 'transform 0.5s ease',
        transformStyle: 'preserve-3d',
        boxShadow: isHovering ? `0 0 35px ${glowColor}` : 'none'
      }}
      className={`glass-morphism transition-all duration-300 rounded-[2.5rem] overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
};

const VividVideoPortfolioView = () => {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);
  const videoRef = useRef(null);

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
        console.error('Failed to load vivid video template data:', e);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // Video visibility scroll observer & playback handler
  useEffect(() => {
    if (!videoRef.current) return;

    // Autoplay trigger
    const playVideo = () => {
      if (videoRef.current) {
        videoRef.current.play().catch(err => {
          console.log("Playback failed:", err);
        });
      }
    };

    // Attempt autoplay immediately
    const playPromise = videoRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log("Autoplay blocked, registering listener to play on user interaction:", error);
        // Fallback: play on first user click or touch start
        const forcePlay = () => {
          playVideo();
          document.removeEventListener('click', forcePlay);
          document.removeEventListener('touchstart', forcePlay);
        };
        document.addEventListener('click', forcePlay);
        document.addEventListener('touchstart', forcePlay);
      });
    }

    // Scroll Observer: pause video when scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (videoRef.current) {
          if (entry.isIntersecting) {
            // Hero section is visible: play/resume
            videoRef.current.play().catch(err => {
              console.log("Resuming playback on intersection failed:", err);
            });
          } else {
            // Hero section scrolled out of view: pause
            videoRef.current.pause();
          }
        }
      },
      { threshold: 0.15 }
    );

    const heroSection = document.getElementById('hero');
    if (heroSection) {
      observer.observe(heroSection);
    }

    return () => {
      if (heroSection) {
        observer.unobserve(heroSection);
      }
    };
  }, [loading]);

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

  if (loading) return <LoadingSpinner fullScreen message="Loading Vivid Video workspace..." />;

  // Default Stats if empty
  const statItems = [
    { value: projects.length > 0 ? `${projects.length}+` : '12+', label: 'Projects Completed', color: 'from-pink-500 to-purple-500' },
    { value: skills.length > 0 ? `${skills.length}+` : '16+', label: 'Skills Mastered', color: 'from-purple-500 to-cyan-500' },
    { value: '1', label: 'Hackathon Won', color: 'from-pink-500 to-rose-500' },
    { value: '2+', label: 'Active Years', color: 'from-emerald-500 to-teal-500' }
  ];

  // Default Skills if empty
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

  // Default Projects if empty
  const defaultProjects = [
    {
      id: 'p1',
      title: 'AI Smart Dashboard',
      description: 'A futuristic analytics dashboard utilizing advanced AI tools to parse real-time logs and suggest performance enhancements with a gorgeous glassmorphic interface.',
      tech_stack: ['React', 'Tailwind', 'AI', 'Node.js'],
      github_link: '#',
      deployed_link: '#'
    },
    {
      id: 'p2',
      title: 'Cinematic 3D Engine',
      description: 'An interactive 3D website engine constructed with React Three Fiber, allowing smooth parallax scrolling, custom lighting controls, and dynamic canvas rendering.',
      tech_stack: ['Three.js', 'React', 'R3F', 'Framer Motion'],
      github_link: '#',
      deployed_link: '#'
    },
    {
      id: 'p3',
      title: 'Collaborative Dev Workspace',
      description: 'A live collaborative text editor and terminal sharing workspace for remote teams, running fully on Supabase Realtime and socket connections.',
      tech_stack: ['React', 'Supabase', 'Express', 'Tailwind'],
      github_link: '#',
      deployed_link: '#'
    }
  ];

  const displayProjects = projects.length > 0 ? projects : defaultProjects;

  // Default Experiences if empty
  const defaultExperiences = [
    {
      id: 'e1',
      company: 'Tech Innovations Lab',
      role: 'Full Stack Development Intern',
      duration: 'May 2025 - Present',
      description: 'Developing high-performance user interfaces and building scalable Node.js microservices. Integrated advanced AI features into the company’s analytical tools.',
      achievements: ['Improved rendering speed by 30%', 'Integrated real-time chat utilizing Supabase']
    },
    {
      id: 'e2',
      company: 'Metaverse Dev Studio',
      role: 'Frontend Developer Intern',
      duration: 'Jan 2025 - Apr 2025',
      description: 'Assisted in building immersive web spaces using Three.js and webXR. Authored robust components in React and optimized Tailwind styles.',
      achievements: ['Developed custom 3D model loaders', 'Shipped 5 client websites']
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
      className="min-h-screen selection:bg-pink-500/30 overflow-x-hidden relative"
    >
      
      {/* BACKGROUND NEON GLOW DECORATIONS */}
      <div className="absolute top-[15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-pink-600/10 blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[45%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[8%] left-[10%] w-[500px] h-[500px] rounded-full bg-cyan-600/5 blur-[120px] pointer-events-none z-0" />

      {/* HERO SECTION */}
      <section className="relative min-h-screen md:h-screen w-full flex flex-col md:flex-row items-center justify-between px-6 sm:px-16 overflow-hidden pt-28 pb-16 md:pt-20 md:pb-0" id="hero">
        
        {/* Centered video background card */}
        <div className="w-full md:absolute md:inset-0 flex items-center justify-center z-0 order-1 md:order-none my-8 md:my-0 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="w-full max-w-[280px] sm:max-w-[340px] md:max-w-[380px] aspect-[4/5] relative pointer-events-auto"
          >
            {/* Pink-purple glow aura behind the video */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500 rounded-[2.6rem] opacity-35 blur-2xl animate-pulse" />
            
            <TiltCard 
              className="w-full h-full bg-dark-900/60 border border-white/10 p-2 shadow-[0_0_50px_rgba(236,72,153,0.35)] flex items-center justify-center relative pointer-events-auto"
              glowColor="rgba(236, 72, 153, 0.35)"
            >
              <video
                ref={videoRef}
                src="/video_20260606_125053_edit.mp4"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                preload="auto"
                className="w-full h-full object-cover rounded-[2.1rem] filter saturate-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
              
              {/* Floating Mute/Unmute Toggle */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const nextMuted = !isMuted;
                  setIsMuted(nextMuted);
                  if (videoRef.current) {
                    videoRef.current.muted = nextMuted;
                  }
                }}
                className="absolute bottom-6 right-6 p-3 rounded-full bg-black/60 hover:bg-black/85 border border-white/10 text-white transition-all pointer-events-auto flex items-center justify-center z-20 shadow-lg"
                title={isMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {isMuted ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
              </button>
            </TiltCard>
          </motion.div>
        </div>

        {/* Left Side Social Column */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden md:flex flex-col gap-6 items-center z-10 p-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
        >
          {socialLinks.map((link, idx) => (
            <motion.a 
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-pink-400 transition-colors p-2 hover:bg-white/5 rounded-full"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              title={link.label}
            >
              {link.icon}
            </motion.a>
          ))}
        </motion.div>

        {/* Right Side Hero Text */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-right z-10 max-w-sm lg:max-w-md xl:max-w-lg pr-4 md:pr-10 hidden md:block"
        >
          <h2 className="text-xl font-bold uppercase tracking-[0.3em] text-cyan-400 mb-2">
            {profile?.role || "Full Stack Developer"}
          </h2>
          <h1 className="text-5xl lg:text-6xl font-black uppercase tracking-tight text-white mb-2 leading-none">
            {profile?.full_name || "Ebinesar A"}
          </h1>
          <h1 className="text-xl lg:text-2xl font-bold uppercase bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500 leading-tight">
            {profile?.hero_title || "Building Scalable & Modern Web Applications"}
          </h1>
          <p className="text-gray-400 mt-6 text-sm max-w-sm ml-auto leading-relaxed">
            {profile?.hero_description || "I specialize in constructing scaleable, robust web applications with a focus on immersive interactive experiences and responsive user interfaces."}
          </p>
          <motion.div className="mt-8 flex justify-end gap-4">
            <a href="#about" className="px-6 py-2.5 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700 transition-all text-sm shadow-lg shadow-pink-600/30">
              Explore Portfolio
            </a>
            <a href="#contact" className="px-6 py-2.5 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all text-sm">
              Get In Touch
            </a>
          </motion.div>
        </motion.div>

        {/* Mobile View Hero Elements */}
        <div className="md:hidden flex flex-col items-center text-center w-full z-10 order-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 p-6 rounded-[2rem] border border-white/10 backdrop-blur-lg w-full max-w-md shadow-2xl"
          >
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 mb-1">
              {profile?.role || "Full Stack Developer"}
            </h2>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white">
              {profile?.full_name || 'Ebinesar A'}
            </h1>
            <p className="text-pink-400 text-[10px] font-bold uppercase tracking-wider mt-1 px-4">
              {profile?.hero_title || "Building Scalable & Modern Web Applications"}
            </p>
            <p className="text-gray-400 text-xs px-4 mt-2 leading-relaxed">
              {profile?.hero_description || "I specialize in constructing scaleable, robust web applications."}
            </p>
            <div className="flex gap-4 mt-6 justify-center">
              {socialLinks.map((link, idx) => (
                <a key={idx} href={link.url} className="text-gray-400 hover:text-pink-400 p-1" target="_blank" rel="noopener noreferrer">{link.icon}</a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-24 px-6 sm:px-16 max-w-7xl mx-auto relative z-10" id="about">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-left mb-16 space-y-2"
        >
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-pink-400">01. Narrative</h2>
          <h3 className="text-4xl font-extrabold uppercase tracking-tight">About Me</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
        >
          {/* Main Biography Card */}
          <div className="lg:col-span-8">
            <TiltCard className="p-10 h-full border border-white/5 bg-dark-900/50 flex flex-col justify-between" glowColor="rgba(139, 92, 246, 0.08)">
              <div className="space-y-8 text-left">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400">Career Objective</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {profile?.hero_description || "I am a dedicated developer focused on building scalable frontend and backend infrastructures. I specialize in merging robust backend engineering with immersive interactive web graphics using React and modern frameworks."}
                  </p>
                </div>

                <div className="border-t border-white/5 pt-8 space-y-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Education Details</h4>
                  <div className="border-l border-white/10 pl-6 space-y-6">
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-pink-500 border-4 border-[#030206]" />
                      <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">2021 - 2025</span>
                      <h5 className="font-bold text-white text-md mt-1">Bachelor of Engineering in Computer Science</h5>
                      <p className="text-gray-400 text-xs mt-1">Acquired core knowledge in software development, data structures, algorithms, and immersive interactive graphics.</p>
                    </div>
                  </div>
                </div>
              </div>
              {resumeUrl && (
                <div className="pt-8">
                  <a 
                    href={resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all text-xs uppercase tracking-widest"
                  >
                    <FiDownload /> Download Resume
                  </a>
                </div>
              )}
            </TiltCard>
          </div>

          {/* Statistics Column */}
          <div className="lg:col-span-4 flex flex-col gap-6 justify-between">
            {statItems.map((stat, idx) => (
              <TiltCard key={idx} className="py-8 px-6 border border-white/5 bg-dark-900/40 text-center flex flex-col justify-center items-center flex-1 h-28" glowColor="rgba(59, 130, 246, 0.15)">
                <h3 className={`text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                  {stat.value}
                </h3>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
              </TiltCard>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SKILLS SECTION */}
      <section className="py-24 px-6 sm:px-16 max-w-7xl mx-auto relative z-10" id="skills">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-left mb-16 space-y-2"
        >
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-pink-400">02. Stack</h2>
          <h3 className="text-4xl font-extrabold uppercase tracking-tight">Technical Arsenal</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left"
        >
          {categories.map((cat) => (
            <TiltCard key={cat} className="p-8 border border-white/5 bg-dark-900/40 flex flex-col justify-between" glowColor="rgba(6, 182, 212, 0.1)">
              <div>
                <h4 className="text-xs font-black uppercase text-pink-400 tracking-[0.2em] mb-6 pb-2 border-b border-white/5 flex items-center gap-1.5">
                  <FiStar size={12} className="text-pink-400 animate-pulse" /> {cat === 'Database' ? 'Database & Cloud' : cat}
                </h4>
                <div className="space-y-4">
                  {displaySkills.filter(s => {
                    const mappedCat = s.category === 'Programming' ? 'Database' : s.category;
                    return mappedCat === cat;
                  }).map(skill => (
                    <div key={skill.name} className="flex items-center gap-3">
                      <FiCheckCircle className="text-cyan-400 shrink-0" size={14} />
                      <span className="text-sm font-semibold text-gray-300">{skill.name}</span>
                    </div>
                  ))}
                  {displaySkills.filter(s => {
                    const mappedCat = s.category === 'Programming' ? 'Database' : s.category;
                    return mappedCat === cat;
                  }).length === 0 && (
                    <p className="text-xs text-gray-500 italic">No skills listed</p>
                  )}
                </div>
              </div>
            </TiltCard>
          ))}
        </motion.div>
      </section>

      {/* FEATURED WORKS SECTION */}
      <section className="py-24 px-6 sm:px-16 max-w-7xl mx-auto relative z-10" id="projects">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-left mb-16 space-y-2"
        >
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-pink-400">03. Works</h2>
          <h3 className="text-4xl font-extrabold uppercase tracking-tight">Featured Projects</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {displayProjects.map((project) => (
            <TiltCard key={project.id} className="p-8 border border-white/5 bg-dark-900/40 flex flex-col justify-between" glowColor="rgba(236, 72, 153, 0.1)">
              <div className="space-y-6 text-left">
                <div className="w-12 h-12 rounded-2xl bg-pink-600/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <FiFolder size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">{project.title}</h4>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-4">
                    {project.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {(project.tech_stack || project.techStack || []).map(tag => (
                    <span key={tag} className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-white/5 text-gray-300 border border-white/5 uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5">
                <div className="flex gap-4">
                  {project.github_link && (
                    <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="View Source">
                      <FiGithub size={18} />
                    </a>
                  )}
                  {project.deployed_link && (
                    <a href={project.deployed_link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors" title="Live Demo">
                      <FiArrowRight size={18} />
                    </a>
                  )}
                </div>
                <span className="text-[10px] text-pink-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  <FiZap className="text-yellow-400 animate-pulse" size={10} /> Active Demo
                </span>
              </div>
            </TiltCard>
          ))}
        </motion.div>
      </section>

      {/* CERTIFICATES SECTION */}
      <section className="py-24 px-6 sm:px-16 max-w-7xl mx-auto relative z-10 animate-fade-in" id="certificates">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-left mb-16 space-y-2"
        >
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-pink-400">04. Achievements</h2>
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
                className="cursor-pointer animate-hover"
              >
                <TiltCard className="p-6 border border-white/5 bg-dark-900/40 h-full flex flex-col justify-between" glowColor="rgba(6, 182, 212, 0.15)">
                  <div className="space-y-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <FiAward size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm line-clamp-2">{cert.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{cert.issuer}</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    <span>{cert.date}</span>
                    <span className="text-pink-400 hover:text-pink-300 transition-colors">View Preview →</span>
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

      {/* EXPERIENCE SECTION */}
      <section className="py-24 px-6 sm:px-16 max-w-4xl mx-auto relative z-10" id="experience">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 space-y-2"
        >
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-pink-400">05. Timeline</h2>
          <h3 className="text-4xl font-extrabold uppercase tracking-tight">Experience</h3>
        </motion.div>

        <div className="relative border-l border-white/10 pl-8 space-y-12">
          {displayExperiences.map((exp, idx) => (
            <motion.div 
              key={exp.id}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-dark-900 border-2 border-pink-500 flex items-center justify-center shadow-[0_0_12px_rgba(236,72,153,0.4)]">
                <FiBriefcase className="text-pink-400" size={10} />
              </div>

              <TiltCard className="p-8 border border-white/5 bg-dark-900/40 text-left" glowColor="rgba(139, 92, 246, 0.08)">
                <span className="text-xs text-pink-400 font-bold uppercase tracking-wider">{exp.duration}</span>
                <h4 className="text-xl font-bold mt-1 text-white">{exp.role}</h4>
                <h5 className="text-cyan-400 font-medium text-sm mb-4">{exp.company}</h5>
                <p className="text-gray-400 text-xs leading-relaxed mb-6">
                  {exp.description}
                </p>

                {exp.achievements && exp.achievements.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Key Achievements</p>
                    {exp.achievements.map((ach, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-300 font-medium">
                        <FiStar className="text-yellow-400 shrink-0" size={10} />
                        {ach}
                      </div>
                    ))}
                  </div>
                )}
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="py-24 px-6 sm:px-16 max-w-7xl mx-auto relative z-10" id="contact">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-2"
        >
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-pink-400">05. Connection</h2>
          <h3 className="text-4xl font-extrabold uppercase tracking-tight">Get In Touch</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-8"
        >
          {/* Contact Details Sidebar */}
          <div className="lg:col-span-2 space-y-6 text-left">
            <TiltCard className="p-8 border border-white/5 bg-dark-900/40 space-y-6" glowColor="rgba(59, 130, 246, 0.1)">
              <h4 className="text-xl font-bold border-b border-white/5 pb-3">Contact Information</h4>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-pink-600/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                  <FiMail size={16} />
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-500 font-bold">Email Me</p>
                  <p className="text-sm font-bold text-gray-300">{profile?.email || 'contact@example.com'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <FiPhone size={16} />
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-500 font-bold">Call Me</p>
                  <p className="text-sm font-bold text-gray-300">{profile?.phone || '+91 9876543210'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <FiMapPin size={16} />
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-500 font-bold">Location</p>
                  <p className="text-sm font-bold text-gray-300">{profile?.location || 'India'}</p>
                </div>
              </div>
            </TiltCard>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <TiltCard className="p-10 border border-white/5 bg-dark-900/40" glowColor="rgba(236, 72, 153, 0.1)">
              <form onSubmit={handleFormSubmit} className="space-y-6 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Name</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formState.name}
                      onChange={handleInputChange}
                      placeholder="Your Name" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm outline-none focus:border-pink-500 transition-all text-white placeholder-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formState.email}
                      onChange={handleInputChange}
                      placeholder="Your Email" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm outline-none focus:border-pink-500 transition-all text-white placeholder-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Subject</label>
                  <input 
                    type="text" 
                    name="subject"
                    required
                    value={formState.subject}
                    onChange={handleInputChange}
                    placeholder="Project Inquiry" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm outline-none focus:border-pink-500 transition-all text-white placeholder-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Message</label>
                  <textarea 
                    name="message"
                    required
                    rows="5"
                    value={formState.message}
                    onChange={handleInputChange}
                    placeholder="How can we collaborate?" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm outline-none focus:border-pink-500 transition-all text-white placeholder-gray-600 resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={formLoading}
                  className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider disabled:opacity-50"
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
          </div>
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

export default VividVideoPortfolioView;

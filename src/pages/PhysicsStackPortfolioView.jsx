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
  FiCpu,
  FiTerminal,
  FiPlus
} from 'react-icons/fi';
import { fetchProfile } from '../services/profileService';
import { fetchProjects } from '../services/projectService';
import { fetchSkills } from '../services/skillService';
import { fetchExperiences } from '../services/cmsService';
import { fetchCertificates } from '../services/certificateService';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Sparkles, Stars, Center } from '@react-three/drei';
import * as THREE from 'three';
import CertificateModal from '../components/CertificateModal';
import LoadingSpinner from '../components/LoadingSpinner';

// --- 3D TILT HOVER CONTAINER ---
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

// --- FLAT AVATAR cursor follow ---
const AvatarCore = () => {
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

    // Gentle cursor tracking tilt
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, x * 0.35, 0.08);
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -y * 0.25, 0.08);

    // Subtle float translation
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, x * 0.5, 0.08);
    ref.current.position.y = THREE.MathUtils.lerp(
      ref.current.position.y,
      -0.5 - y * 0.3 + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.12,
      0.08
    );
  });

  if (!texture) return null;

  return (
    <group>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <spotLight position={[0, 8, 4]} angle={0.6} penumbra={1} intensity={12} color="#ec4899" />
      <pointLight position={[0, 0, -2]} intensity={15} distance={8} color="#06b6d4" />
      <Sparkles count={80} scale={6} color="#ec4899" speed={1} size={2.5} />
      <mesh ref={ref} position={[0, -0.5, 0]}>
        <planeGeometry args={[4.2 * aspectRatio, 4.2]} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>
    </group>
  );
};

// --- PHYSICS SPHERE SOLVER COMPONENT ---
const SingleBallMesh = ({ data }) => {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(data.position);
    }
  });

  return (
    <mesh ref={meshRef} position={data.position}>
      <sphereGeometry args={[data.radius, 32, 32]} />
      <meshStandardMaterial 
        color={data.color}
        emissive={data.color}
        emissiveIntensity={0.8}
        roughness={0.1}
        metalness={0.9}
      />
    </mesh>
  );
};

const PhysicsSimulatorScene = ({ ballsList, ballsRef, mouseSphereRef }) => {
  const gravity = -9.8;
  const floorY = -2.2;
  const wallX = 3.5;
  const wallZ = 2.0;
  const restitution = 0.6; // bounciness
  const friction = 0.985;

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.03);
    const list = ballsRef.current;
    const { x, y } = state.pointer;
    
    // Map R3F pointer coordinates to 3D world space coordinates
    mouseSphereRef.current.position.set(x * 3.8, y * 2.5, 0);

    // 1. Apply Gravity, Friction & Boundary Collisions
    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      b.velocity.y += gravity * dt;
      b.position.addScaledVector(b.velocity, dt);

      // Damp velocities
      b.velocity.multiplyScalar(friction);

      // Floor Collision
      if (b.position.y - b.radius < floorY) {
        b.position.y = floorY + b.radius;
        b.velocity.y = -b.velocity.y * restitution;
        b.velocity.x *= 0.95;
        b.velocity.z *= 0.95;
      }

      // Walls Collision (X axis)
      if (b.position.x - b.radius < -wallX) {
        b.position.x = -wallX + b.radius;
        b.velocity.x = -b.velocity.x * restitution;
      } else if (b.position.x + b.radius > wallX) {
        b.position.x = wallX - b.radius;
        b.velocity.x = -b.velocity.x * restitution;
      }

      // Walls Collision (Z axis)
      if (b.position.z - b.radius < -wallZ) {
        b.position.z = -wallZ + b.radius;
        b.velocity.z = -b.velocity.z * restitution;
      } else if (b.position.z + b.radius > wallZ) {
        b.position.z = wallZ - b.radius;
        b.velocity.z = -b.velocity.z * restitution;
      }
    }

    // 2. Mouse Sphere Interaction
    const mouseSphere = mouseSphereRef.current;
    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      const diff = b.position.clone().sub(mouseSphere.position);
      const dist = diff.length();
      const minDist = b.radius + mouseSphere.radius;

      if (dist < minDist) {
        const normal = diff.clone().normalize();
        const overlap = minDist - dist;
        b.position.addScaledVector(normal, overlap);
        b.velocity.addScaledVector(normal, 3.5);
      }
    }

    // 3. Sphere-to-Sphere Elastic Collisions
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const b1 = list[i];
        const b2 = list[j];

        const diff = b2.position.clone().sub(b1.position);
        const dist = diff.length();
        const minDist = b1.radius + b2.radius;

        if (dist < minDist) {
          const normal = diff.clone().normalize();
          const overlap = minDist - dist;

          // Push them apart
          b1.position.addScaledVector(normal, -overlap * 0.5);
          b2.position.addScaledVector(normal, overlap * 0.5);

          // Relative velocity along normal
          const relVel = b2.velocity.clone().sub(b1.velocity);
          const velAlongNormal = relVel.dot(normal);

          if (velAlongNormal < 0) {
            const impulseScalar = -(1 + restitution) * velAlongNormal / 2;
            b1.velocity.addScaledVector(normal, -impulseScalar);
            b2.velocity.addScaledVector(normal, impulseScalar);
          }
        }
      }
    }
  });

  return (
    <group>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-4, 3, 2]} intensity={15} color="#ec4899" distance={15} />
      <pointLight position={[4, -3, 2]} intensity={12} color="#06b6d4" distance={15} />

      {/* Render spheres */}
      {ballsList.map((ball) => (
        <SingleBallMesh key={ball.id} data={ball} />
      ))}

      {/* Virtual Mouse Follow Mesh representation */}
      <mesh ref={useRef()} position={[0,0,0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08} wireframe />
      </mesh>

      <Sparkles count={60} scale={6} color="#06b6d4" speed={1.2} size={3} />
      <Stars radius={100} depth={50} count={300} factor={4} saturation={0.5} fade speed={1} />
    </group>
  );
};

const PhysicsStackPortfolioView = () => {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);

  // Physics list state
  const [ballsList, setBallsList] = useState([]);
  const ballsRef = useRef([]);
  const mouseSphereRef = useRef({ position: new THREE.Vector3(), radius: 0.4 });
  const indexCounterRef = useRef(0);

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
        console.error('Failed to load physics stack template data:', e);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // Initialize skills spheres when skills are loaded
  useEffect(() => {
    if (loading || displaySkills.length === 0) return;

    const colors = ['#ec4899', '#06b6d4', '#10b981', '#fb923c', '#a855f7', '#fbbf24'];
    const initialBalls = displaySkills.map((sk, idx) => {
      indexCounterRef.current += 1;
      return {
        id: `sk-${indexCounterRef.current}`,
        name: sk.name,
        color: colors[idx % colors.length],
        radius: 0.23,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          2.0 + idx * 0.4,
          (Math.random() - 0.5) * 1.5
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          -1 - Math.random() * 2,
          (Math.random() - 0.5) * 2
        )
      };
    });

    ballsRef.current = initialBalls;
    setBallsList(initialBalls);
  }, [loading, displaySkills]);

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

  // Click Canvas handler to spawn more balls
  const handleCanvasClick = () => {
    const colors = ['#ec4899', '#06b6d4', '#10b981', '#fb923c', '#a855f7', '#fbbf24'];
    indexCounterRef.current += 1;
    const newBall = {
      id: `spawned-${indexCounterRef.current}`,
      name: 'Bonus',
      color: colors[Math.floor(Math.random() * colors.length)],
      radius: 0.23,
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        3.0,
        (Math.random() - 0.5) * 1.5
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        -2,
        (Math.random() - 0.5) * 2
      )
    };
    ballsRef.current.push(newBall);
    setBallsList([...ballsRef.current]);
  };

  if (loading) return <LoadingSpinner fullScreen message="Assembling Physics Workspace..." />;

  // Default Stats if empty
  const statItems = [
    { value: projects.length > 0 ? `${projects.length}+` : '8+', label: 'Developments', color: 'from-[#ec4899] to-[#06b6d4]' },
    { value: skills.length > 0 ? `${skills.length}+` : '15+', label: 'Technologies', color: 'from-[#06b6d4] to-[#10b981]' },
    { value: '1', label: 'Hackathon Win', color: 'from-[#10b981] to-[#ec4899]' }
  ];

  // Default Experiences if empty
  const defaultExperiences = [
    {
      id: 'e1',
      company: 'Build With Satya',
      role: 'Creative Developer',
      duration: '2024 - Present',
      description: 'Engineering interactive physics models, ReadyPlayerMe integrations, and low-poly 3D WebGL modules.'
    },
    {
      id: 'e2',
      company: 'Digital Systems Inc.',
      role: 'Frontend Intern',
      duration: '2022 - 2024',
      description: 'Worked on React web layouts, performance optimization, and custom component scripting.'
    }
  ];

  const displayExperiences = experiences.length > 0 ? experiences : defaultExperiences;

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
      className="min-h-screen selection:bg-[#ec4899]/30 overflow-x-hidden relative"
    >
      
      {/* Decorative floating grids */}
      <div className="absolute top-[20%] left-[-15%] w-[600px] h-[600px] rounded-full bg-[#ec4899]/3 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[65%] right-[-15%] w-[600px] h-[600px] rounded-full bg-[#06b6d4]/3 blur-[120px] pointer-events-none z-0" />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen w-full flex items-center justify-center px-6 sm:px-16 overflow-hidden pt-28 pb-16" id="hero">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-7xl mx-auto w-full z-10">
          
          {/* Left Text elements */}
          <div className="lg:col-span-7 space-y-6 text-left order-2 lg:order-1">
            <motion.span 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-bold uppercase tracking-[0.25em] text-[#ec4899] block"
            >
              {profile?.role || "Creative Developer"}
            </motion.span>

            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-1"
            >
              <h1 className="text-4xl sm:text-6xl font-black uppercase leading-none tracking-tight text-white">
                {safeName}
              </h1>
              <h2 className="text-2xl sm:text-4xl font-extrabold uppercase leading-tight bg-gradient-to-r from-[#ec4899] via-[#06b6d4] to-[#10b981] bg-clip-text text-transparent">
                {profile?.hero_title || "Building Scalable & Modern Web Applications"}
              </h2>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-sm max-w-xl leading-relaxed font-medium"
            >
              {profile?.hero_description || "I specialize in constructing scaleable, robust web applications with a focus on immersive interactive experiences and responsive user interfaces."}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-4 flex flex-wrap gap-4"
            >
              <a href="#skills" className="px-8 py-3.5 rounded-full bg-[#ec4899] hover:bg-[#ec4899]/80 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#ec4899]/25">
                Play Tech-Physics
              </a>
              {resumeUrl && (
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 rounded-full border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/5 transition-all flex items-center gap-2">
                  Download Resume <FiDownload />
                </a>
              )}
            </motion.div>
          </div>

          {/* Right Avatar Scene */}
          <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
            <TiltCard 
              className="w-full max-w-[380px] aspect-[4/5] bg-[#0b0f1e]/40 border border-white/5 shadow-2xl relative"
              glowColor="rgba(6, 182, 212, 0.25)"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#06b6d4]/10 to-transparent pointer-events-none" />
              <div className="w-full h-full relative z-10">
                <Suspense fallback={<div className="w-full h-full bg-dark-800 animate-pulse rounded-[2.5rem]" />}>
                  <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} className="w-full h-full">
                    <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
                    <AvatarCore />
                    <Environment preset="studio" />
                  </Canvas>
                </Suspense>
              </div>
            </TiltCard>
          </div>

        </div>
      </section>

      {/* --- ABOUT & TIMELINE TIMEFRAME --- */}
      <section className="py-24 px-6 sm:px-16 max-w-7xl mx-auto relative z-10" id="about">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={slideUpVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
        >
          {/* Bio Description Box */}
          <div className="lg:col-span-8">
            <TiltCard className="p-8 sm:p-12 h-full border border-white/5 bg-[#0b0f1e]/30 text-left flex flex-col justify-between" glowColor="rgba(236, 72, 153, 0.08)">
              <div className="space-y-8">
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#06b6d4]">
                    High-End Visual Synthesis
                  </span>
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-medium">
                    {profile?.hero_description || "I contribute to building critical, robust and responsive web applications with a focus on Frontend and Full Stack. My design systems bridge the gap between creative visual experiences and high-performance server structures."}
                  </p>
                </div>

                <div id="experience" className="border-t border-white/5 pt-8 space-y-6">
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
            </TiltCard>
          </div>

          {/* Stats Column */}
          <div className="lg:col-span-4 flex flex-col gap-6 justify-between">
            {statItems.map((stat, idx) => (
              <div 
                key={idx}
                className="glass-morphism p-8 border border-white/5 bg-[#0b0f1e]/30 rounded-[2rem] text-center flex flex-col justify-center items-center flex-1 h-32 hover:border-[#ec4899]/30 transition-all duration-300"
              >
                <h3 className={`text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                  {stat.value}
                </h3>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>

        </motion.div>
      </section>

      {/* --- TECH STACK PHYSICS PLAYGROUND --- */}
      <section className="py-24 px-6 sm:px-16 max-w-7xl mx-auto relative z-10 border-t border-white/5" id="skills">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={slideUpVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
        >
          {/* Left: Physics Canvas */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <h3 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-6">
              <span className="text-[#ec4899]">02.</span> Tech Stack
            </h3>
            
            {/* The WebGL Canvas */}
            <div 
              onClick={handleCanvasClick}
              className="w-full h-[400px] sm:h-[450px] rounded-[2rem] border border-white/10 bg-[#0b0f1e]/50 overflow-hidden relative shadow-2xl cursor-crosshair group"
            >
              <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-gray-500" style={{ backgroundColor: 'var(--color-dark-950)' }}>Booting physics sandbox...</div>}>
                <Canvas shadows dpr={[1, 2]} className="w-full h-full">
                  <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
                  <PhysicsSimulatorScene 
                    ballsList={ballsList} 
                    ballsRef={ballsRef} 
                    mouseSphereRef={mouseSphereRef} 
                  />
                  <Environment preset="studio" />
                </Canvas>
              </Suspense>

              {/* Click Spawner Badge overlay */}
              <div className="absolute top-4 right-4 px-3.5 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-[#06b6d4] flex items-center gap-1.5 select-none pointer-events-none group-hover:scale-105 transition-all">
                <FiPlus className="animate-spin" style={{ animationDuration: '4s' }} /> Click Canvas to spawn spheres
              </div>
            </div>
          </div>

          {/* Right: Text Description / Categories */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#06b6d4] flex items-center gap-2">
              <FiCpu /> Interactive Modules
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">
              Interact with the physics environment on the left! Hover over the screen to push, bounce, and scatter the technology spheres with your mouse cursor, or click to spawn more balls!
            </p>

            <div className="space-y-4 pt-4 border-t border-white/5">
              {categories.map(cat => (
                <div key={cat} className="space-y-2">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-500">{cat} Stack</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {displaySkills.filter(s => {
                      const mappedCat = s.category === 'Programming' ? 'Database' : s.category;
                      return mappedCat === cat;
                    }).map(sk => (
                      <span key={sk.name} className="px-3.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-gray-300">
                        {sk.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      </section>

      {/* --- FEATURED PROJECTS GALLERY --- */}
      <section className="py-24 px-6 sm:px-16 max-w-7xl mx-auto relative z-10 border-t border-white/5" id="projects">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={slideUpVariants}
          className="space-y-16"
        >
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-left text-white tracking-tight">
            <span className="text-[#10b981]">03.</span> Featured Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayProjects.map((project, idx) => (
              <TiltCard key={project.id || idx} className="p-8 border border-white/5 bg-[#0b0f1e]/30 flex flex-col justify-between" glowColor="rgba(16, 185, 129, 0.08)">
                <div className="space-y-6 text-left">
                  {/* Decorative Project Panel mockup */}
                  <div className="relative aspect-[16/10] w-full rounded-2xl bg-gradient-to-br from-[#0b0f1e] to-black border border-white/5 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/[0.01] z-0" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#10b981]/15 to-transparent pointer-events-none" />
                    <div className="relative z-10 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                        <FiFolder className="text-[#10b981]" size={24} />
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
          </div>
        </motion.div>
      </section>

      {/* --- CERTIFICATIONS SECTION --- */}
      {certificates.length > 0 && (
        <section className="py-24 px-6 sm:px-16 max-w-7xl mx-auto relative z-10 border-t border-white/5" id="certificates">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={slideUpVariants}
            className="space-y-16"
          >
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-left text-white tracking-tight">
              <span className="text-[#06b6d4]">04.</span> Achievements
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {certificates.map((cert) => (
                <div 
                  key={cert.id}
                  className="glass-morphism border border-white/5 bg-[#0b0f1e]/30 p-6 rounded-3xl flex flex-col justify-between cursor-pointer text-left hover:border-[#06b6d4]/30 transition-colors"
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
                      <p className="text-xs text-[#06b6d4] font-semibold mt-1">{cert.issuer}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                    <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5">
                      <FiCalendar /> {cert.date}
                    </span>
                    <span className="text-[10px] text-[#06b6d4] font-bold uppercase tracking-wider hover:underline">
                      Verify
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* --- CONTACT SHELL FORM --- */}
      <section className="py-24 px-6 sm:px-16 max-w-4xl mx-auto relative z-10 border-t border-white/5" id="contact">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={slideUpVariants}
          className="space-y-16"
        >
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-center text-white tracking-tight">
            Get In Touch
          </h2>

          <div className="border border-white/10 bg-[#0b0f1e]/60 rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Top Window Console Frame */}
            <div className="bg-black/40 px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#06b6d4] flex items-center gap-1.5 font-mono">
                <FiTerminal /> physics - dispatch.sh
              </span>
              <div className="w-12" />
            </div>

            {/* Terminal Form Body */}
            <form onSubmit={handleFormSubmit} className="p-8 space-y-6 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#06b6d4] font-mono">{`# name_node`}</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    value={formState.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name" 
                    className="w-full bg-[#070b19]/60 border border-white/10 px-4 py-3 rounded-xl text-sm focus:border-[#ec4899] transition-all outline-none font-mono text-white placeholder:text-gray-600" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#06b6d4] font-mono">{`# email_node`}</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    value={formState.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email" 
                    className="w-full bg-[#070b19]/60 border border-white/10 px-4 py-3 rounded-xl text-sm focus:border-[#ec4899] transition-all outline-none font-mono text-white placeholder:text-gray-600" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#06b6d4] font-mono">{`# subject_node`}</label>
                <input 
                  type="text" 
                  name="subject" 
                  required 
                  value={formState.subject}
                  onChange={handleInputChange}
                  placeholder="Connection subject" 
                  className="w-full bg-[#070b19]/60 border border-white/10 px-4 py-3 rounded-xl text-sm focus:border-[#ec4899] transition-all outline-none font-mono text-white placeholder:text-gray-600" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#06b6d4] font-mono">{`# message_node`}</label>
                <textarea 
                  name="message" 
                  required 
                  rows="5"
                  value={formState.message}
                  onChange={handleInputChange}
                  placeholder="Type message details..." 
                  className="w-full bg-[#070b19]/60 border border-white/10 p-4 rounded-xl text-sm focus:border-[#ec4899] transition-all outline-none font-mono text-white placeholder:text-gray-600 resize-none" 
                />
              </div>

              <div className="pt-6 flex items-center justify-between flex-wrap gap-4 border-t border-white/5">
                <div className="flex gap-2">
                  {profile?.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:border-[#ec4899] hover:text-[#ec4899] flex items-center justify-center text-gray-400 transition-all">
                      <FiGithub size={18} />
                    </a>
                  )}
                  {profile?.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:border-[#ec4899] hover:text-[#ec4899] flex items-center justify-center text-gray-400 transition-all">
                      <FiLinkedin size={18} />
                    </a>
                  )}
                  {profile?.twitter_url && (
                    <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:border-[#ec4899] hover:text-[#ec4899] flex items-center justify-center text-gray-400 transition-all">
                      <FiTwitter size={18} />
                    </a>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={formLoading}
                  className="px-8 py-3.5 rounded-xl bg-[#ec4899] hover:bg-[#ec4899]/80 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#ec4899]/25 font-mono"
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
                    className="text-xs text-[#10b981] font-mono mt-4 border border-[#10b981]/30 bg-[#10b981]/5 p-3 rounded-lg"
                  >
                    {`[SUCCESS] Node connection secure. Handshake message successfully dispatched.`}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </motion.div>
      </section>

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

export default PhysicsStackPortfolioView;

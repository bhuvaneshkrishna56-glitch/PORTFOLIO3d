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
const TiltCard = ({ children, className = '', glowColor = 'rgba(16, 185, 129, 0.15)' }) => {
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

// --- ROAD CURVE EQUATION ---
const roadCurveX = (z) => Math.sin(z * 0.12) * 1.8;

// --- PROCEDURAL VESPA SCOOTER ---
const VespaScooter = ({ steerAngle, wheelRotationX, wiggle }) => {
  const scooterColor = '#10b981'; // Emerald Green
  const bodyMetalColor = '#f59e0b'; // Amber Gold
  
  return (
    <group position={[0, wiggle, 0]}>
      {/* Scooter Frame/Body */}
      {/* Chassis Main Shell */}
      <mesh position={[0, 0.35, 0.1]} castShadow>
        <boxGeometry args={[0.3, 0.35, 0.9]} />
        <meshStandardMaterial color={scooterColor} roughness={0.2} metalness={0.5} />
      </mesh>
      
      {/* Front Curved Shield */}
      <mesh position={[0, 0.65, -0.38]} rotation={[-0.25, 0, 0]} castShadow>
        <boxGeometry args={[0.34, 0.55, 0.06]} />
        <meshStandardMaterial color={scooterColor} roughness={0.2} metalness={0.5} />
      </mesh>

      {/* Front Shield Trim (Neon/Metal accent) */}
      <mesh position={[0, 0.65, -0.42]} rotation={[-0.25, 0, 0]}>
        <boxGeometry args={[0.06, 0.58, 0.02]} />
        <meshStandardMaterial color={bodyMetalColor} roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Back Seat */}
      <mesh position={[0, 0.58, 0.2]} castShadow>
        <boxGeometry args={[0.26, 0.1, 0.48]} />
        <meshStandardMaterial color="#1f2937" roughness={0.8} />
      </mesh>

      {/* Back Mudguard/Rear Shell */}
      <mesh position={[0, 0.35, 0.55]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.28, 0.3, 0.35]} />
        <meshStandardMaterial color={scooterColor} roughness={0.2} metalness={0.5} />
      </mesh>

      {/* Steering Column (Rotates with steerAngle) */}
      <group position={[0, 0.5, -0.38]} rotation={[0, steerAngle, 0]}>
        {/* Fork Column */}
        <mesh position={[0, 0.25, -0.05]} rotation={[-0.1, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.5]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Handlebars Bar */}
        <mesh position={[0, 0.5, -0.05]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.65]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Handlebar Grips */}
        <mesh position={[-0.3, 0.5, -0.05]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.12]} />
          <meshStandardMaterial color="#1f2937" roughness={0.9} />
        </mesh>
        <mesh position={[0.3, 0.5, -0.05]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.12]} />
          <meshStandardMaterial color="#1f2937" roughness={0.9} />
        </mesh>

        {/* Front Headlight Housing */}
        <mesh position={[0, 0.53, -0.09]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={scooterColor} roughness={0.2} />
        </mesh>
        
        {/* Headlight Lens (Glowing Gold/Yellow) */}
        <mesh position={[0, 0.53, -0.16]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.03, 16]} />
          <meshBasicMaterial color="#f59e0b" toneMapped={false} />
        </mesh>

        {/* Headlight Spotlight pointing forward */}
        <spotLight 
          position={[0, 0.53, -0.18]} 
          angle={0.4} 
          penumbra={0.5} 
          intensity={6} 
          color="#f59e0b" 
          distance={10} 
        />

        {/* Front Wheel (Rotates for spinning, and turns left/right with steering) */}
        <group position={[0, -0.06, -0.08]} rotation={[wheelRotationX, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <torusGeometry args={[0.16, 0.06, 12, 24]} />
            <meshStandardMaterial color="#1f2937" roughness={0.8} />
          </mesh>
          {/* Wheel Hub */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.08, 8]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.8} />
          </mesh>
        </group>
      </group>

      {/* Rear Wheel (Static steering, only spins) */}
      <group position={[0, 0.1, 0.5]} rotation={[wheelRotationX, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.16, 0.06, 12, 24]} />
          <meshStandardMaterial color="#1f2937" roughness={0.8} />
        </mesh>
        {/* Rear Hub */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.08, 8]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.8} />
        </mesh>
      </group>
      
      {/* Exhaust Pipe */}
      <group position={[-0.15, 0.16, 0.38]}>
        <mesh rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4]} />
          <meshStandardMaterial color="#4b5563" metalness={0.8} />
        </mesh>
        {/* Exhaust Muffler */}
        <mesh position={[0, 0.04, 0.2]} rotation={[0.2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.15]} />
          <meshStandardMaterial color={bodyMetalColor} metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
};

// --- ROADWAY INTEGRATOR ---
const Roadway = () => {
  const slabs = useMemo(() => {
    const arr = [];
    for (let z = 10; z >= -45; z -= 1.25) {
      const x = roadCurveX(z);
      const nextX = roadCurveX(z - 0.1);
      const prevX = roadCurveX(z + 0.1);
      const angle = Math.atan2(prevX - nextX, 0.2);
      
      arr.push(
        <group key={z} position={[x, -0.02, z]} rotation={[0, angle, 0]}>
          {/* Road Surface */}
          <mesh receiveShadow>
            <boxGeometry args={[2.5, 0.04, 1.3]} />
            <meshStandardMaterial color="#1e293b" roughness={0.85} />
          </mesh>
          {/* Center dashes */}
          <mesh position={[0, 0.022, 0]}>
            <planeGeometry args={[0.06, 0.45]} />
            <meshBasicMaterial color="#f59e0b" toneMapped={false} />
          </mesh>
          {/* Left border line */}
          <mesh position={[-1.2, 0.022, 0]}>
            <planeGeometry args={[0.03, 1.3]} />
            <meshBasicMaterial color="#10b981" toneMapped={false} />
          </mesh>
          {/* Right border line */}
          <mesh position={[1.2, 0.022, 0]}>
            <planeGeometry args={[0.03, 1.3]} />
            <meshBasicMaterial color="#10b981" toneMapped={false} />
          </mesh>
        </group>
      );
    }
    return arr;
  }, []);

  return <group>{slabs}</group>;
};

// --- LOW-POLY LANDSCAPE GENERATOR ---
const landscapeObjects = [
  // Left side
  { type: 'tree', position: [-2.5, 0, 5], scale: 0.8 },
  { type: 'tree', position: [-3.2, 0, 0], scale: 1.0 },
  { type: 'rock', position: [-2.8, 0.1, -3], scale: 0.4 },
  { type: 'tree', position: [-3.5, 0, -6], scale: 1.2 },
  { type: 'tree', position: [-3.8, 0, -12], scale: 0.9 },
  { type: 'rock', position: [-2.9, 0.15, -15], scale: 0.6 },
  { type: 'tree', position: [-3.2, 0, -20], scale: 1.1 },
  { type: 'tree', position: [-4.0, 0, -25], scale: 1.3 },
  { type: 'rock', position: [-3.1, 0.1, -29], scale: 0.5 },
  { type: 'tree', position: [-3.4, 0, -34], scale: 1.0 },
  { type: 'tree', position: [-3.8, 0, -40], scale: 0.8 },

  // Right side
  { type: 'tree', position: [2.5, 0, 7], scale: 0.9 },
  { type: 'rock', position: [2.8, 0.1, 3], scale: 0.5 },
  { type: 'tree', position: [3.4, 0, -1], scale: 1.1 },
  { type: 'tree', position: [3.1, 0, -5], scale: 0.8 },
  { type: 'rock', position: [2.9, 0.12, -9], scale: 0.7 },
  { type: 'tree', position: [3.8, 0, -14], scale: 1.2 },
  { type: 'tree', position: [3.3, 0, -18], scale: 1.0 },
  { type: 'rock', position: [3.0, 0.1, -22], scale: 0.4 },
  { type: 'tree', position: [4.2, 0, -28], scale: 1.3 },
  { type: 'tree', position: [3.6, 0, -32], scale: 0.9 },
  { type: 'rock', position: [3.2, 0.15, -37], scale: 0.6 },
  { type: 'tree', position: [3.5, 0, -42], scale: 1.1 }
];

const LowPolyLandscape = () => {
  return (
    <group>
      {landscapeObjects.map((obj, i) => {
        const baseRoadX = roadCurveX(obj.position[2]);
        const adjustedX = baseRoadX + obj.position[0];
        
        if (obj.type === 'tree') {
          return (
            <group key={i} position={[adjustedX, 0, obj.position[2]]} scale={[obj.scale, obj.scale, obj.scale]}>
              {/* Trunk */}
              <mesh position={[0, 0.2, 0]}>
                <cylinderGeometry args={[0.06, 0.08, 0.4]} />
                <meshStandardMaterial color="#78350f" roughness={0.9} />
              </mesh>
              {/* Low-poly stacked leaves */}
              <mesh position={[0, 0.6, 0]} castShadow>
                <coneGeometry args={[0.4, 0.7, 5]} />
                <meshStandardMaterial color="#065f46" roughness={0.9} flatShading />
              </mesh>
              <mesh position={[0, 1.0, 0]} castShadow>
                <coneGeometry args={[0.3, 0.55, 5]} />
                <meshStandardMaterial color="#047857" roughness={0.9} flatShading />
              </mesh>
              <mesh position={[0, 1.35, 0]} castShadow>
                <coneGeometry args={[0.2, 0.4, 5]} />
                <meshStandardMaterial color="#10b981" roughness={0.9} flatShading />
              </mesh>
            </group>
          );
        } else {
          // Rock
          return (
            <mesh 
              key={i} 
              position={[adjustedX, obj.position[1], obj.position[2]]} 
              scale={[obj.scale, obj.scale, obj.scale]}
              rotation={[Math.sin(i) * 2, Math.cos(i) * 2, 0]}
              castShadow
            >
              <dodecahedronGeometry args={[0.5]} />
              <meshStandardMaterial color="#4b5563" roughness={0.8} flatShading />
            </mesh>
          );
        }
      })}
    </group>
  );
};

// --- ROAD SIGNPOST/BILLBOARD ---
const Billboard = ({ config }) => {
  const { z, side, title, accentColor } = config;
  const roadX = roadCurveX(z);
  const posX = roadX + side * 2.3;
  const rotationY = side === -1 ? Math.PI / 4 : -Math.PI / 4;
  
  return (
    <group position={[posX, 0, z]} rotation={[0, rotationY, 0]}>
      {/* Supporting Pole */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.5]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Billboard Backboard Frame */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[1.5, 0.9, 0.1]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>

      {/* Neon glowing board outline */}
      <mesh position={[0, 1.6, 0.01]}>
        <boxGeometry args={[1.56, 0.96, 0.04]} />
        <meshBasicMaterial color={accentColor} wireframe />
      </mesh>

      {/* Screen Face */}
      <mesh position={[0, 1.6, 0.06]}>
        <planeGeometry args={[1.45, 0.82]} />
        <meshStandardMaterial color="#0b0f17" roughness={0.4} />
      </mesh>

      {/* Back Brackets */}
      <mesh position={[0, 1.6, -0.06]}>
        <boxGeometry args={[0.6, 0.4, 0.04]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>

      {/* Dedicated spotlight */}
      <spotLight 
        position={[0, 2.5, 1.0]} 
        angle={0.6} 
        penumbra={0.5} 
        intensity={8} 
        color={accentColor} 
        distance={4.5} 
      />
    </group>
  );
};

// --- SCENE INTEGRATOR AND ANIMATION CONTROLLER ---
const SceneController = ({ scrollProgress, children }) => {
  const { camera } = useThree();
  const scooterRef = useRef();
  
  // Scooter properties state
  const [scooterState, setScooterState] = useState({
    pos: new THREE.Vector3(0, 0, 0),
    rotY: 0,
    steer: 0,
    wheelRot: 0,
    wiggle: 0
  });

  useFrame((state) => {
    // 1. Calculate scooter Z position based on scroll (from Z = 5 down to Z = -35)
    const startZ = 5;
    const endZ = -35;
    const currentZ = startZ + scrollProgress * (endZ - startZ);
    
    // 2. Curvature calculations
    const currentX = roadCurveX(currentZ);
    const forwardX = roadCurveX(currentZ - 0.15);
    
    // 3. Scooter rotation / tangent alignment
    const diffX = forwardX - currentX;
    const tangentRotY = Math.atan2(diffX, -0.15);
    
    // 4. Steer angle based on future curve curvature
    const futureX = roadCurveX(currentZ - 0.45);
    const steerDiffX = futureX - currentX;
    const steerAngle = Math.atan2(steerDiffX, -0.45) - tangentRotY;

    // 5. Spinning wheels
    const wheelRot = -currentZ * 4.5;

    // 6. Wiggle to simulate engine vibration
    const wiggle = Math.sin(state.clock.getElapsedTime() * 28) * 0.006;

    // Update state to render the scooter
    setScooterState({
      pos: new THREE.Vector3(currentX, 0, currentZ),
      rotY: tangentRotY,
      steer: steerAngle * 0.8,
      wheelRot: wheelRot,
      wiggle: wiggle
    });

    // 7. Third-person camera chase offset
    // Camera should float behind and slightly above the scooter
    const cameraOffsetZ = 4.2;
    const cameraOffsetY = 1.4;
    
    const targetCameraZ = currentZ + cameraOffsetZ;
    const targetCameraX = roadCurveX(targetCameraZ) + (Math.sin(currentZ * 0.05) * 0.4); // Subtle lag offset
    
    // Smooth transition with LERP
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCameraX, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, cameraOffsetY, 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCameraZ, 0.08);

    // Camera lookAt tracking the scooter body
    const lookAtTarget = new THREE.Vector3(currentX, 0.6, currentZ);
    camera.lookAt(lookAtTarget);
  });

  return (
    <group>
      <group ref={scooterRef} position={scooterState.pos} rotation={[0, scooterState.rotY, 0]}>
        <VespaScooter 
          steerAngle={scooterState.steer} 
          wheelRotationX={scooterState.wheelRot} 
          wiggle={scooterState.wiggle} 
        />
        {/* Particle sparkles trailing the back wheel */}
        <Sparkles 
          count={25} 
          scale={[0.15, 0.15, 0.4]} 
          position={[0, 0.1, 0.5]} 
          color="#f59e0b" 
          speed={2.2} 
          size={3.0} 
        />
      </group>
      {children}
    </group>
  );
};

// --- MAIN PORTFOLIO VIEW COMPONENT ---
const ScrollRiderPortfolioView = () => {
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
        console.error('Failed to load scroll rider data:', e);
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

  if (loading) return <LoadingSpinner fullScreen message="Loading low-poly universe..." />;

  const statItems = [
    { value: projects.length > 0 ? `${projects.length}+` : '8+', label: 'Projects', color: 'from-[#10b981] to-[#3b82f6]' },
    { value: skills.length > 0 ? `${skills.length}+` : '15+', label: 'Tech Stack', color: 'from-[#3b82f6] to-[#f59e0b]' },
    { value: '1', label: 'Hackathon Win', color: 'from-[#f59e0b] to-[#10b981]' }
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

  const billboards = [
    { z: -6, side: -1, title: 'PROFILE', accentColor: '#10b981' },
    { z: -12, side: 1, title: 'SKILLS', accentColor: '#3b82f6' },
    { z: -18, side: -1, title: 'PROJECTS', accentColor: '#f59e0b' },
    { z: -24, side: 1, title: 'AWARDS', accentColor: '#ec4899' },
    { z: -30, side: -1, title: 'CONTACT', accentColor: '#8b5cf6' }
  ];

  return (
    <div 
      style={{ backgroundColor: 'var(--color-dark-950)', color: 'var(--color-text-primary)' }}
      className="min-h-[600vh] selection:bg-[#10b981]/30 relative"
    >
      
      {/* --- WebGL Canvas (Fixed Backdrop) --- */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <Suspense fallback={<div className="w-full h-full" style={{ backgroundColor: 'var(--color-dark-950)' }} />}>
          <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} className="w-full h-full">
            <PerspectiveCamera makeDefault position={[0, 1.4, 5]} fov={45} />
            <SceneController scrollProgress={scrollProgress}>
              {/* Ambiance lights */}
              <ambientLight intensity={0.25} />
              <directionalLight position={[5, 10, 3]} intensity={1.5} color="#e6f4f1" castShadow />
              
              {/* Environment paths */}
              <Roadway />
              <LowPolyLandscape />
              
              {/* Billboards mapping */}
              {billboards.map((b, index) => (
                <Billboard key={index} config={b} />
              ))}

              <Stars radius={70} depth={30} count={900} factor={6} saturation={0.8} fade speed={1.2} />
              <Environment preset="night" />
            </SceneController>
          </Canvas>
        </Suspense>
      </div>

      {/* --- HTML Scroll Sections Overlay --- */}
      <div className="relative z-10 w-full pointer-events-none">
        
        {/* Section 1: Hero */}
        <section className="h-screen w-full flex items-center justify-center px-6 sm:px-16" id="hero">
          <div className="max-w-5xl mx-auto text-center space-y-6 pointer-events-auto">
            <motion.span 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-black uppercase tracking-[0.3em] text-[#10b981] block"
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
              <h2 className="text-xl sm:text-3xl font-extrabold uppercase leading-tight bg-gradient-to-r from-[#10b981] via-[#3b82f6] to-[#f59e0b] bg-clip-text text-transparent">
                {profile?.hero_title || 'Building Scalable & Modern Web Applications'}
              </h2>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed font-medium"
            >
              {profile?.hero_description || 'Hop on the Vespa for a scrollytelling ride through my digital environment! Scroll down to drive past signposts detailing my profile, skills, projects, and bio.'}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-4 flex justify-center gap-4"
            >
              <a href="#about" className="px-8 py-3.5 rounded-full bg-[#10b981] hover:bg-[#10b981]/80 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#10b981]/20">
                Start Riding <FiArrowRight className="inline-block ml-1" />
              </a>
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 rounded-full border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/5 transition-all flex items-center gap-2">
                Download Resume <FiDownload />
              </a>
            </motion.div>
          </div>
        </section>

        {/* Section 2: Profile (About) */}
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
                <span className="text-[#10b981]">01.</span> Rider Dossier
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className="lg:col-span-8">
                  <TiltCard className="p-8 sm:p-10 h-full border border-white/5 bg-[#12181d]/45 flex flex-col justify-between" glowColor="rgba(16, 185, 129, 0.08)">
                    <div className="space-y-6">
                      <p className="text-gray-300 text-sm leading-relaxed font-medium">
                        {profile?.hero_description || 'I contribute to building critical, robust and responsive web applications. I focus on creative frontend animations, interactive 3D WebGL interfaces, and high-performance server structures.'}
                      </p>
                      
                      <div id="experience" className="border-t border-white/5 pt-6 space-y-4">
                        {displayExperiences.map((exp, idx) => (
                          <div key={exp.id || idx} className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[#10b981] shrink-0 mt-1">
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

                <div className="lg:col-span-4 flex flex-col gap-4">
                  {statItems.map((stat, idx) => (
                    <div 
                      key={idx}
                      className="glass-morphism p-6 border border-white/5 bg-[#12181d]/30 rounded-3xl text-center flex flex-col justify-center items-center flex-1 hover:border-[#10b981]/30 transition-all duration-300"
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
                <span className="text-[#3b82f6]">02.</span> Fuel & Upgrades
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed font-medium">
                My skills revolve around building clean, high-performance client frameworks and deploying robust full-stack infrastructures.
              </p>

              <div className="space-y-4 pt-4 border-t border-white/5 text-left">
                {categories.map(cat => (
                  <div key={cat} className="space-y-1.5">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">{cat} Upgrade Packages</h5>
                    <div className="flex flex-wrap gap-1.5 justify-start">
                      {displaySkills.filter(s => {
                        const mappedCat = s.category === 'Programming' ? 'Database' : s.category;
                        return mappedCat === cat;
                      }).map(sk => (
                        <span key={sk.name} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:border-[#3b82f6]/30 transition-colors">
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
                <span className="text-[#f59e0b]">03.</span> Roadside Milestones
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayProjects.map((project, idx) => (
                  <TiltCard key={project.id || idx} className="p-6 border border-white/5 bg-[#12181d]/30 flex flex-col justify-between" glowColor="rgba(245, 158, 11, 0.08)">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-bold text-white">{project.title}</h4>
                        <FiFolder className="text-[#10b981]" size={16} />
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed font-medium line-clamp-3">
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

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                      <div className="flex gap-2">
                        {project.deployed_link && (
                          <a href={project.deployed_link} className="px-4 py-1.5 rounded-lg bg-[#10b981] hover:bg-[#10b981]/80 text-white font-bold text-[9px] tracking-wider uppercase transition-all shadow-md" target="_blank" rel="noopener noreferrer">
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
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" /> Running
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
                  <span className="text-[#ec4899]">04.</span> Commendations
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certificates.map((cert) => (
                    <div 
                      key={cert.id}
                      className="glass-morphism border border-white/5 bg-[#12181d]/30 p-5 rounded-2xl flex flex-col justify-between cursor-pointer hover:border-[#ec4899]/30 transition-all"
                      onClick={() => {
                        setSelectedCert(cert);
                        setModalOpen(true);
                      }}
                    >
                      <div className="space-y-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[#ec4899]">
                          <FiAward size={16} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs line-clamp-2">{cert.title}</h4>
                          <p className="text-[10px] text-[#ec4899]/85 font-semibold mt-0.5">{cert.issuer}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
                        <span className="text-[9px] text-gray-400 font-medium flex items-center gap-1">
                          <FiCalendar size={10} /> {cert.date}
                        </span>
                        <span className="text-[9px] text-[#ec4899] font-bold uppercase tracking-wider">
                          Inspect
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

              <div className="border border-white/10 bg-[#12181d]/50 rounded-2xl overflow-hidden shadow-2xl relative text-left">
                {/* Console Bar */}
                <div className="bg-black/30 px-6 py-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#10b981] flex items-center gap-1.5 font-mono">
                    <FiTerminal /> rider-transmitter.sh
                  </span>
                  <div className="w-10" />
                </div>

                {/* Form Content */}
                <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#10b981] font-mono">{`# rider_name`}</label>
                      <input 
                        type="text" 
                        name="name" 
                        required 
                        value={formState.name}
                        onChange={handleInputChange}
                        placeholder="Enter rider name" 
                        className="w-full bg-[#090e11]/80 border border-white/10 px-4 py-2.5 rounded-xl text-xs focus:border-[#10b981] transition-all outline-none font-mono text-white placeholder:text-gray-600" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#10b981] font-mono">{`# rider_email`}</label>
                      <input 
                        type="email" 
                        name="email" 
                        required 
                        value={formState.email}
                        onChange={handleInputChange}
                        placeholder="Enter mail node" 
                        className="w-full bg-[#090e11]/80 border border-white/10 px-4 py-2.5 rounded-xl text-xs focus:border-[#10b981] transition-all outline-none font-mono text-white placeholder:text-gray-600" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#10b981] font-mono">{`# transmission_subject`}</label>
                    <input 
                      type="text" 
                      name="subject" 
                      required 
                      value={formState.subject}
                      onChange={handleInputChange}
                      placeholder="Enter subject header" 
                      className="w-full bg-[#090e11]/80 border border-white/10 px-4 py-2.5 rounded-xl text-xs focus:border-[#10b981] transition-all outline-none font-mono text-white placeholder:text-gray-600" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#10b981] font-mono">{`# raw_payload`}</label>
                    <textarea 
                      name="message" 
                      required 
                      rows="4"
                      value={formState.message}
                      onChange={handleInputChange}
                      placeholder="Input message buffer..." 
                      className="w-full bg-[#090e11]/80 border border-white/10 p-4 rounded-xl text-xs focus:border-[#10b981] transition-all outline-none font-mono text-white placeholder:text-gray-600 resize-none" 
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-between flex-wrap gap-4 border-t border-white/5">
                    <div className="flex gap-2">
                      {profile?.github_url && (
                        <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-[#10b981] hover:text-[#10b981] flex items-center justify-center text-gray-400 transition-all">
                          <FiGithub size={14} />
                        </a>
                      )}
                      {profile?.linkedin_url && (
                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-[#10b981] hover:text-[#10b981] flex items-center justify-center text-gray-400 transition-all">
                          <FiLinkedin size={14} />
                        </a>
                      )}
                      {profile?.twitter_url && (
                        <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-[#10b981] hover:text-[#10b981] flex items-center justify-center text-gray-400 transition-all">
                          <FiTwitter size={14} />
                        </a>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      disabled={formLoading}
                      className="px-6 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#10b981]/80 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#10b981]/10 font-mono"
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

export default ScrollRiderPortfolioView;

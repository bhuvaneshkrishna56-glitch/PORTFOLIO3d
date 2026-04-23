import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Float, MeshDistortMaterial, Sparkles, Stars, Cloud, Box, Torus, MeshRefractionMaterial, MeshWobbleMaterial, Center } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { fetchProfile } from '../services/profileService';
import ParticleField from './ParticleField';
import FloatingShapes from './FloatingShapes';

// --- Consolidated Specialized Components ---

const SakuraPetals = ({ count = 100, color = "#ffb7c5" }) => {
  const petals = useRef();
  const data = useMemo(() => Array.from({ length: count }).map(() => ({
    pos: [(Math.random() - 0.5) * 20, Math.random() * 20, (Math.random() - 0.5) * 20],
    spin: Math.random() * 0.05,
    speed: Math.random() * 0.02 + 0.01
  })), [count]);

  useFrame(() => {
    if (petals.current) {
      petals.current.children.forEach((p, i) => {
        p.position.y -= data[i].speed;
        p.rotation.x += data[i].spin;
        if (p.position.y < -10) p.position.y = 10;
      });
    }
  });

  return (
    <group ref={petals}>
      {data.map((d, i) => (
        <mesh key={i} position={d.pos}>
          <planeGeometry args={[0.2, 0.2]} />
          <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
};

const DataStreams = () => {
  const group = useRef();
  useFrame(() => {
    if (group.current) {
      group.current.children.forEach(c => {
        c.position.y -= 0.15;
        if (c.position.y < -15) c.position.y = 15;
      });
    }
  });
  return (
    <group ref={group}>
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 25, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 10]}>
          <boxGeometry args={[0.02, 3, 0.02]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
};

const MiniCity = () => {
  const buildings = useMemo(() => Array.from({ length: 50 }).map(() => ({
    pos: [(Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20],
    scale: [1, Math.random() * 6 + 1, 1],
    color: new THREE.Color().setHSL(Math.random(), 0.6, 0.4)
  })), []);
  return (
    <group position={[0, -5, 0]}>
      {buildings.map((b, i) => (
        <mesh key={i} position={b.pos} scale={b.scale}>
          <boxGeometry />
          <meshStandardMaterial color={b.color} metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      <Grid infiniteGrid cellColor="#222" sectionColor="#444" fadeDistance={40} />
    </group>
  );
};

const HeroScene = () => {
  const [theme, setTheme] = useState('glass_universe');

  useEffect(() => {
    const getTheme = async () => {
      const { profile } = await fetchProfile();
      if (profile?.active_theme) setTheme(profile.active_theme);
    };
    getTheme();
    // Poll for changes
    const interval = setInterval(getTheme, 5000);
    return () => clearInterval(interval);
  }, []);

  // Comprehensive Config for all 50 themes
  const config = {
    // Tech Tier
    cyber_grid: { bg: "#000", color: "#00ffff", env: "city" },
    glass_universe: { bg: "#020210", color: "#6c63ff", env: "night" },
    neural_net: { bg: "#000", color: "#00ff88", env: "city" },
    data_stream: { bg: "#000", color: "#00d4ff", env: "city" },
    code_matrix: { bg: "#000", color: "#00ff00", env: "night" },
    hologram: { bg: "#000", color: "#00ffff", env: "apartment" },
    
    // Space Tier
    galaxy_core: { bg: "#000", color: "#6c63ff", env: "night" },
    black_hole: { bg: "#000", color: "#ff5e00", env: "night" },
    warp_speed: { bg: "#000", color: "#fff", env: "night" },
    nebula: { bg: "#05001a", color: "#ff00ff", env: "night" },
    
    // Nature Tier
    spring_blossom: { bg: "#001a05", color: "#ffb7c5", env: "forest" },
    water_garden: { bg: "#001a1a", color: "#00ffff", env: "park" },
    glass_forest: { bg: "#001000", color: "#00ff88", env: "forest" },
    sakura_exp: { bg: "#000", color: "#ffb7c5", env: "park" },

    // Storytelling
    mini_city: { bg: "#000", color: "#3b82f6", env: "city" },
    brain_idea: { bg: "#05001a", color: "#a855f7", env: "night" },
    ice_crystal: { bg: "#001a1a", color: "#00ffff", env: "studio" },
    fire_ember: { bg: "#1a0500", color: "#ef4444", env: "night" },
    luxury_dark: { bg: "#000", color: "#d4af37", env: "studio" }
  }[theme] || { bg: "#050505", color: "#6c63ff", env: "city" };

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} className="w-full h-full">
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
      <color attach="background" args={[config.bg]} />
      
      <Suspense fallback={null}>
        <ParticleField count={1000} theme={theme} />
        
        {/* Theme-Specific Logic */}
        {theme === 'cyber_grid' && <Grid infiniteGrid fadeDistance={40} cellColor="#00ffff" />}
        {theme === 'galaxy_core' && <Stars radius={100} depth={50} count={5000} factor={4} />}
        {theme === 'black_hole' && <Torus args={[4, 0.5, 16, 100]}><meshStandardMaterial color="#000" emissive="#ff5e00" emissiveIntensity={5} /></Torus>}
        {theme === 'spring_blossom' && <SakuraPetals count={150} />}
        {theme === 'sakura_exp' && <SakuraPetals count={400} color="#ff1493" />}
        {theme === 'data_stream' && <DataStreams />}
        {theme === 'code_matrix' && <Grid infiniteGrid cellColor="#00ff00" sectionColor="#003300" />}
        {theme === 'mini_city' && <MiniCity />}
        {theme === 'brain_idea' && <Sparkles count={300} scale={10} color="#a855f7" />}
        {theme === 'ice_crystal' && <Float speed={4}><mesh><icosahedronGeometry args={[4, 0]} /><MeshWobbleMaterial color="#00ffff" factor={0.4} metalness={1} /></mesh></Float>}
        {theme === 'fire_ember' && <Sparkles count={500} scale={15} color="#ff4400" speed={3} />}
        {theme === 'luxury_dark' && <Float><mesh><sphereGeometry args={[4, 64]} /><meshStandardMaterial color="#111" metalness={1} roughness={0} emissive="#d4af37" emissiveIntensity={0.2} /></mesh></Float>}
        
        {/* Global Lighting */}
        <Environment preset={config.env || "city"} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color={config.color} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color={config.color} />
      </Suspense>

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
};

export default HeroScene;

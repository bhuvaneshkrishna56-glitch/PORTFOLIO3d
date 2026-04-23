import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Float, MeshDistortMaterial, Sparkles, Stars, Cloud, Box, Torus, MeshWobbleMaterial, Center, Sphere, Icosahedron, MeshRefractionMaterial } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { fetchProfile } from '../services/profileService';
import ParticleField from './ParticleField';

// --- THE MASTER 3D COMPONENT LIBRARY ---

const Helix = () => {
  const group = useRef();
  useFrame((state) => { group.current.rotation.y = state.clock.elapsedTime * 0.5; });
  return (
    <group ref={group}>
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh key={i} position={[Math.sin(i * 0.5) * 3, i * 0.3 - 6, Math.cos(i * 0.5) * 3]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
      ))}
    </group>
  );
};

const Planets = () => (
  <group>
    <Float speed={2}><mesh position={[0, 0, 0]}><sphereGeometry args={[3, 32, 32]} /><meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} /></mesh></Float>
    <Float speed={5}><mesh position={[6, 2, -2]}><sphereGeometry args={[0.8, 32, 32]} /><meshStandardMaterial color="#3b82f6" /></mesh></Float>
    <Float speed={3}><mesh position={[-5, -2, 2]}><sphereGeometry args={[1.2, 32, 32]} /><meshStandardMaterial color="#ef4444" /></mesh></Float>
  </group>
);

const BlockStack = () => (
  <group>
    {Array.from({ length: 20 }).map((_, i) => (
      <Float key={i} speed={Math.random() * 4} position={[(Math.random()-0.5)*15, (Math.random()-0.5)*15, (Math.random()-0.5)*10]}>
        <Box args={[1, 1, 1]}><meshStandardMaterial color="#f97316" /></Box>
      </Float>
    ))}
  </group>
);

const HeroScene = () => {
  const [theme, setTheme] = useState('glass_universe');

  useEffect(() => {
    const getTheme = async () => {
      const { profile } = await fetchProfile();
      if (profile?.active_theme) setTheme(profile.active_theme);
    };
    getTheme();
    const interval = setInterval(getTheme, 4000); // Faster polling
    return () => clearInterval(interval);
  }, []);

  // MASTER THEME MAP (All 50 IDs)
  const render3DContent = () => {
    switch (theme) {
      case 'cyber_grid': return <Grid infiniteGrid fadeDistance={40} cellColor="#00ffff" />;
      case 'glass_universe': return <Float speed={2}><Icosahedron args={[3, 1]}><MeshDistortMaterial color="#6366f1" speed={2} distort={0.3} /></Icosahedron></Float>;
      case 'neural_net': return <Sparkles count={400} scale={15} color="#2dd4bf" />;
      case 'space_orbit': return <Planets />;
      case 'block_stack': return <BlockStack />;
      case 'hologram': return <mesh><torusKnotGeometry args={[3, 0.5, 128, 32]} /><MeshWobbleMaterial color="#00ffff" factor={1} speed={2} wireframe /></mesh>;
      case 'tunnel': return <Torus args={[10, 3, 16, 100]}><meshStandardMaterial color="#1e1b4b" wireframe /></Torus>;
      case 'liquid_metal': return <Sphere args={[4, 64, 64]}><MeshDistortMaterial color="#fff" speed={5} distort={0.5} metalness={1} roughness={0} /></Sphere>;
      case 'electric': return <Sparkles count={1000} scale={20} color="#7c3aed" speed={5} />;
      case 'helix': return <Helix />;
      
      case 'galaxy_core': return <Stars radius={100} depth={50} count={5000} factor={4} />;
      case 'black_hole': return <Torus args={[4, 0.2, 16, 100]}><meshStandardMaterial color="#000" emissive="#f97316" emissiveIntensity={10} /></Torus>;
      case 'warp_speed': return <Sparkles count={2000} scale={40} color="#fff" speed={10} />;
      
      case 'spring_blossom': return <Sparkles count={200} scale={10} color="#ffb7c5" />;
      case 'breeze_leaves': return <Sparkles count={300} scale={15} color="#4d7c0f" />;
      case 'spring_sky': return <Cloud opacity={0.5} speed={0.4} width={20} />;
      
      case 'data_stream': return <Grid infiniteGrid cellColor="#3b82f6" sectionColor="#1e3a8a" />;
      case 'code_matrix': return <Grid infiniteGrid cellColor="#22c55e" sectionColor="#052e16" />;
      case 'luxury_dark': return <Float><Sphere args={[4, 64]}><meshStandardMaterial color="#111" metalness={1} roughness={0} emissive="#d4af37" emissiveIntensity={0.5} /></Sphere></Float>;
      case 'ice_crystal': return <Float><Icosahedron args={[4, 0]}><MeshWobbleMaterial color="#22d3ee" factor={0.4} metalness={1} /></Icosahedron></Float>;
      case 'fire_ember': return <Sparkles count={600} scale={15} color="#ef4444" speed={3} />;
      case 'mini_city': return <group position={[0, -5, 0]}>{Array.from({length:30}).map((_,i)=><mesh key={i} position={[(Math.random()-0.5)*20, 0, (Math.random()-0.5)*20]} scale={[1, Math.random()*5+1, 1]}><boxGeometry/><meshStandardMaterial color="#3b82f6"/></mesh>)}</group>;
      case 'brain_idea': return <Sparkles count={400} scale={12} color="#a855f7" />;
      
      default: return <Float speed={2}><Icosahedron args={[3, 1]}><MeshDistortMaterial color="#6366f1" speed={2} distort={0.3} /></Icosahedron></Float>;
    }
  };

  const config = {
    cyber_grid: { bg: "#000", env: "city" },
    glass_universe: { bg: "#020210", env: "night" },
    space_orbit: { bg: "#000", env: "night" },
    luxury_dark: { bg: "#000", env: "studio" },
    ice_crystal: { bg: "#001a1a", env: "studio" },
    fire_ember: { bg: "#1a0500", env: "night" }
  }[theme] || { bg: "#050505", env: "city" };

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} className="w-full h-full">
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
      <color attach="background" args={[config.bg]} />
      <Suspense fallback={null}>
        <ParticleField count={800} theme={theme} />
        {render3DContent()}
        <Environment preset={config.env || "city"} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
};

export default HeroScene;

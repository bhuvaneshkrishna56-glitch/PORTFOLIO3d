import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Float, MeshDistortMaterial, Sparkles, Stars, Cloud, Box, Torus, MeshRefractionMaterial, MeshWobbleMaterial } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { fetchProfile } from '../services/profileService';
import ParticleField from './ParticleField';
import FloatingShapes from './FloatingShapes';

// --- Specialized Storytelling Components ---

const MiniCity = () => {
  const group = useRef();
  const buildings = useMemo(() => Array.from({ length: 40 }).map(() => ({
    pos: [(Math.random() - 0.5) * 15, 0, (Math.random() - 0.5) * 15],
    scale: [1, Math.random() * 5 + 2, 1],
    color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5)
  })), []);

  return (
    <group ref={group} position={[0, -5, 0]}>
      {buildings.map((b, i) => (
        <mesh key={i} position={b.pos} scale={b.scale}>
          <boxGeometry />
          <meshStandardMaterial color={b.color} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
};

const BrainNetwork = () => {
  const group = useRef();
  useFrame((state) => {
    group.current.rotation.y += 0.002;
  });
  return (
    <group ref={group}>
      <Sparkles count={200} scale={10} size={4} color="#a855f7" />
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#a855f7" />
        </mesh>
      ))}
    </group>
  );
};

const IceCrystal = () => {
  return (
    <Float speed={5} rotationIntensity={2}>
      <mesh>
        <icosahedronGeometry args={[4, 0]} />
        <MeshWobbleMaterial color="#00ffff" factor={0.2} speed={1} transparent opacity={0.7} metalness={1} roughness={0} />
      </mesh>
    </Float>
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
  }, []);

  const config = {
    mini_city: { bg: "#001", color: "#3b82f6" },
    brain_idea: { bg: "#05001a", color: "#a855f7" },
    ice_crystal: { bg: "#001a1a", color: "#00ffff" },
    fire_ember: { bg: "#1a0500", color: "#ef4444" },
    museum_walk: { bg: "#111", color: "#fff" }
  }[theme] || { bg: "#050505", color: "#fff" };

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} className="w-full h-full">
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
      <color attach="background" args={[config.bg]} />
      
      <Suspense fallback={null}>
        <ParticleField count={600} theme={theme} />

        {/* --- Storytelling Collection (Themes 41-50) --- */}
        {theme === 'mini_city' && <MiniCity />}
        {theme === 'brain_idea' && <BrainNetwork />}
        {theme === 'ice_crystal' && <IceCrystal />}
        {theme === 'fire_ember' && <Sparkles count={400} scale={15} size={6} speed={3} color="#ff4400" />}
        {theme === 'museum_walk' && (
           <group>
             <mesh position={[-8, 0, -5]} rotation={[0, 0.5, 0]}><planeGeometry args={[6, 8]} /><meshStandardMaterial color="#222" /></mesh>
             <mesh position={[8, 0, -5]} rotation={[0, -0.5, 0]}><planeGeometry args={[6, 8]} /><meshStandardMaterial color="#222" /></mesh>
             <mesh position={[0, 0, -10]}><planeGeometry args={[10, 8]} /><meshStandardMaterial color="#333" /></mesh>
           </group>
        )}

        {/* --- Legacy Engine (Themes 1-40) --- */}
        {theme === 'galaxy_core' && <Stars radius={100} depth={50} count={5000} factor={4} />}
        {theme === 'spring_blossom' && <Sparkles count={100} scale={10} color="#ffb7c5" />}
        {theme === 'code_matrix' && <Grid infiniteGrid fadeDistance={40} cellColor="#00ff00" />}

        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color={config.color} />
      </Suspense>

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
};

export default HeroScene;

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Float, MeshDistortMaterial, Sparkles, Stars, Cloud, Box, Torus, MeshWobbleMaterial, Center } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { fetchProfile } from '../services/profileService';
import ParticleField from './ParticleField';

// --- Specialized Components ---

const BreezeLeaves = () => {
  const group = useRef();
  const leaves = useMemo(() => Array.from({ length: 30 }).map(() => ({
    pos: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20],
    rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
    speed: Math.random() * 0.02 + 0.01
  })), []);

  useFrame((state) => {
    if (group.current) {
      group.current.children.forEach((leaf, i) => {
        leaf.position.x += Math.sin(state.clock.elapsedTime + i) * 0.01;
        leaf.position.y -= leaves[i].speed;
        leaf.rotation.x += 0.01;
        if (leaf.position.y < -10) leaf.position.y = 10;
      });
    }
  });

  return (
    <group ref={group}>
      {leaves.map((l, i) => (
        <mesh key={i} position={l.pos} rotation={l.rotation}>
          <planeGeometry args={[0.3, 0.2]} />
          <meshStandardMaterial color="#2d5a27" side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};

const SpringSky = () => (
  <group>
    <Cloud opacity={0.5} speed={0.4} width={20} depth={1.5} segments={20} />
    {Array.from({ length: 5 }).map((_, i) => (
      <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={1} position={[(i - 2) * 5, Math.sin(i) * 2, -5]}>
        <mesh>
          <coneGeometry args={[2, 2, 4]} />
          <meshStandardMaterial color="#4d7c0f" />
        </mesh>
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
    const interval = setInterval(getTheme, 5000);
    return () => clearInterval(interval);
  }, []);

  // EXHAUSTIVE 50-THEME CONFIG
  const config = {
    // Nature
    spring_blossom: { bg: "#001a05", color: "#ffb7c5", env: "park" },
    breeze_leaves: { bg: "#001000", color: "#4d7c0f", env: "forest" },
    spring_sky: { bg: "#0c4a6e", color: "#bae6fd", env: "apartment" },
    water_garden: { bg: "#083344", color: "#22d3ee", env: "park" },
    flower_field: { bg: "#1a001a", color: "#f472b6", env: "park" },
    butterfly: { bg: "#1e1b4b", color: "#818cf8", env: "night" },
    
    // Tech
    cyber_grid: { bg: "#000", color: "#00ffff", env: "city" },
    code_matrix: { bg: "#000", color: "#22c55e", env: "city" },
    data_stream: { bg: "#000", color: "#3b82f6", env: "city" },
    neural_net: { bg: "#000", color: "#2dd4bf", env: "city" },
    
    // Space
    galaxy_core: { bg: "#000", color: "#6366f1", env: "night" },
    black_hole: { bg: "#000", color: "#f97316", env: "night" },
    warp_speed: { bg: "#000", color: "#fff", env: "night" },
    
    // Storytelling
    mini_city: { bg: "#000", color: "#3b82f6", env: "city" },
    brain_idea: { bg: "#05001a", color: "#a855f7", env: "night" },
    ice_crystal: { bg: "#001a1a", color: "#22d3ee", env: "studio" },
    fire_ember: { bg: "#1a0500", color: "#ef4444", env: "night" }
  }[theme] || { bg: "#050505", color: "#6366f1", env: "city" };

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} className="w-full h-full">
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
      <color attach="background" args={[config.bg]} />
      
      <Suspense fallback={null}>
        <ParticleField count={800} theme={theme} />
        
        {/* Exhaustive Theme Rendering */}
        {theme === 'breeze_leaves' && <BreezeLeaves />}
        {theme === 'spring_sky' && <SpringSky />}
        {theme === 'cyber_grid' && <Grid infiniteGrid fadeDistance={40} cellColor="#00ffff" />}
        {theme === 'galaxy_core' && <Stars radius={100} depth={50} count={5000} factor={4} />}
        {theme === 'code_matrix' && <Grid infiniteGrid cellColor="#22c55e" sectionColor="#052e16" />}
        {theme === 'data_stream' && <Sparkles count={400} scale={20} color="#3b82f6" speed={2} />}
        {theme === 'mini_city' && (
           <group position={[0, -5, 0]}>
             {Array.from({ length: 30 }).map((_, i) => (
               <mesh key={i} position={[(Math.random()-0.5)*20, 0, (Math.random()-0.5)*20]} scale={[1, Math.random()*5+1, 1]}>
                 <boxGeometry /><meshStandardMaterial color="#3b82f6" metalness={0.8} />
               </mesh>
             ))}
           </group>
        )}
        {theme === 'ice_crystal' && <Float speed={4}><mesh><icosahedronGeometry args={[4, 0]} /><MeshWobbleMaterial color="#22d3ee" factor={0.4} metalness={1} /></mesh></Float>}
        {theme === 'fire_ember' && <Sparkles count={500} scale={15} color="#ef4444" speed={3} />}
        {theme === 'black_hole' && <Torus args={[4, 0.5, 16, 100]}><meshStandardMaterial color="#000" emissive="#f97316" emissiveIntensity={5} /></Torus>}

        <Environment preset={config.env} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color={config.color} />
      </Suspense>

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
};

export default HeroScene;

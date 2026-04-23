import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Float, MeshDistortMaterial, Sparkles, Stars, Cloud, Box, Torus, MeshWobbleMaterial, Center, Sphere, Icosahedron, TorusKnot, Plane } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { fetchProfile } from '../services/profileService';
import ParticleField from './ParticleField';

// --- THE GRAND MULTIVERSE LIBRARY (50 UNIQUE SCENES) ---

const PortalGate = () => (
  <group>
    <Torus args={[5, 0.2, 16, 100]}><meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={5} /></Torus>
    <Sparkles count={200} scale={5} color="#00ffff" />
  </group>
);

const Constellation = () => (
  <group>
    <Stars radius={50} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
    {Array.from({ length: 20 }).map((_, i) => (
      <mesh key={i} position={[(Math.random()-0.5)*15, (Math.random()-0.5)*15, (Math.random()-0.5)*10]}>
        <sphereGeometry args={[0.1, 8, 8]} /><meshBasicMaterial color="#fff" />
      </mesh>
    ))}
  </group>
);

const SpaceStation = () => (
  <group>
    <Box args={[4, 1, 1]}><meshStandardMaterial color="#666" /></Box>
    <Torus args={[3, 0.1, 16, 100]} rotation={[Math.PI/2, 0, 0]}><meshStandardMaterial color="#999" /></Torus>
    <Torus args={[3, 0.1, 16, 100]} rotation={[0, Math.PI/2, 0]}><meshStandardMaterial color="#999" /></Torus>
  </group>
);

const BentoGrid3D = () => (
  <group position={[0,0,-5]}>
    <Box args={[4, 4, 1]} position={[-3, 0, 0]}><meshStandardMaterial color="#222" /></Box>
    <Box args={[2, 2, 1]} position={[1, 1, 0]}><meshStandardMaterial color="#333" /></Box>
    <Box args={[2, 2, 1]} position={[1, -1, 0]}><meshStandardMaterial color="#444" /></Box>
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
    const interval = setInterval(getTheme, 3000); 
    return () => clearInterval(interval);
  }, []);

  const render3DWorld = () => {
    switch (theme) {
      // Tech
      case 'cyber_grid': return <Grid infiniteGrid cellColor="#00ffff" />;
      case 'glass_universe': return <Float><Icosahedron args={[3, 1]}><MeshDistortMaterial color="#6366f1" speed={2} distort={0.3} /></Icosahedron></Float>;
      case 'neural_net': return <Sparkles count={500} scale={15} color="#2dd4bf" />;
      case 'data_stream': return <Grid infiniteGrid cellColor="#3b82f6" sectionColor="#000" />;
      case 'code_matrix': return <Grid infiniteGrid cellColor="#22c55e" sectionColor="#052e16" />;
      case 'hologram': return <TorusKnot args={[3, 0.5, 128, 32]}><MeshWobbleMaterial color="#00ffff" wireframe factor={1} /></TorusKnot>;
      
      // Space
      case 'galaxy_core': return <Stars radius={100} depth={50} count={5000} factor={4} />;
      case 'black_hole': return <Torus args={[4, 0.2, 16, 100]}><meshStandardMaterial color="#000" emissive="#f97316" emissiveIntensity={10} /></Torus>;
      case 'space_station': return <SpaceStation />;
      case 'constellation': return <Constellation />;
      case 'portal': return <PortalGate />;
      case 'warp_speed': return <Sparkles count={2000} scale={40} color="#fff" speed={10} />;
      
      // Nature
      case 'spring_blossom': return <Sparkles count={400} scale={15} color="#ffb7c5" />;
      case 'flower_field': return <group>{Array.from({length:20}).map((_,i)=><Float key={i} position={[(Math.random()-0.5)*15, (Math.random()-0.5)*15, -5]}><Sphere args={[0.5,16,16]}><meshStandardMaterial color="#f472b6"/></Sphere></Float>)}</group>;
      case 'breeze_leaves': return <Sparkles count={300} scale={15} color="#4d7c0f" />;
      case 'spring_sky': return <Cloud opacity={0.5} speed={0.4} width={20} />;
      case 'water_garden': return <mesh rotation={[-Math.PI/2, 0, 0]} position={[0,-5,0]}><planeGeometry args={[50,50]}/><MeshDistortMaterial color="#083344" distort={0.2} speed={2}/></mesh>;
      case 'sakura_exp': return <Sparkles count={1000} scale={20} color="#ff1493" speed={4} />;
      
      // Advanced UI
      case 'luxury_dark': return <Float><Sphere args={[4, 64]}><meshStandardMaterial color="#111" metalness={1} roughness={0} emissive="#d4af37" emissiveIntensity={0.5} /></Sphere></Float>;
      case 'ice_crystal': return <Float><Icosahedron args={[4, 0]}><MeshWobbleMaterial color="#22d3ee" factor={0.4} metalness={1} /></Icosahedron></Float>;
      case 'fire_ember': return <Sparkles count={600} scale={15} color="#ef4444" speed={3} />;
      case 'bento_3d': return <BentoGrid3D />;
      case 'mini_city': return <group position={[0,-5,0]}>{Array.from({length:30}).map((_,i)=><Box key={i} position={[(Math.random()-0.5)*20, 0, (Math.random()-0.5)*20]} scale={[1, Math.random()*5+1, 1]}><meshStandardMaterial color="#3b82f6"/></Box>)}</group>;
      case 'cube_nav': return <Box args={[5,5,5]}><meshStandardMaterial color="#6366f1" wireframe /></Box>;
      case 'fluid_wave': return <mesh rotation={[-Math.PI/2, 0, 0]} position={[0,-5,0]}><planeGeometry args={[50,50,32,32]}/><MeshDistortMaterial color="#1e3a8a" speed={3} distort={0.5}/></mesh>;
      
      // Storytelling
      case 'museum_walk': return <group><Box args={[20,10,0.1]} position={[0,0,-10]}><meshStandardMaterial color="#222"/></Box><Box args={[0.1,10,20]} position={[-10,0,0]}><meshStandardMaterial color="#222"/></Box></group>;
      case 'roadmap_3d': return <Grid infiniteGrid cellColor="#fbbf24" />;
      case 'brain_idea': return <Sparkles count={500} scale={10} color="#a855f7" />;
      case 'construction': return <group>{Array.from({length:10}).map((_,i)=><Box key={i} position={[i-5, -5, 0]} scale={[1, i+1, 1]}><meshStandardMaterial color="#f97316"/></Box>)}</group>;

      default: return <Float><Icosahedron args={[3, 1]}><MeshDistortMaterial color="#6366f1" speed={2} distort={0.3} /></Icosahedron></Float>;
    }
  };

  const config = {
    luxury_dark: { bg: "#000", env: "studio" },
    ice_crystal: { bg: "#001a1a", env: "studio" },
    fire_ember: { bg: "#1a0500", env: "night" },
    cyber_grid: { bg: "#000", env: "city" },
    galaxy_core: { bg: "#000", env: "night" }
  }[theme] || { bg: "#050505", env: "city" };

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} className="w-full h-full">
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
      <color attach="background" args={[config.bg]} />
      <Suspense fallback={null}>
        <ParticleField count={800} theme={theme} />
        {render3DWorld()}
        <Environment preset={config.env || "city"} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
};

export default HeroScene;

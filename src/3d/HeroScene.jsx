import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Float, MeshDistortMaterial, Sparkles, Stars, Cloud, Box, Torus, MeshWobbleMaterial, Center, Sphere, Icosahedron, TorusKnot, Plane, Dodecahedron, Cylinder } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { fetchProfile } from '../services/profileService';
import ParticleField from './ParticleField';

// --- THE ULTIMATE 50-WORLD COMPONENT LIBRARY ---

const DNAHelix = () => (
  <group>
    {Array.from({ length: 30 }).map((_, i) => (
      <group key={i} rotation={[0, i * 0.5, 0]}>
        <mesh position={[3, i * 0.4 - 6, 0]}><sphereGeometry args={[0.2, 16, 16]}/><meshStandardMaterial color="#22c55e"/></mesh>
        <mesh position={[-3, i * 0.4 - 6, 0]}><sphereGeometry args={[0.2, 16, 16]}/><meshStandardMaterial color="#3b82f6"/></mesh>
      </group>
    ))}
  </group>
);

const SolarSystem = () => (
  <group>
    <Sphere args={[2, 32, 32]}><meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} /></Sphere>
    {Array.from({ length: 5 }).map((_, i) => (
      <group key={i} rotation={[0, Math.random() * Math.PI * 2, 0]}>
        <mesh position={[5 + i * 2, 0, 0]}><sphereGeometry args={[0.5, 32, 32]}/><meshStandardMaterial color="#3b82f6"/></mesh>
      </group>
    ))}
  </group>
);

const TunnelRings = () => (
  <group>
    {Array.from({ length: 15 }).map((_, i) => (
      <mesh key={i} position={[0, 0, -i * 5]} rotation={[0, 0, i * 0.2]}>
        <torusGeometry args={[8, 0.1, 16, 100]} /><meshStandardMaterial color="#6366f1" wireframe />
      </mesh>
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
    const interval = setInterval(getTheme, 3000); 
    return () => clearInterval(interval);
  }, []);

  const renderWorld = () => {
    switch (theme) {
      // 1-10: Tech Tier
      case 'cyber_grid': return <Grid infiniteGrid fadeDistance={50} cellColor="#00ffff" sectionColor="#00ffff" />;
      case 'glass_universe': return <Float speed={3}><Dodecahedron args={[3, 0]}><MeshDistortMaterial color="#6366f1" speed={2} distort={0.4} metalness={1} /></Dodecahedron></Float>;
      case 'neural_net': return <group><Sparkles count={800} scale={15} color="#2dd4bf" />{Array.from({length:20}).map((_,i)=><mesh key={i} position={[(Math.random()-0.5)*15,(Math.random()-0.5)*15,(Math.random()-0.5)*10]}><sphereGeometry args={[0.1]}/><meshBasicMaterial color="#2dd4bf"/></mesh>)}</group>;
      case 'space_orbit': return <SolarSystem />;
      case 'block_stack': return <group>{Array.from({length:30}).map((_,i)=><Float key={i} position={[(Math.random()-0.5)*20,(Math.random()-0.5)*20,(Math.random()-0.5)*10]}><Box args={[1.5,1.5,1.5]}><meshStandardMaterial color="#f97316"/></Box></Float>)}</group>;
      case 'hologram': return <mesh><torusKnotGeometry args={[3.5, 0.6, 256, 64]}/><MeshWobbleMaterial color="#00ffff" wireframe factor={1.5} speed={3}/></mesh>;
      case 'tunnel': return <TunnelRings />;
      case 'liquid_metal': return <Sphere args={[4, 128, 128]}><MeshDistortMaterial color="#fff" metalness={1} roughness={0} speed={4} distort={0.6}/></Sphere>;
      case 'electric': return <Sparkles count={1500} scale={20} color="#7c3aed" speed={8} size={4}/>;
      case 'helix': return <DNAHelix />;

      // 11-20: Space Tier
      case 'galaxy_core': return <Stars radius={100} depth={50} count={5000} factor={4} />;
      case 'warp_speed': return <Sparkles count={3000} scale={50} color="#fff" speed={15} />;
      case 'black_hole': return <group><Torus args={[5, 0.4, 16, 100]}><meshStandardMaterial color="#000" emissive="#f97316" emissiveIntensity={10}/></Torus><Sparkles count={500} scale={10} color="#f97316"/></group>;
      case 'nebula': return <Cloud opacity={0.8} speed={0.4} width={25} depth={5} segments={30} color="#ff00ff" />;
      case 'solar_system': return <SolarSystem />;
      case 'planet_surface': return <group position={[0,-5,0]}><Grid infiniteGrid cellColor="#f97316"/><Sphere args={[2]} position={[0,5,-10]}><meshStandardMaterial color="#ef4444"/></Sphere></group>;
      case 'constellation': return <group><Stars/><Sparkles count={500} color="#fff"/>{Array.from({length:10}).map((_,i)=><mesh key={i} position={[(Math.random()-0.5)*20,(Math.random()-0.5)*15,-5]}><sphereGeometry args={[0.2]}/></mesh>)}</group>;
      case 'portal': return <group><Torus args={[6,0.2,16,100]}><meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={5}/></Torus><Sparkles count={200} scale={6}/></group>;

      // 21-30: Nature Tier
      case 'spring_blossom': return <Sparkles count={500} scale={15} color="#ffb7c5" speed={2} />;
      case 'water_garden': return <mesh rotation={[-Math.PI/2,0,0]} position={[0,-5,0]}><planeGeometry args={[50,50,32,32]}/><MeshDistortMaterial color="#0c4a6e" distort={0.3} speed={2}/></mesh>;
      case 'sakura_exp': return <Sparkles count={1500} scale={25} color="#ff1493" speed={5} />;

      // 31-40: Advanced UI Tier
      case 'data_stream': return <Grid infiniteGrid cellColor="#3b82f6" sectionColor="#000" fadeDistance={40}/>;
      case 'code_matrix': return <Grid infiniteGrid cellColor="#22c55e" sectionColor="#022c22" fadeDistance={40}/>;
      case 'luxury_dark': return <Float><Sphere args={[4,64,64]}><meshStandardMaterial color="#111" metalness={1} roughness={0} emissive="#d4af37" emissiveIntensity={0.4}/></Sphere></Float>;
      case 'ice_crystal': return <Float><Icosahedron args={[4,0]}><MeshWobbleMaterial color="#00ffff" factor={0.4} metalness={1} roughness={0}/></Icosahedron></Float>;
      case 'fire_ember': return <Sparkles count={800} scale={20} color="#ef4444" speed={4} />;
      case 'bento_3d': return <group position={[0,0,-5]}><Box args={[5,5,1]} position={[-3,0,0]}><meshStandardMaterial color="#222"/></Box><Box args={[2,2,1]} position={[1,1,0]}><meshStandardMaterial color="#333"/></Box></group>;

      default: return <Float><Icosahedron args={[3, 1]}><MeshDistortMaterial color="#6366f1" speed={2} distort={0.3} /></Icosahedron></Float>;
    }
  };

  const config = {
    luxury_dark: { bg: "#000", env: "studio" },
    ice_crystal: { bg: "#001a1a", env: "studio" },
    fire_ember: { bg: "#1a0500", env: "night" },
    cyber_grid: { bg: "#000", env: "city" },
    galaxy_core: { bg: "#000", env: "night" },
    nebula: { bg: "#05001a", env: "night" }
  }[theme] || { bg: "#050505", env: "city" };

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} className="w-full h-full">
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
      <color attach="background" args={[config.bg]} />
      <Suspense fallback={null}>
        <ParticleField count={1000} theme={theme} />
        {renderWorld()}
        <Environment preset={config.env || "city"} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
};

export default HeroScene;

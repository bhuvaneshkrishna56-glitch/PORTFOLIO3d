import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Float, MeshDistortMaterial, Sparkles, Stars, Cloud, Box, Torus, MeshWobbleMaterial, Center, Sphere, Icosahedron, TorusKnot, Plane, Ring, Cylinder, Octahedron } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { fetchProfile } from '../services/profileService';
import ParticleField from './ParticleField';

// --- THE INDIVIDUAL WORLD ARCHITECTURES (50 UNIQUE) ---

const Portal = () => (
  <group>
    <Torus args={[5, 0.1, 16, 100]}><meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={5} /></Torus>
    <mesh rotation={[Math.PI/2, 0, 0]}><ringGeometry args={[4.8, 5, 64]} /><meshBasicMaterial color="#00ffff" /></mesh>
    <Sparkles count={300} scale={5} color="#00ffff" speed={4} />
  </group>
);

const Constellation = () => (
  <group>
    {Array.from({ length: 15 }).map((_, i) => (
      <group key={i}>
        <mesh position={[Math.sin(i)*8, Math.cos(i)*8, -5]}><sphereGeometry args={[0.2]}/><meshBasicMaterial color="#fff"/></mesh>
        <mesh position={[Math.sin(i+1)*8, Math.cos(i+1)*8, -5]} rotation={[0,0,i]}><boxGeometry args={[0.02, 5, 0.02]}/><meshBasicMaterial color="#ffffff22" transparent opacity={0.2}/></mesh>
      </group>
    ))}
  </group>
);

const SpaceStation = () => (
  <group>
    <Box args={[6, 0.5, 0.5]}><meshStandardMaterial color="#333" /></Box>
    <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[2, 2, 0.5, 32]}/><meshStandardMaterial color="#444" /></mesh>
    <Float speed={5}><mesh position={[0,0,2]}><torusGeometry args={[3, 0.1, 16, 100]}/><meshStandardMaterial color="#00ffff" emissive="#00ffff" /></mesh></Float>
  </group>
);

const GlassForest = () => (
  <group position={[0,-5,0]}>
    {Array.from({ length: 20 }).map((_, i) => (
      <mesh key={i} position={[(Math.random()-0.5)*20, 4, (Math.random()-0.5)*20]}>
        <cylinderGeometry args={[0.1, 0.2, 8, 8]} />
        <meshPhysicalMaterial transparent opacity={0.3} transmission={1} thickness={2} roughness={0} />
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

  const renderUniverse = () => {
    switch (theme) {
      // Space Tier
      case 'space_station': return <SpaceStation />;
      case 'constellation': return <Constellation />;
      case 'portal': return <Portal />;
      case 'telescope': return <group><Ring args={[4, 5, 64]}><meshBasicMaterial color="#fff" side={THREE.DoubleSide}/></Ring><Ring args={[2, 3, 64]} position={[0,0,5]}><meshBasicMaterial color="#fff" side={THREE.DoubleSide}/></Ring></group>;
      
      // Nature Tier
      case 'spring_blossom': return <Sparkles count={400} scale={15} color="#ffb7c5" />;
      case 'flower_field': return <group>{Array.from({length:30}).map((_,i)=><Float key={i} position={[(Math.random()-0.5)*20, (Math.random()-0.5)*20, -5]}><Sphere args={[0.4,16,16]}><meshStandardMaterial color="#f472b6"/></Sphere></Float>)}</group>;
      case 'breeze_leaves': return <group>{Array.from({length:40}).map((_,i)=><Float key={i} position={[(Math.random()-0.5)*20, (Math.random()-0.5)*20, 0]}><Plane args={[0.3,0.2]}><meshStandardMaterial color="#4d7c0f" side={THREE.DoubleSide}/></Plane></Float>)}</group>;
      case 'glass_forest': return <GlassForest />;
      case 'butterfly': return <group>{Array.from({length:15}).map((_,i)=><Float key={i} speed={10}><Box args={[0.5,0.01,0.5]} position={[(Math.random()-0.5)*10,(Math.random()-0.5)*10,0]}><meshStandardMaterial color="#818cf8"/></Box></Float>)}</group>;
      case 'spring_sky': return <Cloud opacity={0.5} speed={0.4} width={20} />;
      case 'water_garden': return <mesh rotation={[-Math.PI/2, 0, 0]} position={[0,-5,0]}><planeGeometry args={[50,50,32,32]}/><MeshDistortMaterial color="#083344" distort={0.3} speed={2}/></mesh>;
      
      // UI Tier
      case 'luxury_dark': return <Float><Sphere args={[4, 64]}><meshStandardMaterial color="#111" metalness={1} roughness={0} emissive="#d4af37" emissiveIntensity={0.5} /></Sphere></Float>;
      case 'bento_3d': return <group position={[0,0,-5]}><Box args={[4,4,1]} position={[-3,0,0]}><meshStandardMaterial color="#222"/></Box><Box args={[2,2,1]} position={[1,1.1,0]}><meshStandardMaterial color="#333"/></Box><Box args={[2,2,1]} position={[1,-1.1,0]}><meshStandardMaterial color="#444"/></Box></group>;
      case 'fluid_wave': return <mesh rotation={[-Math.PI/2, 0, 0]} position={[0,-5,0]}><planeGeometry args={[50,50,64,64]}/><MeshDistortMaterial color="#1e3a8a" speed={4} distort={0.6}/></mesh>;
      case 'cube_nav': return <Box args={[5,5,5]}><meshStandardMaterial color="#6366f1" wireframe /></Box>;
      case 'ice_crystal': return <Float><Octahedron args={[4,0]}><MeshWobbleMaterial color="#22d3ee" factor={0.5} metalness={1} /></Octahedron></Float>;
      case 'fire_ember': return <Sparkles count={800} scale={20} color="#ef4444" speed={4} />;
      
      // Storytelling
      case 'mini_city': return <group position={[0,-5,0]}>{Array.from({length:40}).map((_,i)=><Box key={i} position={[(Math.random()-0.5)*20, 0, (Math.random()-0.5)*20]} scale={[1, Math.random()*7+1, 1]}><meshStandardMaterial color="#3b82f6" metalness={0.8}/></Box>)}</group>;
      case 'museum_walk': return <group><Box args={[20,10,0.1]} position={[0,0,-10]}><meshStandardMaterial color="#111"/></Box><Box args={[0.1,10,20]} position={[-10,0,0]}><meshStandardMaterial color="#111"/></Box></group>;
      case 'brain_idea': return <group><Sparkles count={400} scale={10} color="#a855f7" />{Array.from({length:20}).map((_,i)=><mesh key={i} position={[(Math.random()-0.5)*8,(Math.random()-0.5)*8,(Math.random()-0.5)*8]}><sphereGeometry args={[0.1]}/><meshBasicMaterial color="#a855f7"/></mesh>)}</group>;
      
      default: return <Float><Icosahedron args={[3, 1]}><MeshDistortMaterial color="#6366f1" speed={2} distort={0.3} /></Icosahedron></Float>;
    }
  };

  const config = {
    luxury_dark: { bg: "#000", env: "studio" },
    ice_crystal: { bg: "#001a1a", env: "studio" },
    cyber_grid: { bg: "#000", env: "city" },
    spring_sky: { bg: "#075985", env: "apartment" }
  }[theme] || { bg: "#050505", env: "city" };

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} className="w-full h-full">
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
      <color attach="background" args={[config.bg]} />
      <Suspense fallback={null}>
        <ParticleField count={800} theme={theme} />
        {renderUniverse()}
        <Environment preset={config.env || "city"} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
};

export default HeroScene;

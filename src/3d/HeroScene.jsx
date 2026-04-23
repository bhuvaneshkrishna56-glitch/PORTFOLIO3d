import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Float, MeshDistortMaterial, Sparkles, Stars, Cloud, Box, Torus, MeshWobbleMaterial, Center, Sphere, Icosahedron, TorusKnot, Plane, Ring, Cylinder, Octahedron } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { fetchProfile } from '../services/profileService';
import ParticleField from './ParticleField';

// --- SPECIALIZED COMPONENTS FOR THE "DUPLICATE" LIST ---

const CodeMatrixRain = () => (
  <group>
    {Array.from({ length: 40 }).map((_, i) => (
      <mesh key={i} position={[(Math.random()-0.5)*30, 0, (Math.random()-0.5)*10]}>
        <boxGeometry args={[0.05, 10, 0.05]} />
        <meshBasicMaterial color="#00ff00" transparent opacity={0.3} />
      </mesh>
    ))}
  </group>
);

const RoadmapPath = () => (
  <group rotation={[Math.PI/4, 0, 0]}>
    <mesh position={[0, -5, 0]}>
      <planeGeometry args={[2, 100]} />
      <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
    </mesh>
    {Array.from({ length: 10 }).map((_, i) => (
      <mesh key={i} position={[0, -4.8, i * -10]}>
        <boxGeometry args={[2.2, 0.2, 0.5]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
    ))}
  </group>
);

const ConstructionSite = () => (
  <group position={[0,-5,0]}>
    {Array.from({ length: 15 }).map((_, i) => (
      <group key={i} position={[i-7, 0, (Math.random()-0.5)*10]}>
        <Box args={[0.5, Math.random()*10, 0.5]}><meshStandardMaterial color="#f97316" /></Box>
        <Box args={[0.1, 10, 0.1]} position={[0, 0, 0]}><meshStandardMaterial color="#666" wireframe /></Box>
      </group>
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
      // THE UNIQUE FIX LIST
      case 'code_matrix': return <CodeMatrixRain />;
      case 'data_stream': return <group>{Array.from({length:30}).map((_,i)=><mesh key={i} position={[(Math.random()-0.5)*20, (Math.random()-0.5)*20, -5]} rotation={[0,0,Math.PI/2]}><boxGeometry args={[10,0.02,0.02]}/><meshBasicMaterial color="#3b82f6" transparent opacity={0.5}/></mesh>)}</group>;
      case 'roadmap_3d': return <RoadmapPath />;
      case 'construction': return <ConstructionSite />;
      case 'grid_cards': return <group>{Array.from({length:12}).map((_,i)=><Float key={i} position={[(i%4-1.5)*4, (Math.floor(i/4)-1)*4, 0]}><Box args={[3,4,0.1]}><meshStandardMaterial color="#222" metalness={1} roughness={0}/></Box></Float>)}</group>;
      case 'game_world': return <group position={[0,-5,0]}><mesh rotation={[-Math.PI/2,0,0]}><planeGeometry args={[30,30]}/><meshStandardMaterial color="#14532d"/></mesh>{Array.from({length:10}).map((_,i)=><mesh key={i} position={[(Math.random()-0.5)*20, 1.5, (Math.random()-0.5)*20]}><coneGeometry args={[1,3,4]}/><meshStandardMaterial color="#064e3b"/></mesh>)}</group>;
      case 'tech_lab': return <group>{Array.from({length:5}).map((_,i)=><Float key={i}><TorusKnot args={[1, 0.3, 128, 32]} position={[(i-2)*5, 0, 0]}><meshStandardMaterial color="#666" metalness={1}/></TorusKnot></Float>)}</group>;
      case 'stage_spot': return <group position={[0,-5,0]}><mesh rotation={[-Math.PI/2,0,0]}><planeGeometry args={[50,50]}/><meshStandardMaterial color="#050505"/></mesh><spotLight position={[0,10,0]} angle={0.3} penumbra={1} intensity={10} color="#fff" castShadow /></group>;
      case 'puzzle_ui': return <group>{Array.from({length:20}).map((_,i)=><Float key={i}><Box args={[1,1,1]} position={[(Math.random()-0.5)*10,(Math.random()-0.5)*10,(Math.random()-0.5)*5]}><meshStandardMaterial color={i%2===0?"#ef4444":"#111"}/></Box></Float>)}</group>;
      case 'book_flip': return <group>{Array.from({length:6}).map((_,i)=><Float key={i} rotation={[0, i*0.5, 0]}><Box args={[4,6,0.05]} position={[2,0,0]}><meshStandardMaterial color="#451a03"/></Box></Float>)}</group>;

      // LEGACY THEMES (Restored/Confirmed working)
      case 'water_garden': return <mesh rotation={[-Math.PI/2, 0, 0]} position={[0,-5,0]}><planeGeometry args={[50,50,32,32]}/><MeshDistortMaterial color="#083344" distort={0.4} speed={2}/></mesh>;
      case 'sakura_exp': return <Sparkles count={1500} scale={25} color="#ff1493" speed={5} />;
      case 'luxury_dark': return <Float><Sphere args={[4, 64]}><meshStandardMaterial color="#111" metalness={1} roughness={0} emissive="#d4af37" emissiveIntensity={0.5} /></Sphere></Float>;
      case 'bento_3d': return <group position={[0,0,-5]}><Box args={[4,4,1]} position={[-3,0,0]}><meshStandardMaterial color="#222"/></Box><Box args={[2,2,1]} position={[1,1.1,0]}><meshStandardMaterial color="#333"/></Box><Box args={[2,2,1]} position={[1,-1.1,0]}><meshStandardMaterial color="#444"/></Box></group>;
      case 'fluid_wave': return <mesh rotation={[-Math.PI/2, 0, 0]} position={[0,-5,0]}><planeGeometry args={[50,50,64,64]}/><MeshDistortMaterial color="#1e3a8a" speed={4} distort={0.6}/></mesh>;
      case 'cube_nav': return <Box args={[5,5,5]}><meshStandardMaterial color="#6366f1" wireframe /></Box>;
      case 'mini_city': return <group position={[0,-5,0]}>{Array.from({length:40}).map((_,i)=><Box key={i} position={[(Math.random()-0.5)*20, 0, (Math.random()-0.5)*20]} scale={[1, Math.random()*7+1, 1]}><meshStandardMaterial color="#3b82f6" metalness={0.8}/></Box>)}</group>;
      case 'museum_walk': return <group><Box args={[20,10,0.1]} position={[0,0,-10]}><meshStandardMaterial color="#111"/></Box><Box args={[0.1,10,20]} position={[-10,0,0]}><meshStandardMaterial color="#111"/></Box></group>;
      case 'brain_idea': return <group><Sparkles count={400} scale={10} color="#a855f7" />{Array.from({length:20}).map((_,i)=><mesh key={i} position={[(Math.random()-0.5)*8,(Math.random()-0.5)*8,(Math.random()-0.5)*8]}><sphereGeometry args={[0.1]}/><meshBasicMaterial color="#a855f7"/></mesh>)}</group>;
      case 'ice_crystal': return <Float><Octahedron args={[4,0]}><MeshWobbleMaterial color="#22d3ee" factor={0.5} metalness={1} /></Octahedron></Float>;
      case 'fire_ember': return <Sparkles count={800} scale={20} color="#ef4444" speed={4} />;
      
      default: return <Float><Icosahedron args={[3, 1]}><MeshDistortMaterial color="#6366f1" speed={2} distort={0.3} /></Icosahedron></Float>;
    }
  };

  const config = {
    luxury_dark: { bg: "#000", env: "studio" },
    ice_crystal: { bg: "#001a1a", env: "studio" },
    fire_ember: { bg: "#1a0500", env: "night" },
    cyber_grid: { bg: "#000", env: "city" }
  }[theme] || { bg: "#050505", env: "city" };

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} className="w-full h-full">
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
      <color attach="background" args={[config.bg]} />
      <Suspense fallback={null}>
        <ParticleField count={800} theme={theme} />
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

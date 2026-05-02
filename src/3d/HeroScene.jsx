import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Float, MeshDistortMaterial, Sparkles, Stars, Cloud, Box, Torus, MeshWobbleMaterial, Center, Sphere, Icosahedron, TorusKnot, Plane, Ring, Cylinder, Octahedron, Tetrahedron, Dodecahedron, Points, PointMaterial } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { fetchProfile } from '../services/profileService';
import ParticleField from './ParticleField';

// --- SPECIALIZED COMPONENTS ---

const CyberGrid = () => (
  <group>
    <Grid infiniteGrid sectionSize={1} sectionColor="#00ffff" sectionThickness={1.5} fadeDistance={30} cellColor="#008888" />
    <Float speed={2} rotationIntensity={2} floatIntensity={2}>
      <Box args={[1, 1, 1]}>
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} wireframe />
      </Box>
    </Float>
  </group>
);

const NeuralNet = () => {
  const points = useMemo(() => {
    const p = [];
    for (let i = 0; i < 50; i++) {
      p.push(new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10));
    }
    return p;
  }, []);
  
  return (
    <group>
      {points.map((p, i) => (
        <Sphere key={i} args={[0.05]} position={p}>
          <meshBasicMaterial color="#3b82f6" />
        </Sphere>
      ))}
      <Sparkles count={200} scale={10} color="#3b82f6" speed={0.5} />
    </group>
  );
};

const GalaxyCore = () => (
  <group>
    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    <Float speed={5} rotationIntensity={2}>
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={2} />
      </Sphere>
    </Float>
    <Sparkles count={1000} scale={10} color="#f59e0b" speed={2} size={3} />
  </group>
);

const BlackHole = () => (
  <group>
    <mesh>
      <sphereGeometry args={[2, 64, 64]} />
      <meshBasicMaterial color="#000" />
    </mesh>
    <Torus args={[4, 0.05, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
      <MeshDistortMaterial color="#fff" distort={0.5} speed={5} />
    </Torus>
    <Sparkles count={500} scale={15} color="#fff" speed={3} />
  </group>
);

const SolarSystem = () => (
  <group>
    <Sphere args={[1.5]}><meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1}/></Sphere>
    {Array.from({length: 5}).map((_, i) => (
      <Float key={i} speed={1 + i} rotationIntensity={1}>
        <mesh position={[(i + 2) * 2, 0, 0]}>
          <sphereGeometry args={[0.3 + Math.random() * 0.5]} />
          <meshStandardMaterial color={new THREE.Color().setHSL(Math.random(), 0.7, 0.5)} />
        </mesh>
      </Float>
    ))}
  </group>
);

const HelixDNA = () => (
  <group>
    {Array.from({ length: 40 }).map((_, i) => (
      <group key={i} position={[0, i * 0.4 - 8, 0]} rotation={[0, i * 0.5, 0]}>
        <Sphere args={[0.2]} position={[2, 0, 0]}><meshStandardMaterial color="#10b981" /></Sphere>
        <Sphere args={[0.2]} position={[-2, 0, 0]}><meshStandardMaterial color="#34d399" /></Sphere>
        <Box args={[4, 0.05, 0.05]}><meshStandardMaterial color="#666" /></Box>
      </group>
    ))}
  </group>
);

const SpringBlossom = () => (
  <group>
    <Environment preset="park" />
    <Sparkles count={100} scale={10} color="#ffb7c5" size={4} />
    {Array.from({ length: 20 }).map((_, i) => (
      <Float key={i} position={[(Math.random()-0.5)*15, (Math.random()-0.5)*10, (Math.random()-0.5)*5]}>
        <Icosahedron args={[0.2, 0]}><meshStandardMaterial color="#ffb7c5" /></Icosahedron>
      </Float>
    ))}
  </group>
);

const PortalScene = () => (
  <group>
    <Torus args={[4, 0.2, 16, 100]}>
      <MeshDistortMaterial color="#06b6d4" distort={0.5} speed={5} />
    </Torus>
    <Sparkles count={500} scale={5} color="#06b6d4" speed={2} />
    <mesh rotation={[0, 0, 0]}>
      <circleGeometry args={[3.8, 64]} />
      <meshBasicMaterial color="#000" />
    </mesh>
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
      // --- NEW UNIQUE THEMES ---
      case 'cyber_grid': return <CyberGrid />;
      case 'glass_universe': return <Float speed={2}><Sphere args={[3, 64, 64]}><meshPhysicalMaterial transmission={1} thickness={2} roughness={0} color="#fff" /></Sphere></Float>;
      case 'neural_net': return <NeuralNet />;
      case 'space_orbit': return <group><Stars /><Float speed={2}><Torus args={[5, 0.02, 16, 100]} rotation={[Math.PI/2, 0, 0]}><meshBasicMaterial color="#fff" /></Torus><Sphere args={[1]} position={[5, 0, 0]}><meshStandardMaterial color="#3b82f6" /></Sphere></Float></group>;
      case 'block_stack': return <group>{Array.from({length: 30}).map((_, i) => <Box key={i} position={[(i%5-2)*1.2, Math.floor(i/5)*1.2 - 3, 0]}><meshStandardMaterial color="#f97316" /></Box>)}</group>;
      case 'hologram': return <Float><Icosahedron args={[3, 1]}><meshStandardMaterial color="#06b6d4" wireframe emissive="#06b6d4" emissiveIntensity={2} /></Icosahedron></Float>;
      case 'tunnel': return <group rotation={[Math.PI/2, 0, 0]}>{Array.from({length: 10}).map((_, i) => <Ring key={i} args={[i*2, i*2+0.1, 64]} position={[0, 0, -i*2]}><meshBasicMaterial color="#1e3a8a" transparent opacity={0.5} /></Ring>)}</group>;
      case 'liquid_metal': return <Float><Sphere args={[3, 64, 64]}><MeshDistortMaterial color="#94a3b8" metalness={1} roughness={0} distort={0.6} speed={3} /></Sphere></Float>;
      case 'electric': return <group><Sparkles count={2000} scale={15} color="#8b5cf6" speed={10} size={2} />{Array.from({length:10}).map((_,i)=><mesh key={i} position={[(Math.random()-0.5)*10, (Math.random()-0.5)*10, (Math.random()-0.5)*10]}><boxGeometry args={[0.02, 5, 0.02]}/><meshBasicMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={5}/></mesh>)}</group>;
      case 'helix': return <HelixDNA />;
      case 'galaxy_core': return <GalaxyCore />;
      case 'warp_speed': return <group>{Array.from({length: 200}).map((_, i) => <mesh key={i} position={[(Math.random()-0.5)*20, (Math.random()-0.5)*20, (Math.random()-1)*100]}><boxGeometry args={[0.05, 0.05, 10]} /><meshBasicMaterial color="#fff" /></mesh>)}</group>;
      case 'black_hole': return <BlackHole />;
      case 'nebula': return <Cloud seed={1} scale={2} volume={10} color="#818cf8" fade={10} />;
      case 'solar_system': return <SolarSystem />;
      case 'planet_surface': return <group position={[0,-5,0]}><mesh rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[100,100,64,64]} /><meshStandardMaterial color="#ea580c" roughness={1} metalness={0}/></mesh><Stars /></group>;
      case 'space_station': return <group><Box args={[4,1,4]}><meshStandardMaterial color="#64748b" metalness={1}/></Box><Torus args={[6,0.1,16,100]} rotation={[Math.PI/2,0,0]}><meshStandardMaterial color="#94a3b8"/></Torus></group>;
      case 'constellation': return <group><Stars count={1000} /><Points><PointMaterial color="#fff" size={0.05} /></Points></group>;
      case 'telescope': return <group><Cylinder args={[1, 1, 10, 32]} rotation={[Math.PI/4, 0, 0]}><meshStandardMaterial color="#111" metalness={1}/></Cylinder><Ring args={[1.1, 1.2, 32]} position={[0, 3.5, -3.5]} rotation={[Math.PI/4, 0, 0]}><meshBasicMaterial color="#3b82f6"/></Ring></group>;
      case 'portal': return <PortalScene />;
      case 'spring_blossom': return <SpringBlossom />;
      case 'flower_field': return <group position={[0,-5,0]}>{Array.from({length: 50}).map((_,i)=><mesh key={i} position={[(Math.random()-0.5)*30, 0, (Math.random()-0.5)*30]}><cylinderGeometry args={[0.1, 0.1, 1]}/><meshStandardMaterial color="#ec4899"/></mesh>)}</group>;
      case 'breeze_leaves': return <Sparkles count={500} scale={20} color="#10b981" speed={2} size={4} />;
      case 'bloom_interact': return <Float><Icosahedron args={[3, 1]}><MeshWobbleMaterial color="#f472b6" factor={1} speed={2} /></Icosahedron></Float>;
      case 'glass_forest': return <group position={[0,-5,0]}>{Array.from({length: 20}).map((_,i)=><Cylinder key={i} args={[0.5, 0.5, 10]} position={[(Math.random()-0.5)*20, 5, (Math.random()-0.5)*20]}><meshPhysicalMaterial transmission={1} thickness={1}/></Cylinder>)}</group>;
      case 'butterfly': return <group>{Array.from({length: 10}).map((_, i) => <Float key={i} speed={5}><mesh position={[(Math.random()-0.5)*10, (Math.random()-0.5)*10, (Math.random()-0.5)*10]}><boxGeometry args={[0.5, 0.01, 0.5]} /><meshStandardMaterial color="#818cf8" /></mesh></Float>)}</group>;
      case 'spring_sky': return <group><Environment preset="sunset" /><Cloud position={[0, 0, -10]} /><Cloud position={[5, 2, -15]} /></group>;
      case 'growing_ui': return <group>{Array.from({length: 10}).map((_, i) => <Float key={i}><Box args={[1, 1, 1]} position={[0, i-5, 0]} scale={[1, 1, 1]}><meshStandardMaterial color="#22c55e" /></Box></Float>)}</group>;
      case 'layered_depth': return <group>{Array.from({length: 5}).map((_, i) => <Plane key={i} args={[20, 20]} position={[0, 0, -i*2]}><meshStandardMaterial color="#1e293b" transparent opacity={0.5} /></Plane>)}</group>;

      // --- EXISTING UNIQUE THEMES ---
      case 'code_matrix': return <group>{Array.from({ length: 40 }).map((_, i) => (<mesh key={i} position={[(Math.random()-0.5)*30, 0, (Math.random()-0.5)*10]}><boxGeometry args={[0.05, 10, 0.05]} /><meshBasicMaterial color="#00ff00" transparent opacity={0.3} /></mesh>))}</group>;
      case 'data_stream': return <group>{Array.from({length:30}).map((_,i)=><mesh key={i} position={[(Math.random()-0.5)*20, (Math.random()-0.5)*20, -5]} rotation={[0,0,Math.PI/2]}><boxGeometry args={[10,0.02,0.02]}/><meshBasicMaterial color="#3b82f6" transparent opacity={0.5}/></mesh>)}</group>;
      case 'roadmap_3d': return <group rotation={[Math.PI/4, 0, 0]}><mesh position={[0, -5, 0]}><planeGeometry args={[2, 100]} /><meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} /></mesh>{Array.from({ length: 10 }).map((_, i) => (<mesh key={i} position={[0, -4.8, i * -10]}><boxGeometry args={[2.2, 0.2, 0.5]} /><meshStandardMaterial color="#fff" /></mesh>))}</group>;
      case 'construction': return <group position={[0,-5,0]}>{Array.from({ length: 15 }).map((_, i) => (<group key={i} position={[i-7, 0, (Math.random()-0.5)*10]}><Box args={[0.5, Math.random()*10, 0.5]}><meshStandardMaterial color="#f97316" /></Box><Box args={[0.1, 10, 0.1]} position={[0, 0, 0]}><meshStandardMaterial color="#666" wireframe /></Box></group>))}</group>;
      case 'grid_cards': return <group>{Array.from({length:12}).map((_,i)=><Float key={i} position={[(i%4-1.5)*4, (Math.floor(i/4)-1)*4, 0]}><Box args={[3,4,0.1]}><meshStandardMaterial color="#222" metalness={1} roughness={0}/></Box></Float>)}</group>;
      case 'game_world': return <group position={[0,-5,0]}><mesh rotation={[-Math.PI/2,0,0]}><planeGeometry args={[30,30]}/><meshStandardMaterial color="#14532d"/></mesh>{Array.from({length:10}).map((_,i)=><mesh key={i} position={[(Math.random()-0.5)*20, 1.5, (Math.random()-0.5)*20]}><coneGeometry args={[1,3,4]}/><meshStandardMaterial color="#064e3b"/></mesh>)}</group>;
      case 'tech_lab': return <group>{Array.from({length:5}).map((_,i)=><Float key={i}><TorusKnot args={[1, 0.3, 128, 32]} position={[(i-2)*5, 0, 0]}><meshStandardMaterial color="#666" metalness={1}/></TorusKnot></Float>)}</group>;
      case 'stage_spot': return <group position={[0,-5,0]}><mesh rotation={[-Math.PI/2,0,0]}><planeGeometry args={[50,50]}/><meshStandardMaterial color="#050505"/></mesh><spotLight position={[0,10,0]} angle={0.3} penumbra={1} intensity={10} color="#fff" castShadow /></group>;
      case 'puzzle_ui': return <group>{Array.from({length:20}).map((_,i)=><Float key={i}><Box args={[1,1,1]} position={[(Math.random()-0.5)*10,(Math.random()-0.5)*10,(Math.random()-0.5)*5]}><meshStandardMaterial color={i%2===0?"#ef4444":"#111"}/></Box></Float>)}</group>;
      case 'book_flip': return <group>{Array.from({length:6}).map((_,i)=><Float key={i} rotation={[0, i*0.5, 0]}><Box args={[4,6,0.05]} position={[2,0,0]}><meshStandardMaterial color="#451a03"/></Box></Float>)}</group>;
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

  const getConfig = (t) => {
    const map = {
      cyber_grid: { bg: "#000", env: "city" },
      glass_universe: { bg: "#0a0a2e", env: "studio" },
      neural_net: { bg: "#020617", env: "city" },
      space_orbit: { bg: "#000", env: "night" },
      block_stack: { bg: "#431407", env: "apartment" },
      hologram: { bg: "#000", env: "city" },
      tunnel: { bg: "#001", env: "night" },
      liquid_metal: { bg: "#1e293b", env: "studio" },
      electric: { bg: "#0f172a", env: "city" },
      helix: { bg: "#064e3b", env: "park" },
      galaxy_core: { bg: "#000", env: "night" },
      warp_speed: { bg: "#000", env: "night" },
      black_hole: { bg: "#000", env: "night" },
      nebula: { bg: "#0a0a2e", env: "night" },
      solar_system: { bg: "#000", env: "night" },
      planet_surface: { bg: "#431407", env: "sunset" },
      space_station: { bg: "#0f172a", env: "city" },
      constellation: { bg: "#000", env: "night" },
      telescope: { bg: "#020617", env: "night" },
      portal: { bg: "#083344", env: "city" },
      spring_blossom: { bg: "#064e3b", env: "park" },
      flower_field: { bg: "#500724", env: "park" },
      breeze_leaves: { bg: "#064e3b", env: "park" },
      bloom_interact: { bg: "#000", env: "studio" },
      glass_forest: { bg: "#022c22", env: "park" },
      butterfly: { bg: "#1e1b4b", env: "sunset" },
      spring_sky: { bg: "#0c4a6e", env: "sunset" },
      growing_ui: { bg: "#052e16", env: "park" },
      water_garden: { bg: "#083344", env: "park" },
      sakura_exp: { bg: "#500724", env: "sunset" },
      data_stream: { bg: "#020617", env: "city" },
      layered_depth: { bg: "#0f172a", env: "studio" },
      code_matrix: { bg: "#000", env: "city" },
      grid_cards: { bg: "#431407", env: "apartment" },
      game_world: { bg: "#064e3b", env: "park" },
      tech_lab: { bg: "#1e293b", env: "studio" },
      luxury_dark: { bg: "#000", env: "studio" },
      bento_3d: { bg: "#f1f5f9", env: "studio" },
      fluid_wave: { bg: "#0c4a6e", env: "sunset" },
      cube_nav: { bg: "#1e1b4b", env: "city" },
      museum_walk: { bg: "#1c1917", env: "studio" },
      roadmap_3d: { bg: "#431407", env: "sunset" },
      mini_city: { bg: "#0c4a6e", env: "city" },
      stage_spot: { bg: "#000", env: "studio" },
      puzzle_ui: { bg: "#450a0a", env: "apartment" },
      book_flip: { bg: "#431407", env: "studio" },
      brain_idea: { bg: "#2e1065", env: "city" },
      construction: { bg: "#431407", env: "apartment" },
      ice_crystal: { bg: "#001a1a", env: "studio" },
      fire_ember: { bg: "#1a0500", env: "night" },
    };
    return map[t] || { bg: "#050505", env: "city" };
  };

  const config = getConfig(theme);

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



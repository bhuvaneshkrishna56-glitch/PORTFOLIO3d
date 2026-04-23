import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Float, MeshDistortMaterial, Sparkles, Stars, Cloud, Box, Center, MeshWobbleMaterial } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { fetchProfile } from '../services/profileService';
import ParticleField from './ParticleField';
import FloatingShapes from './FloatingShapes';

// --- Specialized Tech & UI Components ---

const DataStream = () => {
  const group = useRef();
  useFrame((state) => {
    group.current.children.forEach((c, i) => {
      c.position.y -= 0.1;
      if (c.position.y < -15) c.position.y = 15;
    });
  });
  return (
    <group ref={group}>
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 10]}>
          <boxGeometry args={[0.02, 2, 0.02]} />
          <meshBasicMaterial color="#0066ff" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
};

const CodeMatrix = () => {
  const group = useRef();
  useFrame(() => {
    group.current.children.forEach((c) => {
      c.position.y -= 0.2;
      if (c.position.y < -20) c.position.y = 20;
    });
  });
  return (
    <group ref={group}>
      {Array.from({ length: 100 }).map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20]}>
          <planeGeometry args={[0.1, 0.5]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
};

const InteractiveCube = () => {
  const cube = useRef();
  useFrame((state) => {
    cube.current.rotation.x = state.clock.elapsedTime * 0.5;
    cube.current.rotation.y = state.clock.elapsedTime * 0.3;
  });
  return (
    <mesh ref={cube}>
      <boxGeometry args={[5, 5, 5]} />
      <meshStandardMaterial color="#6c63ff" wireframe />
    </mesh>
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
    code_matrix: { bg: "#000", color: "#00ff00" },
    data_stream: { bg: "#000", color: "#0066ff" },
    luxury_dark: { bg: "#000", color: "#d4af37" },
    fluid_wave: { bg: "#05051a", color: "#00d4ff" },
    cube_nav: { bg: "#05001a", color: "#6c63ff" }
  }[theme] || { bg: "#050505", color: "#fff" };

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} className="w-full h-full">
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
      <color attach="background" args={[config.bg]} />
      
      <Suspense fallback={null}>
        <ParticleField count={800} theme={theme} />

        {/* --- Tech & UI Collection (Themes 31-40) --- */}
        {theme === 'code_matrix' && <CodeMatrix />}
        {theme === 'data_stream' && <DataStream />}
        {theme === 'cube_nav' && <InteractiveCube />}
        {theme === 'fluid_wave' && (
           <mesh rotation={[-Math.PI / 2, 0, 0]}>
             <planeGeometry args={[50, 50, 32, 32]} />
             <MeshDistortMaterial color="#001144" speed={3} distort={0.3} metalness={1} />
           </mesh>
        )}
        {theme === 'luxury_dark' && (
           <Float speed={2}><mesh><sphereGeometry args={[4, 64, 64]} /><meshStandardMaterial color="#111" metalness={1} roughness={0.1} emissive="#d4af37" emissiveIntensity={0.2} /></mesh></Float>
        )}

        {/* --- Legacy Collections (Themes 1-30) --- */}
        {theme === 'galaxy_core' && <Stars radius={100} depth={50} count={5000} factor={4} />}
        {theme === 'spring_blossom' && <Sparkles count={100} scale={10} color="#ffb7c5" />}
        {theme === 'cyber_grid' && <Grid infiniteGrid fadeDistance={40} cellColor="#00ffff" />}

        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color={config.color} />
      </Suspense>

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
};

export default HeroScene;

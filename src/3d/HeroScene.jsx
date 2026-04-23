import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Float, MeshDistortMaterial, Sparkles, Stars, Cloud, Torus, Center } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { fetchProfile } from '../services/profileService';
import ParticleField from './ParticleField';
import FloatingShapes from './FloatingShapes';

// --- Specialized Nature Components ---

const SakuraPetals = ({ count = 100, color = "#ffb7c5" }) => {
  const petals = useRef();
  const data = useMemo(() => Array.from({ length: count }).map(() => ({
    pos: [(Math.random() - 0.5) * 20, Math.random() * 20, (Math.random() - 0.5) * 20],
    spin: Math.random() * 0.05,
    speed: Math.random() * 0.02 + 0.01
  })), [count]);

  useFrame(() => {
    petals.current.children.forEach((p, i) => {
      p.position.y -= data[i].speed;
      p.rotation.x += data[i].spin;
      p.rotation.z += data[i].spin;
      if (p.position.y < -10) p.position.y = 10;
    });
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

const ButterflyField = () => {
  const group = useRef();
  useFrame((state) => {
    group.current.rotation.y += 0.005;
    group.current.children.forEach((b, i) => {
      b.position.y += Math.sin(state.clock.elapsedTime + i) * 0.01;
    });
  });
  return (
    <group ref={group}>
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10]}>
          <boxGeometry args={[0.2, 0.01, 0.2]} />
          <meshStandardMaterial color="#8800ff" emissive="#8800ff" emissiveIntensity={2} />
        </mesh>
      ))}
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
  }, []);

  const config = {
    spring_blossom: { bg: "#001a05", color: "#ffb7c5" },
    water_garden: { bg: "#001a1a", color: "#00ffff" },
    butterfly: { bg: "#05001a", color: "#8800ff" },
    glass_forest: { bg: "#001000", color: "#00ff88" },
    sakura_exp: { bg: "#000", color: "#ffb7c5" }
  }[theme] || { bg: "#050505", color: "#fff" };

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} className="w-full h-full">
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
      <color attach="background" args={[config.bg]} />
      
      <Suspense fallback={null}>
        <ParticleField count={1000} theme={theme} />

        {/* --- Nature Collection (Themes 21-30) --- */}
        {(theme === 'spring_blossom' || theme === 'sakura_exp') && <SakuraPetals count={theme === 'sakura_exp' ? 300 : 100} />}
        {theme === 'butterfly' && <ButterflyField />}
        {theme === 'water_garden' && (
           <group position={[0, -5, 0]}>
             <mesh rotation={[-Math.PI / 2, 0, 0]}>
               <planeGeometry args={[50, 50]} />
               <MeshDistortMaterial color="#002222" speed={2} distort={0.2} metalness={1} roughness={0} />
             </mesh>
           </group>
        )}
        {theme === 'spring_sky' && (
          <>
            <Cloud opacity={0.8} speed={0.4} width={20} depth={2} segments={20} color="#fff" />
            <Float speed={2}><mesh position={[0, 2, 0]}><coneGeometry args={[2, 4, 4]} /><meshStandardMaterial color="green" /></mesh></Float>
          </>
        )}

        {/* --- Space & Tech Categories (Themes 1-20) --- */}
        {theme === 'galaxy_core' && <Grid infiniteGrid fadeDistance={40} cellColor="#3300ff" />}
        {theme === 'warp_speed' && <Sparkles count={500} scale={30} size={10} speed={4} />}
        {theme === 'black_hole' && <Torus args={[4, 0.5, 16, 100]}><meshStandardMaterial color="#ff5e00" emissive="#ff5e00" emissiveIntensity={5} /></Torus>}

        <Environment preset="park" />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color={config.color} />
      </Suspense>

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
};

export default HeroScene;

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Grid, Float, MeshDistortMaterial, MeshWobbleMaterial, Sparkles, Stars, Cloud, Torus } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { fetchProfile } from '../services/profileService';
import ParticleField from './ParticleField';
import FloatingShapes from './FloatingShapes';

// --- Specialized Space Components ---

const GalaxyCore = () => {
  const points = useRef();
  const count = 3000;
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 20;
      const r = (i / count) * 10 + Math.random() * 2;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 2] = Math.sin(angle) * r;
      const c = new THREE.Color().setHSL(0.6 + Math.random() * 0.1, 0.8, 0.8);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);
  useFrame((state) => { points.current.rotation.y += 0.001; });
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.6} blending={THREE.AdditiveBlending} />
    </points>
  );
};

const BlackHole = () => {
  const disk = useRef();
  useFrame((state) => { disk.current.rotation.z += 0.01; });
  return (
    <group>
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial color="black" />
      </mesh>
      <mesh ref={disk} rotation={[Math.PI / 2.1, 0, 0]}>
        <torusGeometry args={[3.5, 0.8, 16, 100]} />
        <MeshDistortMaterial color="#ff5e00" speed={5} distort={0.5} emissive="#ff5e00" emissiveIntensity={2} />
      </mesh>
    </group>
  );
};

const WarpSpeed = () => {
  const group = useRef();
  const count = 200;
  const lines = useMemo(() => Array.from({ length: count }).map(() => ({
    pos: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 100],
    scale: Math.random() * 10 + 5
  })), []);
  useFrame((state) => {
    group.current.children.forEach((line) => {
      line.position.z += 1.5;
      if (line.position.z > 20) line.position.z = -80;
    });
  });
  return (
    <group ref={group}>
      {lines.map((l, i) => (
        <mesh key={i} position={l.pos} scale={[0.02, 0.02, l.scale]}>
          <boxGeometry />
          <meshBasicMaterial color="#fff" />
        </mesh>
      ))}
    </group>
  );
};

const CosmicPortal = () => {
  const ring = useRef();
  useFrame((state) => { ring.current.rotation.z += 0.02; });
  return (
    <group>
      <mesh ref={ring}>
        <torusGeometry args={[4, 0.1, 16, 100]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={5} />
      </mesh>
      <Sparkles count={100} scale={8} size={4} color="#00ffff" />
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
    galaxy_core: { bg: "#000005" },
    warp_speed: { bg: "#000" },
    black_hole: { bg: "#000" },
    nebula: { bg: "#050010" },
    portal: { bg: "#000" }
  }[theme] || { bg: "#050505" };

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} className="w-full h-full">
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
      <color attach="background" args={[config.bg]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#fff" />

      <Suspense fallback={null}>
        <ParticleField count={1500} theme={theme} />

        {/* Multiverse Selection (20 Themes) */}
        {theme === 'galaxy_core' && <GalaxyCore />}
        {theme === 'black_hole' && <BlackHole />}
        {theme === 'warp_speed' && <WarpSpeed />}
        {theme === 'portal' && <CosmicPortal />}
        {theme === 'nebula' && (
           <>
             <Cloud opacity={0.5} speed={0.4} width={10} depth={1.5} segments={20} color="#3c00ff" />
             <Cloud opacity={0.3} speed={0.4} width={10} depth={2} segments={20} position={[5, 2, -5]} color="#ff00ff" />
           </>
        )}
        
        {/* Fallbacks for older themes */}
        {(['cyber_grid', 'hologram', 'electric'].includes(theme)) && (
          <>
            <Grid infiniteGrid fadeDistance={40} cellColor="#00ffff" sectionColor="#ff00ff" />
            <FloatingShapes theme="cyber" />
          </>
        )}
        {(['glass_universe', 'liquid_metal', 'telescope'].includes(theme)) && (
           <FloatingShapes theme={theme === 'liquid_metal' ? 'abstract' : 'cosmic'} />
        )}
        {theme === 'neural_net' && <Sparkles count={100} scale={20} size={2} color="#00d4ff" />}
        {theme === 'space_orbit' && <Stars radius={100} depth={50} count={5000} factor={4} />}

        <Environment preset="city" />
      </Suspense>

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
};

export default HeroScene;

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Grid, Float, MeshDistortMaterial, MeshWobbleMaterial, Sparkles, Stars, MeshRefractionMaterial } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { fetchProfile } from '../services/profileService';
import ParticleField from './ParticleField';
import FloatingShapes from './FloatingShapes';

// --- Specialized Theme Components ---

const NeuralNetwork = () => {
  const group = useRef();
  const nodes = useMemo(() => {
    return Array.from({ length: 40 }).map(() => ({
      position: [(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15],
      size: Math.random() * 0.2 + 0.1
    }));
  }, []);

  useFrame((state) => {
    group.current.rotation.y += 0.002;
  });

  return (
    <group ref={group}>
      {nodes.map((node, i) => (
        <mesh key={i} position={node.position}>
          <sphereGeometry args={[node.size, 16, 16]} />
          <meshBasicMaterial color="#00d4ff" />
        </mesh>
      ))}
      <lineSegments>
        <bufferGeometry>
          {/* Simple lines connecting nodes could be added here for full neural effect */}
        </bufferGeometry>
        <lineBasicMaterial color="#00d4ff" opacity={0.2} transparent />
      </lineSegments>
    </group>
  );
};

const DNAHelix = () => {
  const group = useRef();
  const count = 40;
  const radius = 2;
  const height = 15;

  useFrame((state) => {
    group.current.rotation.y += 0.01;
  });

  return (
    <group ref={group}>
      {Array.from({ length: count }).map((_, i) => {
        const y = (i / count - 0.5) * height;
        const angle = (i / count) * Math.PI * 4;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <group key={i} position={[x, y, z]}>
            <mesh>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} />
            </mesh>
            <mesh position={[-x * 2, 0, -z * 2]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const MouseLight = ({ color = "#6c63ff" }) => {
  const lightRef = useRef();
  useFrame((state) => {
    const { x, y } = state.mouse;
    if (lightRef.current) {
      lightRef.current.position.set(x * 10, y * 10, 5);
    }
  });
  return <spotLight ref={lightRef} intensity={20} distance={30} angle={0.5} penumbra={1} color={color} />;
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

  const themeConfig = {
    cyber_grid: { color1: "#00ffff", color2: "#ff00ff", bg: "#000000" },
    glass_universe: { color1: "#6c63ff", color2: "#00d4ff", bg: "#050505" },
    neural_net: { color1: "#00d4ff", color2: "#00ff88", bg: "#0a0a1a" },
    space_orbit: { color1: "#ffffff", color2: "#ffffff", bg: "#000000" },
    block_stack: { color1: "#ff6b6b", color2: "#ffa502", bg: "#1e1e1e" },
    hologram: { color1: "#00ffff", color2: "#00ffff", bg: "#000000" },
    tunnel: { color1: "#0033ff", color2: "#000000", bg: "#000000" },
    liquid_metal: { color1: "#ffffff", color2: "#a0a0a0", bg: "#111111" },
    electric: { color1: "#7d5fff", color2: "#32ff7e", bg: "#000000" },
    helix: { color1: "#2ecc71", color2: "#3498db", bg: "#0a1a0a" }
  };

  const config = themeConfig[theme] || themeConfig.glass_universe;

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} className="w-full h-full">
      <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={50} />
      
      <color attach="background" args={[config.bg]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color={config.color1} />
      <pointLight position={[-10, -10, -10]} intensity={1} color={config.color2} />
      <MouseLight color={config.color1} />

      <Suspense fallback={null}>
        {/* Universal Particles with Theme-Specific Colors */}
        <ParticleField count={2000} theme={theme} />

        {/* Theme-Specific Content */}
        {theme === 'cyber_grid' && (
          <>
            <Grid infiniteGrid fadeDistance={40} cellColor={config.color1} sectionColor={config.color2} />
            <FloatingShapes theme="cyber" />
          </>
        )}

        {theme === 'glass_universe' && (
           <FloatingShapes theme="cosmic" />
        )}

        {theme === 'neural_net' && (
          <>
            <NeuralNetwork />
            <Sparkles count={50} scale={20} size={2} color={config.color1} />
          </>
        )}

        {theme === 'space_orbit' && (
          <>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Float speed={2}>
               <mesh position={[5, 2, -10]}>
                 <sphereGeometry args={[2, 64, 64]} />
                 <meshStandardMaterial color="#444" roughness={1} />
               </mesh>
            </Float>
          </>
        )}

        {theme === 'hologram' && (
          <group>
            <FloatingShapes theme="cyber" />
            <Grid infiniteGrid sectionThickness={0} cellThickness={1} cellColor="#00ffff" opacity={0.1} />
          </group>
        )}

        {theme === 'helix' && <DNAHelix />}

        {theme === 'liquid_metal' && (
          <Float speed={5} rotationIntensity={2}>
             <mesh>
               <sphereGeometry args={[3, 128, 128]} />
               <MeshDistortMaterial color="#fff" speed={5} distort={0.6} metalness={1} roughness={0} />
             </mesh>
          </Float>
        )}

        {theme === 'block_stack' && <FloatingShapes theme="voxel" />}

        {theme === 'electric' && (
          <>
            <Sparkles count={200} scale={20} size={6} speed={3} color={config.color1} />
            <FloatingShapes theme="cyber" />
          </>
        )}

        {theme === 'tunnel' && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[5, 5, 50, 32, 1, true]} />
            <meshStandardMaterial color={config.color1} wireframe />
          </mesh>
        )}

        <Environment preset="city" />
      </Suspense>

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
};

export default HeroScene;

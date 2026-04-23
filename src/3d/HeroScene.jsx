import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Grid } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState } from 'react';
import FloatingShapes from './FloatingShapes';
import ParticleField from './ParticleField';
import { fetchProfile } from '../services/profileService';
import { useFrame } from '@react-three/fiber';

const MouseLight = ({ color = "#6c63ff" }) => {
  const lightRef = useRef();
  useFrame((state) => {
    const { x, y } = state.mouse;
    if (lightRef.current) {
      lightRef.current.position.set(x * 10, y * 10, 5);
    }
  });
  return <spotLight ref={lightRef} intensity={15} distance={20} angle={0.5} penumbra={1} color={color} />;
};

const HeroScene = () => {
  const [theme, setTheme] = useState('cosmic');

  useEffect(() => {
    const getTheme = async () => {
      const { profile } = await fetchProfile();
      if (profile?.active_theme) setTheme(profile.active_theme);
    };
    getTheme();
  }, []);

  // Theme lighting config
  const themeConfig = {
    cosmic: { light1: "#00d4ff", light2: "#ff6b9d", mouseLight: "#6c63ff" },
    cyber: { light1: "#00ff00", light2: "#ffff00", mouseLight: "#00ffff" },
    voxel: { light1: "#ff4d4d", light2: "#ffd11a", mouseLight: "#ff944d" },
    abstract: { light1: "#ffffff", light2: "#a0a0a0", mouseLight: "#ffffff" },
    luxury: { light1: "#d4af37", light2: "#ffd700", mouseLight: "#ffffff" }
  };

  const config = themeConfig[theme] || themeConfig.cosmic;

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} className="w-full h-full">
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
      
      <ambientLight intensity={theme === 'luxury' ? 0.2 : 0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color={config.light1} />
      <pointLight position={[-10, -10, -10]} intensity={1} color={config.light2} />
      <MouseLight color={config.mouseLight} />

      <Suspense fallback={null}>
        <ParticleField count={theme === 'cosmic' ? 3000 : 1000} />
        <FloatingShapes theme={theme} />
        
        {theme === 'cyber' && (
           <Grid infiniteGrid fadeDistance={30} cellColor={config.light1} sectionColor={config.mouseLight} />
        )}
        
        <Environment preset="city" />
        <ContactShadows position={[0, -4.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
      </Suspense>

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
};

export default HeroScene;

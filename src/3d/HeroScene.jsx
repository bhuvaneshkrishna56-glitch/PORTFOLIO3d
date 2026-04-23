import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, SpotLight } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import FloatingShapes from './FloatingShapes';
import ParticleField from './ParticleField';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const MouseLight = () => {
  const lightRef = useRef();
  
  useFrame((state) => {
    const { x, y } = state.mouse;
    if (lightRef.current) {
      // Light follows mouse for dynamic shadows
      lightRef.current.position.set(x * 10, y * 10, 5);
    }
  });

  return (
    <spotLight
      ref={lightRef}
      intensity={15}
      distance={20}
      angle={0.5}
      penumbra={1}
      color="#6c63ff"
    />
  );
};

const HeroScene = () => {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      className="w-full h-full"
    >
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
      
      {/* Lighting System */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00d4ff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ff6b9d" />
      <MouseLight />

      {/* Background Ambience */}
      <Suspense fallback={null}>
        <ParticleField count={3000} />
        <FloatingShapes />
        <Environment preset="city" />
        <ContactShadows
          position={[0, -4.5, 0]}
          opacity={0.4}
          scale={20}
          blur={2}
          far={4.5}
        />
      </Suspense>

      {/* Interactions */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        enableRotate={true}
        rotateSpeed={0.5}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
};

export default HeroScene;

import { Suspense, lazy } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Preload } from '@react-three/drei';

// Lazy load 3D components for performance
const ParticleField = lazy(() => import('./ParticleField'));
const FloatingShapes = lazy(() => import('./FloatingShapes'));

/**
 * Main 3D Hero Scene
 * Contains the interactive Three.js canvas with floating shapes and particles
 * Camera is positioned for an optimal viewing angle
 */
const HeroScene = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]} // Limit pixel ratio for performance
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        {/* Ambient & directional lighting for metallic materials */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
        <directionalLight position={[-5, -3, -5]} intensity={0.3} color="#6c63ff" />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#00d4ff" />

        <Suspense fallback={null}>
          <ParticleField count={400} />
          <FloatingShapes />
          <Preload all />
        </Suspense>

        {/* Orbit controls with limits to prevent disorienting camera movement */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
};

export default HeroScene;

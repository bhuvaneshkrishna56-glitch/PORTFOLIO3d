import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';

/**
 * Floating 3D geometric shapes representing skills/projects
 * Each shape floats independently with distortion effects
 */

const FloatingShape = ({ position, color, speed = 1, distort = 0.3, scale = 1, geometry = 'sphere' }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation based on elapsed time
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.3) * 0.2;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * speed * 0.2) * 0.2;
    }
  });

  const renderGeometry = () => {
    switch (geometry) {
      case 'torus':
        return <torusGeometry args={[1, 0.4, 16, 32]} />;
      case 'octahedron':
        return <octahedronGeometry args={[1, 0]} />;
      case 'icosahedron':
        return <icosahedronGeometry args={[1, 0]} />;
      case 'torusKnot':
        return <torusKnotGeometry args={[0.8, 0.3, 100, 16]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[1, 0]} />;
      default:
        return <sphereGeometry args={[1, 32, 32]} />;
    }
  };

  return (
    <Float
      speed={speed}
      rotationIntensity={0.5}
      floatIntensity={1.5}
      floatingRange={[-0.3, 0.3]}
    >
      <mesh ref={meshRef} position={position} scale={scale}>
        {renderGeometry()}
        <MeshDistortMaterial
          color={color}
          roughness={0.1}
          metalness={0.8}
          distort={distort}
          speed={2}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
};

/**
 * Collection of floating shapes for the hero scene
 */
const FloatingShapes = () => {
  const shapes = [
    { position: [-3, 2, -2], color: '#6c63ff', speed: 1.2, distort: 0.4, scale: 0.8, geometry: 'sphere' },
    { position: [3.5, -1, -3], color: '#00d4ff', speed: 0.8, distort: 0.3, scale: 0.6, geometry: 'octahedron' },
    { position: [-2, -2, -1], color: '#ff6b9d', speed: 1.5, distort: 0.25, scale: 0.5, geometry: 'torus' },
    { position: [2, 1.5, -4], color: '#6c63ff', speed: 1.0, distort: 0.35, scale: 0.7, geometry: 'icosahedron' },
    { position: [0, -3, -2], color: '#00d4ff', speed: 0.6, distort: 0.2, scale: 0.4, geometry: 'torusKnot' },
    { position: [-4, 0, -5], color: '#ff6b9d', speed: 0.9, distort: 0.3, scale: 0.55, geometry: 'dodecahedron' },
  ];

  return (
    <group>
      {shapes.map((props, i) => (
        <FloatingShape key={i} {...props} />
      ))}
    </group>
  );
};

export default FloatingShapes;

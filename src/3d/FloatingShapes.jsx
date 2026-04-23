import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

const Shape = ({ position, color, type, speed = 1, distort = 0.4 }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.cos(time / 4) * 0.2;
      meshRef.current.rotation.y = Math.sin(time / 4) * 0.2;
      
      // Gentle floating up and down
      meshRef.current.position.y += Math.sin(time * speed) * 0.002;
    }
  });

  return (
    <Float speed={speed * 2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        {type === 'sphere' && <sphereGeometry args={[1, 64, 64]} />}
        {type === 'torus' && <torusGeometry args={[0.7, 0.3, 32, 100]} />}
        {type === 'box' && <boxGeometry args={[1.2, 1.2, 1.2]} />}
        
        <MeshDistortMaterial
          color={color}
          speed={speed * 1.5}
          distort={distort}
          radius={1}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.7}
          envMapIntensity={2}
        />
      </mesh>
    </Float>
  );
};

const FloatingShapes = () => {
  return (
    <group>
      {/* Primary Hero Shapes */}
      <Shape position={[-4, 2, -5]} color="#6c63ff" type="sphere" speed={1} distort={0.5} />
      <Shape position={[4, -1, -4]} color="#00d4ff" type="torus" speed={1.2} distort={0.3} />
      <Shape position={[-2, -3, -6]} color="#ff6b9d" type="box" speed={0.8} distort={0.2} />
      
      {/* Background Subtle Shapes */}
      <Shape position={[6, 4, -10]} color="#6c63ff" type="sphere" speed={0.5} distort={0.4} />
      <Shape position={[-7, -2, -8]} color="#00d4ff" type="torus" speed={0.4} distort={0.2} />
    </group>
  );
};

export default FloatingShapes;

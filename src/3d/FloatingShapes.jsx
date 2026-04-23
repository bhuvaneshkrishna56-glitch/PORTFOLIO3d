import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

const Shape = ({ position, color, type, speed = 1, distort = 0.4, theme }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.cos(time / 4) * 0.2;
      meshRef.current.rotation.y = Math.sin(time / 4) * 0.2;
      meshRef.current.position.y += Math.sin(time * speed) * 0.002;
    }
  });

  const getMaterial = () => {
    if (theme === 'cyber') {
      return (
        <meshStandardMaterial
          color={color}
          wireframe
          emissive={color}
          emissiveIntensity={2}
        />
      );
    }
    if (theme === 'abstract') {
      return <MeshWobbleMaterial color={color} speed={speed * 2} factor={0.6} roughness={0} />;
    }
    return (
      <MeshDistortMaterial
        color={color}
        speed={speed * 1.5}
        distort={distort}
        radius={1}
        roughness={0.1}
        metalness={0.8}
        transparent
        opacity={0.7}
      />
    );
  };

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
        {getMaterial()}
      </mesh>
    </Float>
  );
};

const FloatingShapes = ({ theme = 'cosmic' }) => {
  // Theme-specific colors
  const themeColors = {
    cosmic: ['#6c63ff', '#00d4ff', '#ff6b9d'],
    cyber: ['#00ff00', '#00ffff', '#ffff00'],
    voxel: ['#ff4d4d', '#ff944d', '#ffd11a'],
    abstract: ['#e0e0e0', '#ffffff', '#a0a0a0'],
    luxury: ['#d4af37', '#ffffff', '#ffd700']
  };

  const colors = themeColors[theme] || themeColors.cosmic;

  return (
    <group>
      <Shape position={[-4, 2, -5]} color={colors[0]} type="sphere" theme={theme} />
      <Shape position={[4, -1, -4]} color={colors[1]} type="torus" theme={theme} />
      <Shape position={[-2, -3, -6]} color={colors[2]} type={theme === 'voxel' ? 'box' : 'box'} theme={theme} />
      
      {/* Background Subtle Shapes */}
      <Shape position={[6, 4, -10]} color={colors[0]} type="sphere" speed={0.5} theme={theme} />
      <Shape position={[-7, -2, -8]} color={colors[1]} type="torus" speed={0.4} theme={theme} />
    </group>
  );
};

export default FloatingShapes;

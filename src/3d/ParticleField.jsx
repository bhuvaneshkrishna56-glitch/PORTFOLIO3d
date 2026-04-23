import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleField = ({ count = 2000, theme = 'cosmic' }) => {
  const points = useRef();

  // Theme-specific particle colors
  const themeParticleColors = {
    cosmic: ['#6c63ff', '#00d4ff', '#ffffff'],
    cyber: ['#00ff00', '#00ffff', '#003300'],
    voxel: ['#ff4d4d', '#ffd11a', '#ff944d'],
    abstract: ['#ffffff', '#a0a0a0', '#e0e0e0'],
    luxury: ['#d4af37', '#ffd700', '#000000']
  };

  const selectedColors = themeParticleColors[theme] || themeParticleColors.cosmic;

  // Create random positions and colors for the particles
  const [particles, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colorValues = new Float32Array(count * 3);
    const colorOptions = selectedColors.map(c => new THREE.Color(c));

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      colorValues[i * 3] = color.r;
      colorValues[i * 3 + 1] = color.g;
      colorValues[i * 3 + 2] = color.b;
    }
    return [positions, colorValues];
  }, [count, theme]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (points.current) {
      points.current.rotation.y = time * 0.05;
      points.current.rotation.x = time * 0.02;
      
      const positions = points.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += Math.sin(time + positions[i * 3]) * 0.001;
      }
      points.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ParticleField;

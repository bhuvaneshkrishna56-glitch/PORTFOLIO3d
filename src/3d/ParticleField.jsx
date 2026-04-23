import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleField = ({ count = 2000 }) => {
  const points = useRef();

  // Create random positions and colors for the particles
  const [particles, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colorValues = new Float32Array(count * 3);
    const colorOptions = [new THREE.Color('#6c63ff'), new THREE.Color('#00d4ff'), new THREE.Color('#ffffff')];

    for (let i = 0; i < count; i++) {
      // Random position in a large cube
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      // Randomly select from theme colors
      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      colorValues[i * 3] = color.r;
      colorValues[i * 3 + 1] = color.g;
      colorValues[i * 3 + 2] = color.b;
    }
    return [positions, colorValues];
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (points.current) {
      // Rotate the entire field slowly
      points.current.rotation.y = time * 0.05;
      points.current.rotation.x = time * 0.02;
      
      // Add a slight wave effect
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

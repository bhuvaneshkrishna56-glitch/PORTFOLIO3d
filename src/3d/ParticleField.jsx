import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Animated particle field that fills the background of the 3D scene
 * Creates a starfield effect with slowly rotating particles
 */
const ParticleField = ({ count = 500 }) => {
  const meshRef = useRef();

  // Generate particle positions once using useMemo to avoid re-computation
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Spread particles in a large sphere
      temp[i3] = (Math.random() - 0.5) * 30;
      temp[i3 + 1] = (Math.random() - 0.5) * 30;
      temp[i3 + 2] = (Math.random() - 0.5) * 30;

      // Vary colors between accent-primary (#6c63ff) and accent-secondary (#00d4ff)
      const mix = Math.random();
      colors[i3] = THREE.MathUtils.lerp(0.424, 0.0, mix);     // R
      colors[i3 + 1] = THREE.MathUtils.lerp(0.388, 0.831, mix); // G
      colors[i3 + 2] = THREE.MathUtils.lerp(1.0, 1.0, mix);     // B

      sizes[i] = Math.random() * 0.05 + 0.01;
    }

    return { positions: temp, colors, sizes };
  }, [count]);

  // Slowly rotate the entire particle system each frame
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.03;
      meshRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particles.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ParticleField;

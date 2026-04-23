import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleField = ({ count = 2000, theme = 'glass_universe' }) => {
  const points = useRef();

  // Theme-specific particle colors for 10 themes
  const themeParticleColors = {
    cyber_grid: ['#00ffff', '#ff00ff', '#000000'],
    glass_universe: ['#6c63ff', '#00d4ff', '#ffffff'],
    neural_net: ['#00d4ff', '#00ff88', '#ffffff'],
    space_orbit: ['#ffffff', '#fff', '#aaa'],
    block_stack: ['#ff6b6b', '#ffa502', '#ffffff'],
    hologram: ['#00ffff', '#00ffff', '#ffffff'],
    tunnel: ['#0033ff', '#000', '#001144'],
    liquid_metal: ['#ffffff', '#a0a0a0', '#eee'],
    electric: ['#7d5fff', '#32ff7e', '#ffffff'],
    helix: ['#2ecc71', '#3498db', '#ffffff']
  };

  const selectedColors = themeParticleColors[theme] || themeParticleColors.glass_universe;

  const [particles, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colorValues = new Float32Array(count * 3);
    const colorOptions = selectedColors.map(c => new THREE.Color(c));

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 35;

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
      points.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particles.length / 3} array={particles} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} vertexColors transparent opacity={0.4} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
};

export default ParticleField;

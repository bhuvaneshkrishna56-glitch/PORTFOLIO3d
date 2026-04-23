import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleField = ({ count = 2000, theme = 'glass_universe' }) => {
  const points = useRef();

  // Mapping for all 30 themes
  const themeParticleColors = {
    cyber_grid: ['#00ffff', '#ff00ff'],
    glass_universe: ['#6c63ff', '#00d4ff'],
    neural_net: ['#00d4ff', '#00ff88'],
    space_orbit: ['#ffffff', '#ffffff'],
    block_stack: ['#ff6b6b', '#ffa502'],
    hologram: ['#00ffff', '#00ffff'],
    tunnel: ['#0033ff', '#000'],
    liquid_metal: ['#ffffff', '#a0a0a0'],
    electric: ['#7d5fff', '#32ff7e'],
    helix: ['#2ecc71', '#3498db'],
    
    // Space
    galaxy_core: ['#6c63ff', '#00d4ff'],
    warp_speed: ['#ffffff', '#ffffff'],
    black_hole: ['#ff5e00', '#ff0000'],
    nebula: ['#3c00ff', '#ff00ff'],
    solar_system: ['#ffffff', '#ffd700'],
    planet_surface: ['#ff944d', '#ff4d4d'],
    space_station: ['#00ffff', '#ffffff'],
    constellation: ['#ffffff', '#ffffff'],
    telescope: ['#ffffff', '#ffffff'],
    portal: ['#00ffff', '#ffffff'],

    // Nature
    spring_blossom: ['#ffb7c5', '#ff6b9d'],
    flower_field: ['#ffb7c5', '#ffff00'],
    breeze_leaves: ['#00ff88', '#004411'],
    bloom_interact: ['#ffb7c5', '#ffffff'],
    glass_forest: ['#00ff88', '#ffffff'],
    butterfly: ['#8800ff', '#ff00ff'],
    spring_sky: ['#ffffff', '#00d4ff'],
    growing_ui: ['#00ff88', '#ff6b9d'],
    water_garden: ['#00ffff', '#ffffff'],
    sakura_exp: ['#ffb7c5', '#ff1493']
  };

  const selectedColors = themeParticleColors[theme] || themeParticleColors.glass_universe;

  const [particles, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colorValues = new Float32Array(count * 3);
    const colorOptions = selectedColors.map(c => new THREE.Color(c));

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 45;

      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      colorValues[i * 3] = color.r;
      colorValues[i * 3 + 1] = color.g;
      colorValues[i * 3 + 2] = color.b;
    }
    return [positions, colorValues];
  }, [count, theme]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (points.current) points.current.rotation.y = time * 0.05;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={particles} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} vertexColors transparent opacity={0.3} blending={THREE.AdditiveBlending} />
    </points>
  );
};

export default ParticleField;

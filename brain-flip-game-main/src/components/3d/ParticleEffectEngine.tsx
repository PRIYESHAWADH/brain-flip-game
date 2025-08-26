/**
 * Ultimate Brain Flip Experience - Advanced Particle Effect Engine
 * High-performance particle systems for immersive feedback
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Points, 
  BufferGeometry, 
  BufferAttribute, 
  ShaderMaterial, 
  AdditiveBlending,
  Vector3,
  Color
} from 'three';

// Particle system types
export enum ParticleEffectType {
  STREAK_CELEBRATION = 'streak_celebration',
  CORRECT_ANSWER = 'correct_answer',
  WRONG_ANSWER = 'wrong_answer',
  FLOW_STATE = 'flow_state',
  LEVEL_UP = 'level_up',
  ACHIEVEMENT = 'achievement',
  NEURAL_ACTIVITY = 'neural_activity',
  COGNITIVE_LOAD = 'cognitive_load',
  ATTENTION_FOCUS = 'attention_focus',
  ENERGY_BURST = 'energy_burst'
}

// Particle configuration
interface ParticleConfig {
  count: number;
  lifetime: number;
  spawnRate: number;
  initialVelocity: Vector3;
  acceleration: Vector3;
  size: { min: number; max: number };
  color: { start: Color; end: Color };
  opacity: { start: number; end: number };
  shape: 'circle' | 'star' | 'diamond' | 'neural';
  blending: 'additive' | 'normal' | 'multiply';
  physics: boolean;
  turbulence: number;
}

// Particle system state
interface ParticleSystem {
  id: string;
  type: ParticleEffectType;
  config: ParticleConfig;
  particles: Particle[];
  isActive: boolean;
  startTime: number;
  duration: number;
  position: Vector3;
  intensity: number;
}

// Individual particle
interface Particle {
  id: number;
  position: Vector3;
  velocity: Vector3;
  life: number;
  maxLife: number;
  size: number;
  color: Color;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

// Component props
interface ParticleEffectEngineProps {
  effects: ParticleEffectType[];
  intensity?: number;
  position?: Vector3;
  autoCleanup?: boolean;
  maxSystems?: number;
}

// Vertex shader for particles
const particleVertexShader = `
  attribute float size;
  attribute float life;
  attribute float maxLife;
  attribute vec3 color;
  attribute float opacity;
  attribute float rotation;
  
  varying vec3 vColor;
  varying float vOpacity;
  varying float vLife;
  varying float vRotation;
  
  void main() {
    vColor = color;
    vOpacity = opacity;
    vLife = life / maxLife;
    vRotation = rotation;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size based on life and distance
    float distanceScale = 1.0 / length(mvPosition.xyz);
    gl_PointSize = size * distanceScale * (0.5 + vLife * 0.5);
  }
`;

// Fragment shader for particles
const particleFragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;
  varying float vLife;
  varying float vRotation;
  
  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float distance = length(center);
    
    // Rotate the particle
    float cosR = cos(vRotation);
    float sinR = sin(vRotation);
    vec2 rotatedCoord = vec2(
      center.x * cosR - center.y * sinR,
      center.x * sinR + center.y * cosR
    ) + vec2(0.5);
    
    // Create different shapes based on distance patterns
    float alpha = 1.0;
    
    // Circular falloff
    alpha *= 1.0 - smoothstep(0.0, 0.5, distance);
    
    // Add sparkle effect
    float sparkle = sin(vLife * 20.0) * 0.3 + 0.7;
    alpha *= sparkle;
    
    // Life-based opacity
    float lifeAlpha = smoothstep(0.0, 0.1, vLife) * smoothstep(1.0, 0.8, vLife);
    alpha *= lifeAlpha * vOpacity;
    
    // Color intensity based on life
    vec3 finalColor = vColor * (0.8 + vLife * 0.4);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// Predefined particle configurations
const PARTICLE_CONFIGS: Record<ParticleEffectType, ParticleConfig> = {
  [ParticleEffectType.STREAK_CELEBRATION]: {
    count: 100,
    lifetime: 2.0,
    spawnRate: 50,
    initialVelocity: new Vector3(0, 2, 0),
    acceleration: new Vector3(0, -1, 0),
    size: { min: 0.1, max: 0.3 },
    color: { start: new Color(0x00ff41), end: new Color(0xffff00) },
    opacity: { start: 1.0, end: 0.0 },
    shape: 'star',
    blending: 'additive',
    physics: true,
    turbulence: 0.5
  },
  
  [ParticleEffectType.CORRECT_ANSWER]: {
    count: 30,
    lifetime: 1.5,
    spawnRate: 20,
    initialVelocity: new Vector3(0, 1, 0),
    acceleration: new Vector3(0, -0.5, 0),
    size: { min: 0.05, max: 0.15 },
    color: { start: new Color(0x00ff41), end: new Color(0x00ff41) },
    opacity: { start: 0.8, end: 0.0 },
    shape: 'circle',
    blending: 'additive',
    physics: true,
    turbulence: 0.2
  },
  
  [ParticleEffectType.WRONG_ANSWER]: {
    count: 20,
    lifetime: 1.0,
    spawnRate: 30,
    initialVelocity: new Vector3(0, 0.5, 0),
    acceleration: new Vector3(0, -1, 0),
    size: { min: 0.03, max: 0.1 },
    color: { start: new Color(0xff4100), end: new Color(0xff0000) },
    opacity: { start: 0.6, end: 0.0 },
    shape: 'circle',
    blending: 'additive',
    physics: true,
    turbulence: 0.3
  },
  
  [ParticleEffectType.FLOW_STATE]: {
    count: 200,
    lifetime: 4.0,
    spawnRate: 25,
    initialVelocity: new Vector3(0, 0, 0),
    acceleration: new Vector3(0, 0.1, 0),
    size: { min: 0.02, max: 0.08 },
    color: { start: new Color(0x0080ff), end: new Color(0x8000ff) },
    opacity: { start: 0.4, end: 0.0 },
    shape: 'neural',
    blending: 'additive',
    physics: false,
    turbulence: 0.8
  },
  
  [ParticleEffectType.LEVEL_UP]: {
    count: 150,
    lifetime: 3.0,
    spawnRate: 40,
    initialVelocity: new Vector3(0, 3, 0),
    acceleration: new Vector3(0, -0.8, 0),
    size: { min: 0.1, max: 0.4 },
    color: { start: new Color(0xffff00), end: new Color(0xff8000) },
    opacity: { start: 1.0, end: 0.0 },
    shape: 'star',
    blending: 'additive',
    physics: true,
    turbulence: 0.6
  },
  
  [ParticleEffectType.ACHIEVEMENT]: {
    count: 80,
    lifetime: 2.5,
    spawnRate: 30,
    initialVelocity: new Vector3(0, 2, 0),
    acceleration: new Vector3(0, -0.5, 0),
    size: { min: 0.15, max: 0.35 },
    color: { start: new Color(0xff0080), end: new Color(0x8000ff) },
    opacity: { start: 1.0, end: 0.0 },
    shape: 'diamond',
    blending: 'additive',
    physics: true,
    turbulence: 0.4
  },
  
  [ParticleEffectType.NEURAL_ACTIVITY]: {
    count: 300,
    lifetime: 5.0,
    spawnRate: 20,
    initialVelocity: new Vector3(0, 0, 0),
    acceleration: new Vector3(0, 0, 0),
    size: { min: 0.01, max: 0.05 },
    color: { start: new Color(0x00ffff), end: new Color(0x0080ff) },
    opacity: { start: 0.3, end: 0.0 },
    shape: 'neural',
    blending: 'additive',
    physics: false,
    turbulence: 1.0
  },
  
  [ParticleEffectType.COGNITIVE_LOAD]: {
    count: 50,
    lifetime: 2.0,
    spawnRate: 15,
    initialVelocity: new Vector3(0, 0.5, 0),
    acceleration: new Vector3(0, 0, 0),
    size: { min: 0.05, max: 0.12 },
    color: { start: new Color(0xff8000), end: new Color(0xff0000) },
    opacity: { start: 0.5, end: 0.0 },
    shape: 'circle',
    blending: 'additive',
    physics: false,
    turbulence: 0.3
  },
  
  [ParticleEffectType.ATTENTION_FOCUS]: {
    count: 120,
    lifetime: 3.0,
    spawnRate: 25,
    initialVelocity: new Vector3(0, 0, 0),
    acceleration: new Vector3(0, 0, 0),
    size: { min: 0.03, max: 0.1 },
    color: { start: new Color(0x00ff80), end: new Color(0x0080ff) },
    opacity: { start: 0.6, end: 0.0 },
    shape: 'circle',
    blending: 'additive',
    physics: false,
    turbulence: 0.5
  },
  
  [ParticleEffectType.ENERGY_BURST]: {
    count: 200,
    lifetime: 1.5,
    spawnRate: 100,
    initialVelocity: new Vector3(0, 0, 0),
    acceleration: new Vector3(0, 0, 0),
    size: { min: 0.08, max: 0.25 },
    color: { start: new Color(0xffffff), end: new Color(0x00ff41) },
    opacity: { start: 1.0, end: 0.0 },
    shape: 'star',
    blending: 'additive',
    physics: true,
    turbulence: 1.2
  }
};

// Individual particle system component
const ParticleSystemRenderer: React.FC<{
  system: ParticleSystem;
  onComplete: (id: string) => void;
}> = ({ system, onComplete }) => {
  const pointsRef = useRef<Points>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastSpawnTime = useRef(0);
  const nextParticleId = useRef(0);

  // Create shader material
  const shaderMaterial = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      blending: system.config.blending === 'additive' ? AdditiveBlending : undefined,
      depthWrite: false
    });
  }, [system.config.blending]);

  // Initialize particle system
  useEffect(() => {
    particlesRef.current = [];
    lastSpawnTime.current = 0;
    nextParticleId.current = 0;
  }, [system]);

  // Update particles each frame
  useFrame((state, delta) => {
    if (!system.isActive) return;

    const currentTime = state.clock.elapsedTime;
    const particles = particlesRef.current;

    // Spawn new particles
    if (currentTime - lastSpawnTime.current > 1 / system.config.spawnRate) {
      if (particles.length < system.config.count) {
        const newParticle = createParticle(system, nextParticleId.current++);
        particles.push(newParticle);
        lastSpawnTime.current = currentTime;
      }
    }

    // Update existing particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      
      // Update particle life
      particle.life -= delta;
      
      // Remove dead particles
      if (particle.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      // Update particle physics
      updateParticle(particle, delta, system.config);
    }

    // Update geometry
    updateGeometry(pointsRef.current, particles);

    // Check if system should be deactivated
    if (currentTime - system.startTime > system.duration && particles.length === 0) {
      onComplete(system.id);
    }
  });

  return (
    <points ref={pointsRef} position={system.position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={system.config.count}
          array={new Float32Array(system.config.count * 3)}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={system.config.count}
          array={new Float32Array(system.config.count)}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-life"
          count={system.config.count}
          array={new Float32Array(system.config.count)}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-maxLife"
          count={system.config.count}
          array={new Float32Array(system.config.count)}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-color"
          count={system.config.count}
          array={new Float32Array(system.config.count * 3)}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-opacity"
          count={system.config.count}
          array={new Float32Array(system.config.count)}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-rotation"
          count={system.config.count}
          array={new Float32Array(system.config.count)}
          itemSize={1}
        />
      </bufferGeometry>
      <primitive object={shaderMaterial} />
    </points>
  );
};

// Helper functions
function createParticle(system: ParticleSystem, id: number): Particle {
  const config = system.config;
  
  // Random spawn position with some spread
  const spawnRadius = 0.5;
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * spawnRadius;
  
  const position = new Vector3(
    Math.cos(angle) * radius,
    0,
    Math.sin(angle) * radius
  );

  // Random initial velocity with base direction
  const velocity = config.initialVelocity.clone();
  velocity.x += (Math.random() - 0.5) * config.turbulence;
  velocity.y += (Math.random() - 0.5) * config.turbulence * 0.5;
  velocity.z += (Math.random() - 0.5) * config.turbulence;

  // Random size within range
  const size = config.size.min + Math.random() * (config.size.max - config.size.min);

  return {
    id,
    position,
    velocity,
    life: config.lifetime,
    maxLife: config.lifetime,
    size,
    color: config.color.start.clone(),
    opacity: config.opacity.start,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 4
  };
}

function updateParticle(particle: Particle, delta: number, config: ParticleConfig): void {
  // Update position
  particle.position.add(particle.velocity.clone().multiplyScalar(delta));
  
  // Apply acceleration (physics)
  if (config.physics) {
    particle.velocity.add(config.acceleration.clone().multiplyScalar(delta));
  }
  
  // Update rotation
  particle.rotation += particle.rotationSpeed * delta;
  
  // Update color and opacity based on life
  const lifeRatio = 1 - (particle.life / particle.maxLife);
  
  // Interpolate color
  particle.color.lerpColors(config.color.start, config.color.end, lifeRatio);
  
  // Interpolate opacity
  particle.opacity = config.opacity.start + (config.opacity.end - config.opacity.start) * lifeRatio;
  
  // Add turbulence for organic movement
  if (config.turbulence > 0) {
    const turbulenceForce = new Vector3(
      (Math.random() - 0.5) * config.turbulence,
      (Math.random() - 0.5) * config.turbulence * 0.5,
      (Math.random() - 0.5) * config.turbulence
    );
    particle.velocity.add(turbulenceForce.multiplyScalar(delta));
  }
}

function updateGeometry(points: Points | null, particles: Particle[]): void {
  if (!points || !points.geometry) return;

  const geometry = points.geometry;
  const positions = geometry.attributes.position.array as Float32Array;
  const sizes = geometry.attributes.size.array as Float32Array;
  const lives = geometry.attributes.life.array as Float32Array;
  const maxLives = geometry.attributes.maxLife.array as Float32Array;
  const colors = geometry.attributes.color.array as Float32Array;
  const opacities = geometry.attributes.opacity.array as Float32Array;
  const rotations = geometry.attributes.rotation.array as Float32Array;

  // Clear arrays
  positions.fill(0);
  sizes.fill(0);
  lives.fill(0);
  maxLives.fill(0);
  colors.fill(0);
  opacities.fill(0);
  rotations.fill(0);

  // Update with current particles
  particles.forEach((particle, index) => {
    if (index >= positions.length / 3) return;

    // Position
    positions[index * 3] = particle.position.x;
    positions[index * 3 + 1] = particle.position.y;
    positions[index * 3 + 2] = particle.position.z;

    // Size
    sizes[index] = particle.size;

    // Life
    lives[index] = particle.life;
    maxLives[index] = particle.maxLife;

    // Color
    colors[index * 3] = particle.color.r;
    colors[index * 3 + 1] = particle.color.g;
    colors[index * 3 + 2] = particle.color.b;

    // Opacity
    opacities[index] = particle.opacity;

    // Rotation
    rotations[index] = particle.rotation;
  });

  // Mark attributes as needing update
  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.size.needsUpdate = true;
  geometry.attributes.life.needsUpdate = true;
  geometry.attributes.maxLife.needsUpdate = true;
  geometry.attributes.color.needsUpdate = true;
  geometry.attributes.opacity.needsUpdate = true;
  geometry.attributes.rotation.needsUpdate = true;
}

// Main particle effect engine component
export const ParticleEffectEngine: React.FC<ParticleEffectEngineProps> = ({
  effects,
  intensity = 1.0,
  position = new Vector3(0, 0, 0),
  autoCleanup = true,
  maxSystems = 10
}) => {
  const [activeSystems, setActiveSystems] = React.useState<Map<string, ParticleSystem>>(new Map());
  const systemIdCounter = useRef(0);

  // Create particle systems for new effects
  useEffect(() => {
    effects.forEach(effectType => {
      const systemId = `${effectType}_${systemIdCounter.current++}`;
      const config = { ...PARTICLE_CONFIGS[effectType] };
      
      // Apply intensity scaling
      config.count = Math.floor(config.count * intensity);
      config.spawnRate = Math.floor(config.spawnRate * intensity);
      config.size.min *= intensity;
      config.size.max *= intensity;

      const system: ParticleSystem = {
        id: systemId,
        type: effectType,
        config,
        particles: [],
        isActive: true,
        startTime: performance.now() / 1000,
        duration: config.lifetime * 2, // Run for twice the particle lifetime
        position: position.clone(),
        intensity
      };

      setActiveSystems(prev => {
        const newSystems = new Map(prev);
        newSystems.set(systemId, system);
        
        // Limit number of active systems
        if (newSystems.size > maxSystems) {
          const oldestKey = newSystems.keys().next().value;
          newSystems.delete(oldestKey);
        }
        
        return newSystems;
      });
    });
  }, [effects, intensity, position, maxSystems]);

  // Handle system completion
  const handleSystemComplete = React.useCallback((systemId: string) => {
    if (autoCleanup) {
      setActiveSystems(prev => {
        const newSystems = new Map(prev);
        newSystems.delete(systemId);
        return newSystems;
      });
    }
  }, [autoCleanup]);

  return (
    <group>
      {Array.from(activeSystems.values()).map(system => (
        <ParticleSystemRenderer
          key={system.id}
          system={system}
          onComplete={handleSystemComplete}
        />
      ))}
    </group>
  );
};

export default ParticleEffectEngine;
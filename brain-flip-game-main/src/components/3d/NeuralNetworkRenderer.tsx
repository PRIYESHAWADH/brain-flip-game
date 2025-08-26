/**
 * Ultimate Brain Flip Experience - Neural Network 3D Renderer
 * Advanced 3D visualization of neural networks and cognitive states
 */

'use client';

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Points, 
  PointMaterial, 
  BufferGeometry, 
  BufferAttribute, 
  Vector3, 
  Color,
  ShaderMaterial,
  AdditiveBlending,
  DoubleSide
} from 'three';
import { useSpring, animated } from '@react-spring/three';
import { CognitiveProfile, FlowStateData } from '@/types/cognitive';
import { GameState } from '@/types/game';

// Neural network node
interface NeuralNode {
  id: string;
  position: Vector3;
  activation: number;
  type: 'input' | 'hidden' | 'output';
  layer: number;
  connections: string[];
  color: Color;
  size: number;
}

// Neural connection
interface NeuralConnection {
  id: string;
  from: string;
  to: string;
  weight: number;
  activity: number;
  color: Color;
  opacity: number;
}

// Network configuration
interface NetworkConfig {
  layers: number[];
  nodeSpacing: number;
  layerSpacing: number;
  connectionDensity: number;
  animationSpeed: number;
  colorScheme: 'neon' | 'organic' | 'matrix' | 'cosmic';
}

// Component props
interface NeuralNetworkRendererProps {
  cognitiveProfile: CognitiveProfile;
  gameState: GameState;
  flowState: FlowStateData;
  performanceData: number[];
  className?: string;
  interactive?: boolean;
  showConnections?: boolean;
  animationIntensity?: number;
}

// Custom shader for neural connections
const connectionVertexShader = `
  attribute float activity;
  attribute vec3 color;
  varying float vActivity;
  varying vec3 vColor;
  
  void main() {
    vActivity = activity;
    vColor = color;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = 2.0 + activity * 8.0;
  }
`;

const connectionFragmentShader = `
  varying float vActivity;
  varying vec3 vColor;
  
  void main() {
    float distance = length(gl_PointCoord - vec2(0.5));
    float alpha = 1.0 - smoothstep(0.0, 0.5, distance);
    
    vec3 finalColor = vColor * (0.5 + vActivity * 1.5);
    gl_FragColor = vec4(finalColor, alpha * (0.3 + vActivity * 0.7));
  }
`;

// Neural node component
const NeuralNode: React.FC<{
  node: NeuralNode;
  animationTime: number;
  flowState: FlowStateData;
}> = ({ node, animationTime, flowState }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Animate node based on activation and flow state
  const { scale, color } = useSpring({
    scale: 0.8 + node.activation * 0.4 + flowState.flowStateScore * 0.3,
    color: [
      node.color.r + flowState.flowStateScore * 0.2,
      node.color.g + node.activation * 0.3,
      node.color.b + flowState.attentionFocusScore * 0.2
    ],
    config: { tension: 120, friction: 14 }
  });

  useFrame(() => {
    if (meshRef.current) {
      // Subtle pulsing animation
      const pulse = Math.sin(animationTime * 2 + node.position.x) * 0.1;
      meshRef.current.scale.setScalar(scale.get() + pulse);
      
      // Rotation based on activation
      meshRef.current.rotation.y += node.activation * 0.01;
      meshRef.current.rotation.z += flowState.flowStateScore * 0.005;
    }
  });

  return (
    <animated.mesh
      ref={meshRef}
      position={node.position}
      scale={scale}
    >
      <sphereGeometry args={[node.size, 16, 16]} />
      <animated.meshStandardMaterial
        color={color}
        emissive={color.to((r, g, b) => [r * 0.3, g * 0.3, b * 0.3])}
        transparent
        opacity={0.8 + node.activation * 0.2}
      />
    </animated.mesh>
  );
};

// Neural connections component
const NeuralConnections: React.FC<{
  connections: NeuralConnection[];
  nodes: Map<string, NeuralNode>;
  animationTime: number;
}> = ({ connections, nodes, animationTime }) => {
  const pointsRef = useRef<Points>(null);
  
  const { positions, colors, activities } = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const activities: number[] = [];
    
    connections.forEach(connection => {
      const fromNode = nodes.get(connection.from);
      const toNode = nodes.get(connection.to);
      
      if (fromNode && toNode) {
        // Create line segments for connection
        const segments = 20;
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const pos = new Vector3().lerpVectors(fromNode.position, toNode.position, t);
          
          // Add curve to connection
          const curve = Math.sin(t * Math.PI) * 0.5;
          pos.y += curve;
          
          positions.push(pos.x, pos.y, pos.z);
          colors.push(connection.color.r, connection.color.g, connection.color.b);
          activities.push(connection.activity);
        }
      }
    });
    
    return { positions, colors, activities };
  }, [connections, nodes]);

  const shaderMaterial = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: connectionVertexShader,
      fragmentShader: connectionFragmentShader,
      transparent: true,
      blending: AdditiveBlending,
      side: DoubleSide
    });
  }, []);

  useFrame(() => {
    if (pointsRef.current && pointsRef.current.geometry) {
      // Update activity values for animation
      const activityArray = pointsRef.current.geometry.attributes.activity.array as Float32Array;
      
      for (let i = 0; i < activityArray.length; i++) {
        const baseActivity = activities[i];
        const wave = Math.sin(animationTime * 3 + i * 0.1) * 0.2;
        activityArray[i] = Math.max(0, baseActivity + wave);
      }
      
      pointsRef.current.geometry.attributes.activity.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={new Float32Array(positions)}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={new Float32Array(colors)}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-activity"
          count={activities.length}
          array={new Float32Array(activities)}
          itemSize={1}
        />
      </bufferGeometry>
      <primitive object={shaderMaterial} />
    </points>
  );
};

// Main neural network scene
const NeuralNetworkScene: React.FC<{
  config: NetworkConfig;
  cognitiveProfile: CognitiveProfile;
  gameState: GameState;
  flowState: FlowStateData;
  performanceData: number[];
  showConnections: boolean;
}> = ({ config, cognitiveProfile, gameState, flowState, performanceData, showConnections }) => {
  const [animationTime, setAnimationTime] = useState(0);
  const [nodes, setNodes] = useState<Map<string, NeuralNode>>(new Map());
  const [connections, setConnections] = useState<NeuralConnection[]>([]);

  // Generate neural network structure
  useEffect(() => {
    const newNodes = new Map<string, NeuralNode>();
    const newConnections: NeuralConnection[] = [];
    
    // Create nodes for each layer
    config.layers.forEach((layerSize, layerIndex) => {
      for (let nodeIndex = 0; nodeIndex < layerSize; nodeIndex++) {
        const nodeId = `layer${layerIndex}_node${nodeIndex}`;
        
        // Position nodes in 3D space
        const x = (layerIndex - config.layers.length / 2) * config.layerSpacing;
        const y = (nodeIndex - layerSize / 2) * config.nodeSpacing;
        const z = Math.sin(layerIndex * 0.5 + nodeIndex * 0.3) * 2;
        
        // Determine node type and properties
        let nodeType: 'input' | 'hidden' | 'output';
        let baseColor: Color;
        
        if (layerIndex === 0) {
          nodeType = 'input';
          baseColor = new Color(0x00ff41); // Neon green for inputs
        } else if (layerIndex === config.layers.length - 1) {
          nodeType = 'output';
          baseColor = new Color(0xff0080); // Neon pink for outputs
        } else {
          nodeType = 'hidden';
          baseColor = new Color(0x0080ff); // Neon blue for hidden
        }
        
        // Calculate activation based on game state and performance
        let activation = 0.3; // Base activation
        
        if (nodeType === 'input') {
          // Input nodes reflect current game state
          activation = 0.2 + gameState.recentAccuracy * 0.6;
        } else if (nodeType === 'hidden') {
          // Hidden nodes reflect cognitive processing
          activation = 0.1 + flowState.flowStateScore * 0.7;
        } else {
          // Output nodes reflect performance
          activation = 0.2 + (performanceData.slice(-5).reduce((sum, p) => sum + p, 0) / 5) * 0.6;
        }
        
        const node: NeuralNode = {
          id: nodeId,
          position: new Vector3(x, y, z),
          activation: Math.max(0.1, Math.min(1.0, activation)),
          type: nodeType,
          layer: layerIndex,
          connections: [],
          color: baseColor,
          size: 0.3 + activation * 0.2
        };
        
        newNodes.set(nodeId, node);
      }
    });
    
    // Create connections between layers
    if (showConnections) {
      for (let layerIndex = 0; layerIndex < config.layers.length - 1; layerIndex++) {
        const currentLayerSize = config.layers[layerIndex];
        const nextLayerSize = config.layers[layerIndex + 1];
        
        for (let fromIndex = 0; fromIndex < currentLayerSize; fromIndex++) {
          for (let toIndex = 0; toIndex < nextLayerSize; toIndex++) {
            // Only create connection based on density setting
            if (Math.random() < config.connectionDensity) {
              const fromId = `layer${layerIndex}_node${fromIndex}`;
              const toId = `layer${layerIndex + 1}_node${toIndex}`;
              
              const fromNode = newNodes.get(fromId);
              const toNode = newNodes.get(toId);
              
              if (fromNode && toNode) {
                const weight = Math.random() * 2 - 1; // Random weight between -1 and 1
                const activity = Math.abs(weight) * fromNode.activation * toNode.activation;
                
                const connection: NeuralConnection = {
                  id: `${fromId}_${toId}`,
                  from: fromId,
                  to: toId,
                  weight,
                  activity,
                  color: weight > 0 ? new Color(0x00ff41) : new Color(0xff4100),
                  opacity: 0.3 + activity * 0.5
                };
                
                newConnections.push(connection);
                fromNode.connections.push(toId);
              }
            }
          }
        }
      }
    }
    
    setNodes(newNodes);
    setConnections(newConnections);
  }, [config, gameState, flowState, performanceData, showConnections]);

  // Update animation time
  useFrame((state) => {
    setAnimationTime(state.clock.elapsedTime * config.animationSpeed);
  });

  return (
    <group>
      {/* Render neural nodes */}
      {Array.from(nodes.values()).map(node => (
        <NeuralNode
          key={node.id}
          node={node}
          animationTime={animationTime}
          flowState={flowState}
        />
      ))}
      
      {/* Render neural connections */}
      {showConnections && connections.length > 0 && (
        <NeuralConnections
          connections={connections}
          nodes={nodes}
          animationTime={animationTime}
        />
      )}
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ff41" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#ff0080" />
    </group>
  );
};

// Camera controller for interactive viewing
const CameraController: React.FC<{ interactive: boolean }> = ({ interactive }) => {
  const { camera } = useThree();
  
  useFrame((state) => {
    if (interactive) {
      // Smooth camera movement based on mouse position
      const mouse = state.mouse;
      camera.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 5 + mouse.x * 2;
      camera.position.y = Math.cos(state.clock.elapsedTime * 0.1) * 3 + mouse.y * 2;
      camera.lookAt(0, 0, 0);
    } else {
      // Automatic camera rotation
      camera.position.x = Math.sin(state.clock.elapsedTime * 0.2) * 8;
      camera.position.z = Math.cos(state.clock.elapsedTime * 0.2) * 8;
      camera.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 2;
      camera.lookAt(0, 0, 0);
    }
  });
  
  return null;
};

// Main component
export const NeuralNetworkRenderer: React.FC<NeuralNetworkRendererProps> = ({
  cognitiveProfile,
  gameState,
  flowState,
  performanceData,
  className = '',
  interactive = false,
  showConnections = true,
  animationIntensity = 1.0
}) => {
  // Generate network configuration based on cognitive profile
  const networkConfig = useMemo((): NetworkConfig => {
    // Adapt network structure to cognitive profile
    const baseLayerSizes = [8, 12, 16, 12, 6]; // Input -> Hidden layers -> Output
    
    // Adjust based on cognitive complexity
    const complexityFactor = cognitiveProfile.cognitiveStrengths.length / 10;
    const adjustedLayers = baseLayerSizes.map(size => 
      Math.floor(size * (0.8 + complexityFactor * 0.4))
    );
    
    return {
      layers: adjustedLayers,
      nodeSpacing: 1.5,
      layerSpacing: 3.0,
      connectionDensity: 0.3 + flowState.flowStateScore * 0.4,
      animationSpeed: 0.5 + animationIntensity * 0.5,
      colorScheme: 'neon'
    };
  }, [cognitiveProfile, flowState, animationIntensity]);

  return (
    <div className={`neural-network-renderer ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        style={{ background: 'radial-gradient(circle, #0a0a0a 0%, #000000 100%)' }}
      >
        <NeuralNetworkScene
          config={networkConfig}
          cognitiveProfile={cognitiveProfile}
          gameState={gameState}
          flowState={flowState}
          performanceData={performanceData}
          showConnections={showConnections}
        />
        <CameraController interactive={interactive} />
      </Canvas>
      
      {/* Overlay information */}
      <div className="absolute top-4 left-4 text-white/70 text-sm">
        <div>Flow State: {(flowState.flowStateScore * 100).toFixed(1)}%</div>
        <div>Network Activity: {(networkConfig.connectionDensity * 100).toFixed(1)}%</div>
        <div>Nodes: {networkConfig.layers.reduce((sum, layer) => sum + layer, 0)}</div>
      </div>
    </div>
  );
};

export default NeuralNetworkRenderer;
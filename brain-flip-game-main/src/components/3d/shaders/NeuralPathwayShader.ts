/**
 * Ultimate Brain Flip Experience - Neural Pathway Shaders
 * Custom WebGL shaders for neural pathway visualization
 */

// Neural pathway vertex shader
export const neuralPathwayVertexShader = `
  uniform float time;
  uniform float flowState;
  uniform float cognitiveLoad;
  uniform vec3 brainCenter;
  
  attribute float activation;
  attribute float pathwayStrength;
  attribute vec3 neuralColor;
  
  varying float vActivation;
  varying float vPathwayStrength;
  varying vec3 vNeuralColor;
  varying float vDistance;
  varying vec2 vUv;
  
  // Noise function for organic movement
  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
  }
  
  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    vActivation = activation;
    vPathwayStrength = pathwayStrength;
    vNeuralColor = neuralColor;
    vUv = uv;
    
    // Calculate distance from brain center
    vDistance = distance(position, brainCenter);
    
    // Apply neural pathway deformation
    vec3 pos = position;
    
    // Add organic movement based on activation and flow state
    float noiseScale = 0.5 + flowState * 0.5;
    vec3 noisePos = pos * noiseScale + time * 0.1;
    
    float noise = snoise(noisePos) * activation * 0.3;
    pos.y += noise;
    
    // Add pulsing effect based on cognitive load
    float pulse = sin(time * 3.0 + vDistance * 0.5) * cognitiveLoad * 0.2;
    pos += normalize(pos - brainCenter) * pulse;
    
    // Flow state expansion
    pos += normalize(pos) * flowState * 0.5;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Point size based on activation and pathway strength
    gl_PointSize = (2.0 + activation * 8.0 + pathwayStrength * 4.0) * (1.0 + flowState);
  }
`;

// Neural pathway fragment shader
export const neuralPathwayFragmentShader = `
  uniform float time;
  uniform float flowState;
  uniform float cognitiveLoad;
  uniform vec3 focusPoint;
  
  varying float vActivation;
  varying float vPathwayStrength;
  varying vec3 vNeuralColor;
  varying float vDistance;
  varying vec2 vUv;
  
  // Hash function for procedural patterns
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  
  // Fractal noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float distance = length(center);
    
    // Create neural node appearance
    float alpha = 1.0;
    
    // Circular falloff with neural texture
    alpha *= 1.0 - smoothstep(0.0, 0.5, distance);
    
    // Add neural texture pattern
    vec2 noiseCoord = gl_PointCoord * 8.0 + time * 0.5;
    float neuralPattern = noise(noiseCoord) * 0.3 + 0.7;
    alpha *= neuralPattern;
    
    // Activation pulsing
    float activationPulse = 0.7 + sin(time * 4.0 + vDistance * 0.3) * vActivation * 0.3;
    alpha *= activationPulse;
    
    // Flow state enhancement
    float flowEnhancement = 1.0 + flowState * 0.5;
    alpha *= flowEnhancement;
    
    // Pathway strength affects brightness
    float brightness = 0.5 + vPathwayStrength * 0.5 + vActivation * 0.3;
    
    // Color mixing based on cognitive state
    vec3 baseColor = vNeuralColor;
    
    // Flow state color shift
    vec3 flowColor = vec3(0.0, 1.0, 0.8); // Cyan for flow
    baseColor = mix(baseColor, flowColor, flowState * 0.4);
    
    // Cognitive load color shift
    vec3 loadColor = vec3(1.0, 0.5, 0.0); // Orange for high load
    baseColor = mix(baseColor, loadColor, cognitiveLoad * 0.3);
    
    // Final color with brightness
    vec3 finalColor = baseColor * brightness;
    
    // Add sparkle effect for high activation
    if (vActivation > 0.8) {
      float sparkle = sin(time * 10.0 + vDistance * 2.0) * 0.5 + 0.5;
      finalColor += vec3(1.0) * sparkle * 0.3;
    }
    
    gl_FragColor = vec4(finalColor, alpha * (0.4 + vActivation * 0.6));
  }
`;

// Synaptic connection shader
export const synapticConnectionVertexShader = `
  uniform float time;
  uniform float flowState;
  uniform float neuralActivity;
  
  attribute float connectionStrength;
  attribute float signalSpeed;
  attribute vec3 connectionColor;
  
  varying float vConnectionStrength;
  varying float vSignalSpeed;
  varying vec3 vConnectionColor;
  varying float vProgress;
  
  void main() {
    vConnectionStrength = connectionStrength;
    vSignalSpeed = signalSpeed;
    vConnectionColor = connectionColor;
    
    // Calculate signal progress along connection
    vProgress = fract(time * signalSpeed + position.x * 0.1);
    
    // Apply flow state deformation
    vec3 pos = position;
    
    // Add wave motion for active connections
    float wave = sin(time * 2.0 + position.x * 0.5) * connectionStrength * 0.1;
    pos.y += wave * flowState;
    
    // Neural activity affects position
    pos += normalize(pos) * neuralActivity * 0.05;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    gl_PointSize = 1.0 + connectionStrength * 3.0 + flowState * 2.0;
  }
`;

export const synapticConnectionFragmentShader = `
  uniform float time;
  uniform float flowState;
  
  varying float vConnectionStrength;
  varying float vSignalSpeed;
  varying vec3 vConnectionColor;
  varying float vProgress;
  
  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float distance = length(center);
    
    // Create synaptic signal appearance
    float alpha = 1.0 - smoothstep(0.0, 0.5, distance);
    
    // Signal traveling effect
    float signal = smoothstep(0.0, 0.1, vProgress) * smoothstep(1.0, 0.9, vProgress);
    alpha *= signal * vConnectionStrength;
    
    // Flow state enhancement
    alpha *= 0.5 + flowState * 0.5;
    
    // Color intensity based on connection strength
    vec3 finalColor = vConnectionColor * (0.7 + vConnectionStrength * 0.3);
    
    // Add electrical effect
    float electrical = sin(time * 8.0 + vProgress * 20.0) * 0.2 + 0.8;
    finalColor *= electrical;
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// Brain region shader for anatomical accuracy
export const brainRegionVertexShader = `
  uniform float time;
  uniform float cognitiveActivity;
  uniform vec3 activityCenter;
  
  attribute float regionActivation;
  attribute vec3 regionColor;
  
  varying float vRegionActivation;
  varying vec3 vRegionColor;
  varying float vDistanceToActivity;
  
  void main() {
    vRegionActivation = regionActivation;
    vRegionColor = regionColor;
    vDistanceToActivity = distance(position, activityCenter);
    
    vec3 pos = position;
    
    // Brain region deformation based on activity
    float activityInfluence = 1.0 / (1.0 + vDistanceToActivity * 0.1);
    pos += normal * cognitiveActivity * activityInfluence * 0.2;
    
    // Pulsing based on region activation
    pos += normal * sin(time * 2.0 + regionActivation * 5.0) * 0.05;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const brainRegionFragmentShader = `
  uniform float time;
  uniform float cognitiveActivity;
  uniform float flowState;
  
  varying float vRegionActivation;
  varying vec3 vRegionColor;
  varying float vDistanceToActivity;
  
  void main() {
    // Base brain tissue color
    vec3 baseColor = vec3(0.8, 0.7, 0.9); // Soft brain tissue color
    
    // Mix with region-specific color based on activation
    vec3 activeColor = mix(baseColor, vRegionColor, vRegionActivation);
    
    // Activity hotspot effect
    float activityGlow = 1.0 / (1.0 + vDistanceToActivity * 0.5);
    activeColor += vec3(0.2, 0.4, 0.6) * activityGlow * cognitiveActivity;
    
    // Flow state enhancement
    vec3 flowColor = vec3(0.0, 1.0, 0.8);
    activeColor = mix(activeColor, flowColor, flowState * 0.2);
    
    // Pulsing effect
    float pulse = sin(time * 3.0 + vRegionActivation * 10.0) * 0.1 + 0.9;
    activeColor *= pulse;
    
    // Transparency based on activation
    float alpha = 0.3 + vRegionActivation * 0.4 + flowState * 0.2;
    
    gl_FragColor = vec4(activeColor, alpha);
  }
`;

// Cognitive energy field shader
export const cognitiveEnergyVertexShader = `
  uniform float time;
  uniform float energyLevel;
  uniform float focusIntensity;
  uniform vec3 energyCenter;
  
  varying vec2 vUv;
  varying float vEnergyLevel;
  varying float vDistanceToCenter;
  
  void main() {
    vUv = uv;
    vEnergyLevel = energyLevel;
    vDistanceToCenter = distance(position, energyCenter);
    
    vec3 pos = position;
    
    // Energy field deformation
    float energyWave = sin(time * 2.0 + vDistanceToCenter * 0.5) * energyLevel * 0.3;
    pos += normal * energyWave;
    
    // Focus intensity affects scale
    pos *= 1.0 + focusIntensity * 0.2;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const cognitiveEnergyFragmentShader = `
  uniform float time;
  uniform float energyLevel;
  uniform float focusIntensity;
  
  varying vec2 vUv;
  varying float vEnergyLevel;
  varying float vDistanceToCenter;
  
  // Fractal noise for energy patterns
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 4; i++) {
      value += amplitude * sin(frequency * p.x) * cos(frequency * p.y);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    
    return value;
  }
  
  void main() {
    // Energy field base color
    vec3 energyColor = vec3(0.0, 0.8, 1.0); // Cyan energy
    
    // Add fractal noise for organic energy patterns
    vec2 noiseCoord = vUv * 4.0 + time * 0.3;
    float energyNoise = fbm(noiseCoord) * 0.5 + 0.5;
    
    // Energy intensity based on distance from center
    float energyIntensity = 1.0 / (1.0 + vDistanceToCenter * 0.2);
    energyIntensity *= vEnergyLevel;
    energyIntensity *= energyNoise;
    
    // Focus creates concentrated energy beams
    float focusBeam = smoothstep(0.8, 1.0, focusIntensity) * 
                     smoothstep(0.1, 0.0, abs(vUv.x - 0.5)) * 
                     smoothstep(0.1, 0.0, abs(vUv.y - 0.5));
    
    energyIntensity += focusBeam * 0.5;
    
    // Pulsing energy waves
    float energyPulse = sin(time * 4.0 + vDistanceToCenter * 2.0) * 0.2 + 0.8;
    energyIntensity *= energyPulse;
    
    // Final color
    vec3 finalColor = energyColor * energyIntensity;
    
    // Add white core for high energy
    if (energyIntensity > 0.8) {
      finalColor = mix(finalColor, vec3(1.0), (energyIntensity - 0.8) * 5.0);
    }
    
    float alpha = energyIntensity * (0.2 + focusIntensity * 0.3);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// Shader material factory
export class NeuralShaderFactory {
  static createNeuralPathwayMaterial(uniforms: Record<string, any>): ShaderMaterial {
    return new ShaderMaterial({
      vertexShader: neuralPathwayVertexShader,
      fragmentShader: neuralPathwayFragmentShader,
      uniforms: {
        time: { value: 0 },
        flowState: { value: 0 },
        cognitiveLoad: { value: 0 },
        brainCenter: { value: new Vector3(0, 0, 0) },
        ...uniforms
      },
      transparent: true,
      blending: AdditiveBlending
    });
  }

  static createSynapticConnectionMaterial(uniforms: Record<string, any>): ShaderMaterial {
    return new ShaderMaterial({
      vertexShader: synapticConnectionVertexShader,
      fragmentShader: synapticConnectionFragmentShader,
      uniforms: {
        time: { value: 0 },
        flowState: { value: 0 },
        neuralActivity: { value: 0 },
        ...uniforms
      },
      transparent: true,
      blending: AdditiveBlending
    });
  }

  static createBrainRegionMaterial(uniforms: Record<string, any>): ShaderMaterial {
    return new ShaderMaterial({
      vertexShader: brainRegionVertexShader,
      fragmentShader: brainRegionFragmentShader,
      uniforms: {
        time: { value: 0 },
        cognitiveActivity: { value: 0 },
        flowState: { value: 0 },
        activityCenter: { value: new Vector3(0, 0, 0) },
        ...uniforms
      },
      transparent: true,
      side: DoubleSide
    });
  }

  static createCognitiveEnergyMaterial(uniforms: Record<string, any>): ShaderMaterial {
    return new ShaderMaterial({
      vertexShader: cognitiveEnergyVertexShader,
      fragmentShader: cognitiveEnergyFragmentShader,
      uniforms: {
        time: { value: 0 },
        energyLevel: { value: 0 },
        focusIntensity: { value: 0 },
        energyCenter: { value: new Vector3(0, 0, 0) },
        ...uniforms
      },
      transparent: true,
      blending: AdditiveBlending
    });
  }
}

export default NeuralShaderFactory;
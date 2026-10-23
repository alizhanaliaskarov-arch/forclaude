import * as THREE from 'three';

/** Polished chrome: mirror-like, reflects the studio strips. */
export const chrome = () => new THREE.MeshStandardMaterial({color: '#e4e6ea', metalness: 1, roughness: 0.045, envMapIntensity: 1.25});

/** Black chrome: dark mirror. */
export const blackChrome = () => new THREE.MeshStandardMaterial({color: '#2b2d31', metalness: 1, roughness: 0.08, envMapIntensity: 1.1});

/** Brushed titanium: anisotropic satin metal. */
export const titanium = () =>
  new THREE.MeshPhysicalMaterial({color: '#9b9ea4', metalness: 1, roughness: 0.32, anisotropy: 0.85, anisotropyRotation: Math.PI / 2, envMapIntensity: 1.1});

/** Glossy obsidian: near-black body under a perfect clear coat. */
export const obsidian = () =>
  new THREE.MeshPhysicalMaterial({
    color: '#060607',
    metalness: 0.2,
    roughness: 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: 1.4,
    ior: 1.6,
    specularIntensity: 1,
  });

/** Smoked glass: dark, glossy, faintly transparent. */
export const smokedGlass = () =>
  new THREE.MeshPhysicalMaterial({
    color: '#16171a',
    metalness: 0,
    roughness: 0.04,
    transparent: true,
    opacity: 0.55,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: 1.6,
    depthWrite: false,
  });

/** Self-lit silver for light lines (bypasses tone mapping so it reads as a light source). */
export const lightLine = (intensity = 3) => {
  const m = new THREE.MeshBasicMaterial({color: new THREE.Color('#f2f4f7').multiplyScalar(intensity), toneMapped: false});
  return m;
};

/** Additive soft beam: alpha fades along the cone and towards its silhouette. */
export const beamMaterial = (color = '#dfe3ea') =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {uColor: {value: new THREE.Color(color)}, uOpacity: {value: 0.12}},
    vertexShader: `
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `
      uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ float along = pow(vUv.y, 1.6); float edge = pow(abs(dot(vN, vV)), 1.5);
        gl_FragColor = vec4(uColor, uOpacity * along * edge); }`,
  });

let dot: THREE.Texture | null = null;
/** Round soft sprite for dust particles. */
export const dotTexture = () => {
  if (dot) return dot;
  const s = 64;
  const data = new Uint8Array(s * s * 4);
  for (let y = 0; y < s; y++)
    for (let x = 0; x < s; x++) {
      const d = Math.hypot(x - s / 2 + 0.5, y - s / 2 + 0.5) / (s / 2);
      const a = Math.max(0, 1 - d) ** 2;
      const i = (y * s + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = 255;
      data[i + 3] = Math.round(a * 255);
    }
  dot = new THREE.DataTexture(data, s, s);
  dot.needsUpdate = true;
  return dot;
};

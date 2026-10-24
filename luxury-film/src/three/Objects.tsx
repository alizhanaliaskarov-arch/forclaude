import React, {useMemo} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {beamMaterial, blackChrome, chrome, dotTexture, lightLine, titanium} from './materials';
import {rnd} from '../theme';

type V3 = [number, number, number];

/* ───────────── light lines ───────────── */

/** A razor-thin self-lit tube along a curve; `draw` (0..1) grows it, `from` (0..1) retracts its tail. */
export const LightTube: React.FC<{points: V3[]; draw?: number; from?: number; radius?: number; intensity?: number; sharp?: boolean}> = ({
  points,
  draw = 1,
  from = 0,
  radius = 0.0035,
  intensity = 3,
  sharp = false,
}) => {
  const key = points.map((p) => p.map((v) => v.toFixed(3)).join(',')).join(';');
  const geo = useMemo(() => {
    const v = points.map((p) => new THREE.Vector3(...p));
    let curve: THREE.Curve<THREE.Vector3>;
    if (sharp) {
      const path = new THREE.CurvePath<THREE.Vector3>();
      for (let i = 0; i < v.length - 1; i++) path.add(new THREE.LineCurve3(v[i], v[i + 1]));
      curve = path;
    } else curve = new THREE.CatmullRomCurve3(v, false, 'centripetal');
    return new THREE.TubeGeometry(curve, 240, radius, 8, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, radius, sharp]);
  const mat = useMemo(() => lightLine(intensity), [intensity]);
  const idx = geo.index ? geo.index.count : 0;
  const per = idx / 240;
  const a = Math.floor(from * 240) * per;
  const b = Math.floor(draw * 240) * per;
  geo.setDrawRange(a, Math.max(0, b - a));
  if (b - a <= 0) return null;
  return <mesh geometry={geo} material={mat} />;
};

/* ───────────── shards (scene 2) ───────────── */

export const Shards: React.FC<{t: number; align: number}> = ({t, align}) => {
  const {geo, mA, mB} = useMemo(() => ({geo: new RoundedBoxGeometry(0.16, 0.022, 0.06, 2, 0.008), mA: chrome(), mB: blackChrome()}), []);
  return (
    <group>
      {Array.from({length: 18}).map((_, i) => {
        // scattered → a precise vertical column of evenly spaced slivers beside the body
        const sx = (rnd(i) - 0.5) * 1.6 + 0.9;
        const sy = 0.5 + rnd(i * 3) * 1.3;
        const sz = (rnd(i * 7) - 0.5) * 1.2 + 0.4;
        const tx = 0.72;
        const ty = 0.45 + i * 0.065;
        const tz = 0.25;
        const k = align;
        const drift = (1 - k) * 0.05;
        const pos: V3 = [
          sx + (tx - sx) * k + Math.sin(t * 0.7 + i) * drift,
          sy + (ty - sy) * k + Math.cos(t * 0.6 + i * 2) * drift,
          sz + (tz - sz) * k,
        ];
        const rot: V3 = [(1 - k) * (rnd(i * 11) * 6 + t * 0.4), (1 - k) * (rnd(i * 13) * 6 + t * 0.3), (1 - k) * rnd(i * 17) * 6];
        return <mesh key={i} geometry={geo} material={i % 3 ? mB : mA} position={pos} rotation={rot} />;
      })}
    </group>
  );
};

/* ───────────── orbit rings (scenes 3, 5) ───────────── */

export const Rings: React.FC<{t: number; assemble: number; y?: number; scale?: number}> = ({t, assemble, y = 1.16, scale = 1}) => {
  const items = useMemo(
    () =>
      [
        [1.32, 0.009, 0.32, 0.1],
        [1.58, 0.006, -0.22, 0.9],
        [1.86, 0.012, 0.12, 2.1],
      ].map(([r, tube, tilt, phase]) => ({geo: new THREE.TorusGeometry(r, tube, 24, 256), tilt, phase})),
    [],
  );
  const m = useMemo(() => chrome(), []);
  return (
    <group position={[0, y, 0]} scale={scale}>
      {items.map((it, i) => {
        const k = assemble;
        const far = 1 - k;
        return (
          <mesh
            key={i}
            geometry={it.geo}
            material={m}
            position={[far * (i - 1) * 3.5, far * (1.5 - i * 1.4), far * -4]}
            rotation={[Math.PI / 2 + it.tilt * k + far * (2 + i), t * (0.12 + i * 0.05) + it.phase, it.tilt * 0.5 * k + far * i]}
            scale={1 + far * 0.6}
          />
        );
      })}
    </group>
  );
};

/* ───────────── motion sequence forms (scene 4) ───────────── */

export const Blades: React.FC<{t: number; unfold: number}> = ({t, unfold}) => {
  const {geo, mA, mB} = useMemo(() => ({geo: new RoundedBoxGeometry(2.4, 0.34, 0.045, 3, 0.02), mA: chrome(), mB: blackChrome()}), []);
  const n = 7;
  return (
    <group rotation={[0.2, t * 0.35, 0]}>
      {Array.from({length: n}).map((_, i) => {
        const a = (i / n) * Math.PI * unfold;
        return (
          <group key={i} rotation={[0, 0, a + t * 0.05]}>
            <mesh geometry={geo} material={i % 2 ? mA : mB} position={[0, 0, (i - n / 2) * 0.06 * (1 - unfold)]} />
          </group>
        );
      })}
    </group>
  );
};

export const Gyro: React.FC<{t: number}> = ({t}) => {
  const {g1, g2, g3, m, mt} = useMemo(
    () => ({
      g1: new THREE.TorusGeometry(1.15, 0.05, 32, 200),
      g2: new THREE.TorusGeometry(0.92, 0.04, 32, 200),
      g3: new THREE.TorusGeometry(0.7, 0.035, 32, 200),
      m: chrome(),
      mt: titanium(),
    }),
    [],
  );
  return (
    <group>
      <mesh geometry={g1} material={m} rotation={[t * 0.9, t * 0.4, 0]} />
      <mesh geometry={g2} material={mt} rotation={[0, t * 1.1, t * 0.5]} />
      <mesh geometry={g3} material={m} rotation={[t * 0.6 + 1, 0, t * 1.3]} />
      <mesh material={m}>
        <sphereGeometry args={[0.32, 96, 64]} />
      </mesh>
    </group>
  );
};

export const Spheres: React.FC<{t: number}> = ({t}) => {
  const {geo, m, mb} = useMemo(() => ({geo: new THREE.SphereGeometry(1, 96, 64), m: chrome(), mb: blackChrome()}), []);
  return (
    <group>
      {Array.from({length: 5}).map((_, i) => {
        const a = t * 0.6 + (i / 5) * Math.PI * 2;
        const r = 1.1 + 0.25 * Math.sin(t * 0.8 + i);
        return <mesh key={i} geometry={geo} material={i % 2 ? m : mb} position={[Math.cos(a) * r, Math.sin(a * 2) * 0.25, Math.sin(a) * r]} scale={0.18 + (i % 3) * 0.06} />;
      })}
    </group>
  );
};

/** A large spinning chrome disc that fills the frame (transition out of scene 4). */
export const Disc: React.FC<{t: number; z: number}> = ({t, z}) => {
  const {geo, m} = useMemo(() => ({geo: new THREE.CylinderGeometry(1.6, 1.6, 0.06, 160, 1), m: titanium()}), []);
  return <mesh geometry={geo} material={m} position={[0, 0, z]} rotation={[Math.PI / 2, 0, t * 2.5]} />;
};

/** Dark pillar passing in front of the lens (occlusion cut, scene 3 → 4). */
export const Pillar: React.FC<{x: number; z: number; width?: number}> = ({x, z, width = 0.9}) => {
  const {geo, m} = useMemo(() => ({geo: new RoundedBoxGeometry(width, 8, 0.9, 4, 0.08), m: blackChrome()}), [width]);
  return <mesh geometry={geo} material={m} position={[x, 1.5, z]} />;
};

/* ───────────── environment pieces (scenes 5, 7) ───────────── */

/** Monoliths standing in a circle; `align` 0 = split and offset, 1 = a perfect ring. */
export const Monoliths: React.FC<{t: number; align: number; dim?: number}> = ({t, align, dim = 1}) => {
  const {geo, m} = useMemo(() => {
    const mm = blackChrome();
    return {geo: new RoundedBoxGeometry(0.55, 4.2, 0.18, 4, 0.04), m: mm};
  }, []);
  m.envMapIntensity = 1.1 * dim;
  const n = 8;
  return (
    <group rotation={[0, t * 0.03, 0]}>
      {Array.from({length: n}).map((_, i) => {
        const a = (i / n) * Math.PI * 2;
        const r = 3.6 + (1 - align) * (1.5 + rnd(i) * 2);
        const y = 2.1 + (1 - align) * (rnd(i * 3) - 0.5) * 3;
        return <mesh key={i} geometry={geo} material={m} position={[Math.sin(a) * r, y, Math.cos(a) * r]} rotation={[0, a + (1 - align) * rnd(i * 5) * 1.5, (1 - align) * (rnd(i * 7) - 0.5) * 0.6]} />;
      })}
    </group>
  );
};

/** Monumental chrome arcs behind the hero; `align` locks them concentric, `dim` fades their reflections out. */
export const Arcs: React.FC<{t: number; align: number; dim: number}> = ({t, align, dim}) => {
  const items = useMemo(
    () =>
      [
        [3.2, 0.06],
        [4.4, 0.09],
        [5.8, 0.12],
      ].map(([r, tube]) => new THREE.TorusGeometry(r, tube, 32, 220, Math.PI)),
    [],
  );
  const m = useMemo(() => chrome(), []);
  m.envMapIntensity = 1.25 * dim;
  m.color.setScalar(0.2 + 0.7 * dim);
  return (
    <group position={[0, 0, -3.2]}>
      {items.map((g, i) => {
        const free = 1 - align;
        return (
          <mesh
            key={i}
            geometry={g}
            material={m}
            position={[free * (i - 1) * 0.8, 0, -i * 1.4]}
            rotation={[free * (0.3 + i * 0.2) * Math.sin(t * 0.3 + i), free * (i - 1) * 0.5, free * (i - 1) * 0.25]}
          />
        );
      })}
    </group>
  );
};

/* ───────────── atmosphere ───────────── */

export const Dust: React.FC<{t: number; opacity: number; spread?: V3; center?: V3; n?: number; size?: number}> = ({
  t,
  opacity,
  spread = [6, 4, 6],
  center = [0, 1.6, 0],
  n = 380,
  size = 0.018,
}) => {
  const {geo, mat} = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const m = new THREE.PointsMaterial({
      size,
      map: dotTexture(),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: '#d9dde3',
    });
    return {geo: g, mat: m};
  }, [n, size]);
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < n; i++) {
    const x = (rnd(i) - 0.5) * spread[0] + Math.sin(t * 0.13 + i) * 0.15;
    const y = ((((rnd(i * 3) + t * 0.012 * (0.5 + rnd(i * 5))) % 1) + 1) % 1 - 0.5) * spread[1];
    const z = (rnd(i * 7) - 0.5) * spread[2] + Math.cos(t * 0.11 + i) * 0.15;
    pos.setXYZ(i, center[0] + x, center[1] + y, center[2] + z);
  }
  pos.needsUpdate = true;
  mat.opacity = opacity;
  if (opacity <= 0) return null;
  return <points geometry={geo} material={mat} />;
};

/** Fake volumetric light: an additive cone hanging from above. */
export const Beam: React.FC<{opacity: number; pos?: V3; radius?: number; height?: number; tilt?: number}> = ({
  opacity,
  pos = [0, 5.2, 0],
  radius = 1.6,
  height = 6,
  tilt = 0,
}) => {
  const {geo, mat} = useMemo(() => ({geo: new THREE.ConeGeometry(radius, height, 64, 1, true), mat: beamMaterial()}), [radius, height]);
  mat.uniforms.uOpacity.value = opacity;
  if (opacity <= 0) return null;
  return <mesh geometry={geo} material={mat} position={pos} rotation={[0, 0, tilt]} />;
};

/** Black glossy floor. Reflections are real geometry mirrored under it (see Mirror). */
export const Floor: React.FC<{opacity?: number; env?: number; coat?: number}> = ({opacity = 0.74, env = 0.22, coat = 1}) => {
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#020203',
        metalness: 0.0,
        roughness: 0.55,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        transparent: true,
        envMapIntensity: 0.22,
      }),
    [],
  );
  mat.opacity = opacity;
  mat.envMapIntensity = env;
  mat.clearcoat = coat;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} material={mat} renderOrder={2}>
      <circleGeometry args={[30, 96]} />
    </mesh>
  );
};

/** Renders its children twice: as-is and mirrored under the floor plane (y = 0). */
export const Mirror: React.FC<{children: React.ReactNode; enabled: boolean}> = ({children, enabled}) => (
  <>
    {children}
    {enabled ? <group scale={[1, -1, 1]}>{children}</group> : null}
  </>
);

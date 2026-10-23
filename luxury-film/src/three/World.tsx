import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {Studio} from './Studio';
import {Hero} from './Hero';
import {Arcs, Beam, Blades, Disc, Dust, Floor, Gyro, LightTube, Mirror, Monoliths, Pillar, Rings, Shards, Spheres} from './Objects';
import {dotTexture} from './materials';
import {easeOut, ip, lens, linear, mix, smooth} from '../theme';

type V3 = [number, number, number];

export const SCENES = [0, 5, 10, 17, 25, 35, 43, 52, 60];
export const S4_CUT = 1.25; // two beats at 96 BPM

const orbit = (deg: number, r: number, h: number, target: V3): V3 => {
  const a = (deg * Math.PI) / 180;
  return [target[0] + Math.sin(a) * r, h, target[2] + Math.cos(a) * r];
};

type Shot = {p: V3; l: V3; fov: number};

/* ───────────── camera direction, shot by shot ───────────── */
export const cameraAt = (t: number): Shot => {
  // 01 THE ARRIVAL — 100 mm macro dolly-in on the edge of the cap
  if (t < 5) {
    const k = ip(t, [0, 5], [0, 1], linear);
    return {p: [mix(0.66, 0.5, k), mix(2.06, 2.0, k), mix(2.0, 1.42, k)], l: [0.06, 1.98, 0], fov: lens(100)};
  }
  // 02 MATERIAL & DETAIL — lateral macro track along the body edge, then a macro orbit around collar and cap
  if (t < 10) {
    if (t < 7.5) {
      const k = ip(t, [5, 7.5], [0, 1], linear);
      const x = mix(0.95, 0.2, k);
      return {p: [x, mix(0.9, 1.02, k), 1.2], l: [x - 0.42, 0.98, 0.39], fov: lens(100)};
    }
    const deg = ip(t, [7.5, 10], [42, -12], linear);
    return {p: orbit(deg, 1.2, 1.7, [0, 0, 0]), l: [0, 1.66, 0], fov: lens(100)};
  }
  // 03 THE REVEAL — 180° orbit with parallax, then a short push-in
  if (t < 17) {
    const deg = ip(t, [10, 15.6], [-95, 85], smooth);
    const r = ip(t, [15.6, 17], [5.4, 4.4], smooth);
    return {p: orbit(deg, r, 1.45, [0, 0, 0]), l: [0, 1.12, 0], fov: lens(50)};
  }
  // 04 THE MOTION SEQUENCE — a new angle every two beats
  if (t < 25) {
    const k = Math.min(6, Math.floor((t - 17) / S4_CUT));
    const u = (t - 17 - k * S4_CUT) / S4_CUT; // 0..1 inside the cut
    const c: V3 = [0, 1.2, 0];
    switch (k) {
      case 0:
        return {p: orbit(20, mix(5.2, 4.5, u), 1.5, c), l: c, fov: lens(85)};
      case 1:
        return {p: [mix(-0.9, 0.9, u), 1.3, 3.6], l: c, fov: lens(50)};
      case 2:
        return {p: orbit(mix(-30, 10, u), 4.2, 0.35, c), l: [0, 1.25, 0], fov: lens(50)};
      case 3:
        return {p: orbit(mix(60, 95, u), 3.6, 1.6, c), l: c, fov: lens(50)};
      case 4:
        return {p: orbit(mix(0, 25, u), 1.6, 5.2, c), l: c, fov: lens(50)};
      case 5:
        return {p: orbit(-15, mix(4.6, 3.6, u), 1.35, c), l: c, fov: lens(85)};
      default:
        return {p: [0, 1.2, 4], l: c, fov: lens(50)};
    }
  }
  // 05 THE LUXURY PEAK — slow push-in, then a low-angle orbit
  if (t < 35) {
    if (t < 30) {
      const k = ip(t, [25, 30], [0, 1], smooth);
      return {p: [0, mix(2.0, 1.45, k), mix(10.5, 6.6, k)], l: [0, 1.2, 0], fov: lens(50)};
    }
    const deg = ip(t, [30, 35], [-8, 48], smooth);
    return {p: orbit(deg, mix(5.6, 5.0, (t - 30) / 5), 0.32, [0, 0, 0]), l: [0, 1.4, 0], fov: lens(50)};
  }
  // 06 THE ART OF PRECISION — macro track down the cap, then a quiet frontal frame
  if (t < 43) {
    if (t < 38.6) {
      const k = ip(t, [35, 38.6], [0, 1], linear);
      const y = mix(2.16, 1.6, k);
      return {p: [0.58, y + 0.02, 0.92], l: [0.04, y - 0.02, 0], fov: lens(100)};
    }
    const k = ip(t, [38.6, 43], [0, 1], linear);
    return {p: [0, 1.2, mix(5.4, 5.0, k)], l: [0, 1.16, 0], fov: lens(85) * 1.55};
  }
  // 07 THE SIGNATURE MOMENT — low-angle hero, forward dolly, subtle final orbit
  if (t < 52) {
    const z = ip(t, [43, 49], [5.8, 4.7], smooth);
    const deg = ip(t, [49, 52], [0, 14], smooth);
    return {p: orbit(deg, z, mix(0.26, 0.3, (t - 43) / 9), [0, 0, 0]), l: [0, 1.3, 0], fov: lens(50)};
  }
  // 08 THE FINAL FRAME — extremely slow push-in that decelerates to stillness
  const k = ip(t, [52, 60], [0, 1], easeOut);
  return {p: [0, 1.0, mix(12.4, 11.2, k)], l: [0, 0.78, 0], fov: lens(85)};
};

const CameraRig: React.FC<{shot: Shot}> = ({shot}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(...shot.p);
  camera.fov = shot.fov;
  camera.near = 0.02;
  camera.far = 80;
  camera.updateProjectionMatrix();
  camera.lookAt(...shot.l);
  return null;
};

/** A small self-lit glint (the single silver highlight that survives the fade at the end of scene 7). */
const Glint: React.FC<{pos: V3; size: number; opacity: number}> = ({pos, size, opacity}) => {
  const {geo, mat} = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3));
    const m = new THREE.PointsMaterial({map: dotTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#ffffff', toneMapped: false});
    return {geo: g, mat: m};
  }, []);
  (geo.getAttribute('position') as THREE.BufferAttribute).setXYZ(0, ...pos);
  geo.getAttribute('position').needsUpdate = true;
  mat.size = size;
  mat.opacity = opacity;
  if (opacity <= 0) return null;
  return <points geometry={geo} material={mat} />;
};

// front silhouette of the hero, traced by light in scene 6 (plane just in front of the body)
const ZF = 0.43;
const CONTOUR: V3[] = [
  [0, 0.02, ZF], [0.39, 0.02, ZF], [0.39, 1.5, ZF], [0.31, 1.5, ZF], [0.31, 1.55, ZF], [0.13, 1.56, ZF], [0.12, 1.65, ZF],
  [0.25, 1.66, ZF], [0.26, 2.1, ZF], [0.17, 2.27, ZF], [0, 2.32, ZF], [-0.17, 2.27, ZF], [-0.26, 2.1, ZF], [-0.25, 1.66, ZF],
  [-0.12, 1.65, ZF], [-0.13, 1.56, ZF], [-0.31, 1.55, ZF], [-0.31, 1.5, ZF], [-0.39, 1.5, ZF], [-0.39, 0.02, ZF], [0, 0.02, ZF],
];

export const World: React.FC<{t: number}> = ({t}) => {
  const shot = cameraAt(t);
  const s1 = t < 5;
  const s2 = t >= 5 && t < 10;
  const s3 = t >= 10 && t < 17;
  const s4 = t >= 17 && t < 25;
  const s5 = t >= 25 && t < 35;
  const s6 = t >= 35 && t < 43;
  const s7 = t >= 43 && t < 52;
  const s8 = t >= 52;

  // environment: intensity and rotation (rotation = strip lights travelling across the metal)
  let envI = 1;
  let envRot = t * 0.06;
  if (s1) envI = ip(t, [0.4, 4.2], [0, 0.55]);
  if (s2) envRot = 0.6 + (t - 5) * 0.28;
  if (s3) envI = ip(t, [10, 12.6], [0.12, 1]);
  if (s4) envRot = t * 0.9;
  if (s6) {
    envRot = 1.2 + (t - 35) * 0.22;
    envI = ip(t, [41.2, 42.3], [1, 0]);
  }
  if (s7) envI = ip(t, [50.8, 51.9], [1, 0.08]);
  if (s8) {
    envRot = ip(t, [52.6, 56.6], [-1.4, 0.35], smooth);
    envI = ip(t, [52, 53.2, 56.6, 58], [0.05, 0.9, 0.9, 0.7]);
  }

  // overhead / rim spot
  const camA = Math.atan2(shot.p[0], shot.p[2]);
  const rimPos: V3 = s3 ? [-Math.sin(camA) * 3, 3.4, -Math.cos(camA) * 3] : [0.4, 6, -2.4];
  const rimI = s1 ? ip(t, [0.5, 3], [0, 30]) : s4 ? 0 : s7 ? ip(t, [50.8, 51.8], [32, 0]) : s6 ? ip(t, [41.2, 42.3], [28, 0]) : 28;

  const heroVisible = !s4;
  const floorOn = s3 || s5 || s7 || s8;
  const showRings = s3 || s5;
  const ringsAssemble = s3 ? ip(t, [10.8, 14.8], [0, 1], smooth) : 1;

  return (
    <>
      <Studio rotation={envRot} intensity={envI} />
      <CameraRig shot={shot} />
      <fogExp2 attach="fog" args={['#060607', s4 ? 0.07 : 0.045]} />
      <spotLight position={rimPos} angle={0.32} penumbra={0.9} intensity={rimI} distance={0} decay={1.2} color="#ffffff" />
      <directionalLight position={[2, 3, 4]} intensity={s4 ? 0.6 : 0.15} color="#e9ecf1" />

      <Mirror enabled={floorOn}>
        {heroVisible ? <Hero /> : null}
        {showRings ? <Rings t={t} assemble={ringsAssemble} /> : null}
        {s5 ? <Monoliths t={t} align={ip(t, [25.2, 29.2], [0, 1], smooth)} /> : null}
        {s7 ? <Arcs t={t} align={ip(t, [43, 48.2], [0, 1], smooth)} dim={ip(t, [50.6, 51.8], [1, 0])} /> : null}
      </Mirror>
      {floorOn ? <Floor env={s8 ? 0.05 : 0.22} /> : null}

      {/* 01: the line that forms, bends and catches the light */}
      {s1 ? (
        <LightTube
          points={[
            [-0.32, 1.78, 0.62],
            [-0.1, 1.9 + 0.06 * Math.sin(t * 0.9), 0.75],
            [0.12, 2.0 + ip(t, [1.5, 3.5], [-0.05, 0.08]), 0.72],
            [0.34, 2.14, 0.6],
            [0.5, 2.28, 0.45],
          ]}
          draw={ip(t, [0.7, 2.9], [0, 1], smooth)}
          intensity={1.6 + 3 * Math.exp(-(((t - 3.1) / 0.35) ** 2))}
          radius={0.0018}
        />
      ) : null}

      {/* 02: magnetic slivers */}
      {s2 ? <Shards t={t} align={ip(t, [6.2, 8.6], [0, 1], smooth)} /> : null}

      {/* 03 → 04: occluding pillar sweeps across the lens */}
      {s3 && t > 16.4 ? (() => {
        const fwd = new THREE.Vector3(...shot.l).sub(new THREE.Vector3(...shot.p)).normalize();
        const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
        const off = ip(t, [16.4, 17], [-1.3, 0], linear);
        const p = new THREE.Vector3(...shot.p).addScaledVector(fwd, 0.9).addScaledVector(right, off);
        return <Pillar x={p.x} z={p.z} />;
      })() : null}

      {/* 04: chrome forms in a black void */}
      {s4 ? (
        <group position={[0, 1.2, 0]}>
          {(() => {
            const k = Math.min(6, Math.floor((t - 17) / S4_CUT));
            if (k === 0 || k === 2 || k === 4) return <Blades t={t} unfold={ip(t, [17, 22.5], [0.15, 1], smooth)} />;
            if (k === 1 || k === 5) return <Gyro t={t} />;
            if (k === 3)
              return (
                <>
                  <Gyro t={t} />
                  <Spheres t={t} />
                </>
              );
            return (
              <>
                <Blades t={t} unfold={1} />
                <Disc t={t} z={ip(t, [24.5, 25], [-3, 3.25], Math.sqrt)} />
              </>
            );
          })()}
        </group>
      ) : null}

      {/* atmosphere */}
      {s3 || s5 || s7 ? <Beam opacity={s7 ? ip(t, [50.8, 51.6], [0.09, 0]) : s5 ? 0.15 : ip(t, [11, 13], [0, 0.1])} /> : null}
      <Dust
        t={t}
        opacity={s1 ? 0 : s2 || s6 ? 0.35 : s4 ? 0.5 : s8 ? 0.15 : s7 ? ip(t, [50.8, 51.8], [0.55, 0]) : 0.6}
        size={s2 || s6 ? 0.006 : 0.018}
        spread={s2 || s6 ? [1.4, 1.6, 1.4] : [7, 5, 7]}
        center={s2 || s6 ? [0.3, 1.4, 0.6] : [0, 1.8, 0]}
      />

      {/* 06: the silhouette traced in light, then drawn into a single point */}
      {s6 && t > 38.6 ? (
        <group position={[0, 1.16, 0]} scale={ip(t, [40.7, 41.5], [1, 0.001], smooth)}>
          <group position={[0, -1.16, 0]}>
            <LightTube points={CONTOUR} draw={ip(t, [38.8, 40.5], [0, 1], smooth)} radius={0.0035} intensity={2.6} sharp />
          </group>
        </group>
      ) : null}

      {/* 07 → 08: the single surviving highlight */}
      {s7 ? <Glint pos={[0.12, 2.16, 0.24]} size={ip(t, [50.8, 51.6], [0, 0.09])} opacity={ip(t, [50.8, 51.4, 51.85, 52], [0, 1, 1, 0])} /> : null}
      {s8 ? <Glint pos={[0.12, 2.16, 0.24]} size={0.07} opacity={ip(t, [52, 52.4], [1, 0])} /> : null}
    </>
  );
};

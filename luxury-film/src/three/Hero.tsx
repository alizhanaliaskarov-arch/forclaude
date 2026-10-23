import React, {useMemo} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {chrome, obsidian, titanium} from './materials';

/** Overall height of the sculpture (floor to top of the cap). */
export const HERO_H = 2.32;

/**
 * The hero object: an obsidian monolith (fragrance-flacon proportions) with a brushed-titanium collar,
 * a polished chrome neck and a sculpted chrome cap, plus one hairline chrome band around the base.
 */
export const Hero: React.FC<{rotY?: number; y?: number; scale?: number}> = ({rotY = 0, y = 0, scale = 1}) => {
  const parts = useMemo(() => {
    const body = new RoundedBoxGeometry(0.78, 1.5, 0.78, 8, 0.075);
    const collar = new THREE.CylinderGeometry(0.31, 0.31, 0.05, 96);
    const neck = new THREE.CylinderGeometry(0.115, 0.13, 0.1, 64);
    const prof: THREE.Vector2[] = [];
    // cap profile: a softened column with a domed top
    prof.push(new THREE.Vector2(0, 0));
    for (let i = 0; i <= 10; i++) prof.push(new THREE.Vector2(0.24 + 0.02 * Math.sin((i / 10) * Math.PI), (i / 10) * 0.46));
    for (let i = 1; i <= 16; i++) {
      const a = (i / 16) * (Math.PI / 2);
      prof.push(new THREE.Vector2(0.24 * Math.cos(a), 0.46 + 0.17 * Math.sin(a)));
    }
    const cap = new THREE.LatheGeometry(prof, 96);
    const band = new THREE.TorusGeometry(0.405, 0.006, 16, 160);
    return {body, collar, neck, cap, band, mObs: obsidian(), mChrome: chrome(), mTi: titanium()};
  }, []);
  return (
    <group position={[0, y, 0]} rotation={[0, rotY, 0]} scale={scale}>
      <mesh geometry={parts.body} material={parts.mObs} position={[0, 0.75, 0]} />
      <mesh geometry={parts.band} material={parts.mChrome} position={[0, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={parts.collar} material={parts.mTi} position={[0, 1.525, 0]} />
      <mesh geometry={parts.neck} material={parts.mChrome} position={[0, 1.6, 0]} />
      <mesh geometry={parts.cap} material={parts.mChrome} position={[0, 1.65, 0]} />
    </group>
  );
};

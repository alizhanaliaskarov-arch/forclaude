import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';

/**
 * A dark virtual studio that only exists to be reflected: a black room with a few long, very bright
 * strip lights and one overhead softbox. It is baked once into a prefiltered environment map (PMREM),
 * which gives chrome and obsidian their narrow, sculptural highlights.
 */
const buildStudio = () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#000000');
  const room = new THREE.Mesh(new THREE.BoxGeometry(30, 20, 30), new THREE.MeshBasicMaterial({color: '#010101', side: THREE.BackSide}));
  scene.add(room);
  const strip = (w: number, h: number, pos: [number, number, number], rot: [number, number, number], k: number) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({color: new THREE.Color('#ffffff').multiplyScalar(k), side: THREE.DoubleSide, toneMapped: false}),
    );
    m.position.set(...pos);
    m.rotation.set(...rot);
    scene.add(m);
  };
  // overhead long softbox
  strip(1.2, 9, [0, 8, 0], [Math.PI / 2, 0, 0], 6);
  // tall vertical rim strips left / right / back
  strip(0.35, 12, [-9, 2, -3], [0, Math.PI / 2, 0], 9);
  strip(0.35, 12, [9, 2, -2], [0, -Math.PI / 2, 0], 9);
  strip(0.25, 10, [3, 1, -12], [0, 0, 0], 5);
  // two tall front strips — long vertical highlights down the obsidian faces
  const front = (x: number, z: number, k: number) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 10),
      new THREE.MeshBasicMaterial({color: new THREE.Color('#ffffff').multiplyScalar(k), side: THREE.DoubleSide, toneMapped: false}),
    );
    m.position.set(x, 2, z);
    m.lookAt(0, 2, 0);
    scene.add(m);
  };
  front(-5, 7, 4);
  front(6.5, 5, 2.5);
  // a very dim large card behind, for silhouette separation
  strip(9, 8, [0, 2, -13], [0, 0, 0], 0.18);
  // low horizontal kicker
  strip(14, 0.18, [0, -1.5, 10], [0, Math.PI, 0], 3);
  // a faint warm card for the sparing champagne accent
  const warm = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 2.5),
    new THREE.MeshBasicMaterial({color: new THREE.Color('#cdb68a').multiplyScalar(0.9), side: THREE.DoubleSide, toneMapped: false}),
  );
  warm.position.set(-6, 3, 8);
  warm.lookAt(0, 1, 0);
  scene.add(warm);
  return scene;
};

export const Studio: React.FC<{rotation: number; intensity?: number}> = ({rotation, intensity = 1}) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(buildStudio(), 0.015).texture;
    pm.dispose();
    return tex;
  }, [gl]);
  scene.environment = env;
  scene.environmentIntensity = intensity;
  scene.environmentRotation.set(0, rotation, 0);
  scene.background = new THREE.Color('#030304');
  return null;
};

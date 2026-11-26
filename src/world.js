import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { state } from './state.js';
import { palette, material, mesh, sphere, star, tube } from './geometry.js';

export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, state.viewport.mobile ? 1.65 : 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#f0f1eb');
  scene.fog = new THREE.Fog('#f0f1eb', 14, 35);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.38;
  room.dispose();
  pmrem.dispose();

  const hemi = new THREE.HemisphereLight(0xfafbf6, 0xaeb9ae, 2.3);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfffcf2, 2.8);
  key.position.set(-4, 8, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 8, bottom: -5, near: 0.1, far: 25 });
  key.shadow.normalBias = 0.035;
  key.shadow.bias = -0.0001;
  key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xe4ede8, 1.8);
  rim.position.set(4, 4, -3);
  scene.add(rim);

  const ground = mesh(new THREE.PlaneGeometry(100, 100), material('#e8eae2', { roughness: 0.85 }), scene);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.25;
  ground.castShadow = false;
  const stage = new THREE.Group();
  scene.add(stage);
  mesh(new THREE.CylinderGeometry(3.45, 3.5, 0.2, 96), material(palette.cream), stage, [0, -0.12, 0]);
  mesh(new THREE.CylinderGeometry(3.49, 3.49, 0.035, 96), material(palette.sand, { metalness: 0.22 }), stage, [0, -0.18, 0]);

  // A muted sage backdrop and satin arch frame the miniature party.
  const backdrop = mesh(new THREE.CircleGeometry(3.25, 96), material('#d8dfd2', { roughness: 0.8 }), scene, [0, 2.1, -2.4]);
  backdrop.castShadow = false;
  const archMat = material('#aab9a9', { metalness: 0.12, roughness: 0.65 });
  mesh(new THREE.TorusGeometry(3.15, 0.035, 8, 100, Math.PI), archMat, scene, [0, 1.3, -2.15]);
  for (const x of [-3.15, 3.15]) mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.4, 10), archMat, scene, [x, 0.6, -2.15]);

  const balloonGroups = [];
  const balloonSpecs = [
    [-2.85, -1.05, 3.7, palette.forest, 0.46],
    [-2.05, -1.35, 4.45, palette.cream, 0.47],
    [-3.45, -0.3, 2.8, palette.slate, 0.43],
    [2.8, -1.25, 4.15, palette.sage, 0.49],
    [3.45, -0.6, 3.2, palette.sand, 0.43],
    [2.15, -1.4, 4.75, palette.slate, 0.35],
  ];
  const stringMat = material('#a0ac9b', { roughness: 0.9 });
  balloonSpecs.forEach(([x, z, height, color, radius], i) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0, z);
    scene.add(pivot);
    const shiny = new THREE.MeshPhysicalMaterial({ color, roughness: 0.6, metalness: 0.06, clearcoat: 0.2, clearcoatRoughness: 0.5 });
    const balloon = sphere(radius, shiny, pivot, [0, height, 0], [1, 1.24, 0.94]);
    const tip = mesh(new THREE.ConeGeometry(0.065, 0.11, 12), shiny, pivot, [0, height - radius * 1.24 - 0.02, 0]);
    tip.rotation.z = Math.PI;
    tube([[0, 0.03, 0], [0.12, height * 0.25, 0.04], [-0.1, height * 0.6, 0], [0, height - radius * 1.24 - 0.06, 0]], 0.009, stringMat, pivot);
    balloonGroups.push({ pivot, balloon, phase: i * 1.7 });
  });

  const floating = [];
  const gold = material(palette.sand, { metalness: 0.25, roughness: 0.5 });
  const accent = material(palette.forest, { metalness: 0.04 });
  const ornaments = [
    [-2.25, 2.75, 0.2, 0.22], [2.4, 2.65, 0.8, 0.16],
    [-0.3, 4.2, -0.4, 0.18], [0.8, 3.75, -0.8, 0.12],
    [-3.0, 1.4, 0.6, 0.12], [3.0, 1.65, 0.3, 0.17],
  ];
  ornaments.forEach(([x, y, z, size], i) => {
    const obj = star(size, i % 2 ? accent : gold, scene, [x, y, z]);
    floating.push({ obj, y, phase: i * 2 });
  });

  // Small physical decorations on the tabletop, with seeded placement.
  const confettiMats = [palette.forest, palette.sand, palette.slate, palette.mist].map(c => material(c));
  for (let i = 0; i < 42; i++) {
    const angle = i * 2.39996, radius = 1.1 + ((i * 17) % 21) / 12;
    const piece = mesh(new THREE.BoxGeometry(0.08, 0.012, 0.04), confettiMats[i % 4], stage, [Math.cos(angle) * radius, 0.015, Math.sin(angle) * radius]);
    piece.rotation.y = i * 1.3;
    piece.castShadow = false;
  }

  return {
    scene, renderer,
    update() {
      const time = state.elapsed;
      const motion = state.reducedMotion ? 0.3 : 1;
      for (const { pivot, phase } of balloonGroups) {
        pivot.rotation.z = Math.sin(time * 0.65 + phase) * 0.035 * motion;
        pivot.rotation.x = Math.cos(time * 0.5 + phase) * 0.022 * motion;
      }
      for (const { obj, y, phase } of floating) {
        obj.position.y = y + Math.sin(time * 1.15 + phase) * 0.1 * motion;
        obj.rotation.y = Math.sin(time * 0.7 + phase) * 0.5;
        obj.rotation.z = Math.sin(time * 0.9 + phase) * 0.14;
      }
    },
  };
}

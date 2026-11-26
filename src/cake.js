import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import fontData from 'three/examples/fonts/helvetiker_bold.typeface.json';
import { state } from './state.js';
import { palette, material, mesh, sphere, heart, star } from './geometry.js';

export function createCake(scene) {
  const root = new THREE.Group();
  root.position.set(-0.95, 0, 0.45);
  scene.add(root);
  const cream = material(palette.cream, { roughness: 0.7 });
  const pink = material(palette.pink, { roughness: 0.67 });
  const rose = material(palette.rose, { roughness: 0.6 });
  const gold = material(palette.gold, { metalness: 0.58, roughness: 0.24 });
  const mint = material('#8cb79f', { roughness: 0.7 });
  // Foot, stem and scalloped serving plate are independent pieces.
  mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.1, 64), cream, root, [0, 0.06, 0]);
  mesh(new THREE.CylinderGeometry(0.21, 0.38, 0.34, 32), pink, root, [0, 0.25, 0]);
  mesh(new THREE.CylinderGeometry(1.15, 1.11, 0.11, 72), cream, root, [0, 0.46, 0]);
  const plateRim = mesh(new THREE.TorusGeometry(1.105, 0.028, 8, 72), gold, root, [0, 0.51, 0]);
  plateRim.rotation.x = Math.PI / 2;

  mesh(new THREE.CylinderGeometry(0.94, 0.94, 0.7, 72), pink, root, [0, 0.87, 0]);
  mesh(new THREE.CylinderGeometry(0.96, 0.96, 0.11, 72), cream, root, [0, 1.23, 0]);
  mesh(new THREE.CylinderGeometry(0.67, 0.67, 0.56, 64), cream, root, [0, 1.54, 0]);
  mesh(new THREE.CylinderGeometry(0.69, 0.69, 0.09, 64), pink, root, [0, 1.85, 0]);

  // Rounded icing drips follow both circular tiers, with alternating lengths.
  for (const tier of [{ r: 0.92, y: 1.2, count: 22, mat: cream }, { r: 0.65, y: 1.82, count: 16, mat: pink }]) {
    for (let i = 0; i < tier.count; i++) {
      const a = i / tier.count * Math.PI * 2;
      const length = 0.13 + (i % 3) * 0.042;
      sphere(0.095, tier.mat, root, [Math.cos(a) * tier.r, tier.y - length * 0.3, Math.sin(a) * tier.r], [1, length / 0.095, 1]);
    }
  }
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * Math.PI * 2;
    const dollop = sphere(0.075, cream, root, [Math.cos(a) * 0.95, 0.57, Math.sin(a) * 0.95], [1, 1.2, 1]);
    dollop.rotation.y = a;
  }
  for (let i = 0; i < 9; i++) {
    const a = i / 9 * Math.PI * 2;
    const x = Math.cos(a) * 0.76, z = Math.sin(a) * 0.76;
    const berry = new THREE.Group();
    berry.position.set(x, 1.37, z);
    berry.rotation.z = 0.18 * Math.sin(a);
    root.add(berry);
    sphere(0.105, rose, berry, [0, 0, 0], [1, 1.3, 1]);
    for (let leaf = 0; leaf < 3; leaf++) {
      const l = sphere(0.055, mint, berry, [Math.cos(leaf * 2.1) * 0.035, 0.11, Math.sin(leaf * 2.1) * 0.035], [1, 0.16, 0.5]);
      l.rotation.y = leaf * 2.1;
    }
  }
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2;
    sphere(0.055, cream, root, [Math.cos(a) * 0.58, 1.94, Math.sin(a) * 0.58]);
  }
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i / 5) * Math.PI;
    const ornament = heart(0.1, rose, root, [Math.sin(a) * 0.96, 0.87, Math.cos(a) * 0.96]);
    ornament.rotation.y = a;
  }

  const font = new FontLoader().parse(fontData);
  const flames = [];
  for (const [digit, x] of [['1', -0.29], ['8', 0.23]]) {
    const geometry = new TextGeometry(digit, { font, size: 0.66, depth: 0.13, curveSegments: 8, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.018, bevelSegments: 3 });
    geometry.computeBoundingBox();
    geometry.translate(-(geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2, 0, 0);
    mesh(geometry, gold, root, [x, 1.94, 0.03]);
    mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.13, 8), material('#6f4251'), root, [x, 2.65, 0.1]);
    const flameRoot = new THREE.Group();
    flameRoot.position.set(x, 2.77, 0.1);
    root.add(flameRoot);
    const flame = sphere(0.071, new THREE.MeshBasicMaterial({ color: 0xffba47, transparent: true, opacity: 0.9 }), flameRoot, [0, 0, 0], [0.8, 1.8, 0.7]);
    sphere(0.042, new THREE.MeshBasicMaterial({ color: 0xfff7d4 }), flameRoot, [0, -0.02, 0.035], [0.7, 1.6, 0.6]);
    const light = new THREE.PointLight(0xffbd66, 0.65, 2.2, 2);
    light.position.copy(flameRoot.position);
    root.add(light);
    flames.push({ flameRoot, flame, light, phase: x * 7 });
  }
  const topper = star(0.12, gold, root, [0.6, 2.27, -0.25]);
  mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.4, 8), gold, root, [0.6, 2.04, -0.25]);

  const hitTarget = mesh(new THREE.CylinderGeometry(1.1, 1.1, 2.9, 12), new THREE.MeshBasicMaterial({ visible: false }), root, [0, 1.4, 0]);
  hitTarget.userData.action = 'candle';
  return {
    root, hitTarget,
    update() {
      const reveal = state.reveal;
      root.visible = reveal > 0.01;
      root.scale.setScalar(Math.max(0.001, reveal));
      root.position.y = -0.3 * (1 - reveal);
      root.rotation.y = (1 - reveal) * -0.35;
      for (const { flameRoot, light, phase } of flames) {
        const flicker = 1 + Math.sin(state.elapsed * 12 + phase) * 0.1;
        flameRoot.scale.set(state.candleLevel, state.candleLevel * flicker, state.candleLevel);
        flameRoot.rotation.z = Math.sin(state.elapsed * 9 + phase) * 0.12;
        flameRoot.visible = state.candleLevel > 0.01;
        light.intensity = state.candleLevel * 0.55 * flicker;
      }
      topper.rotation.y = Math.sin(state.elapsed) * 0.12;
    },
  };
}

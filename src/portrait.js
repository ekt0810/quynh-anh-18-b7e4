import * as THREE from 'three';
import { state, on } from './state.js';
import { palette, material, mesh, roundedBox, heart, svgTexture } from './geometry.js';

export function createPortrait(scene, manager) {
  const root = new THREE.Group();
  root.position.set(1.23, 1.65, 0.28);
  root.rotation.z = -0.095;
  root.rotation.y = -0.11;
  scene.add(root);

  const paper = material('#faf9f3', { roughness: 0.82 });
  roundedBox([1.92, 2.46, 0.1], paper, root, [0, 0, 0], 0.06);
  const texture = new THREE.TextureLoader(manager).load('./quynh-anh.png');
  texture.colorSpace = THREE.SRGBColorSpace;
  // Crop only the display UVs; keep the supplied photograph untouched.
  texture.repeat.set(0.45, 0.77);
  texture.offset.set(0.275, 0.17);
  const photograph = mesh(new THREE.PlaneGeometry(1.68, 1.91), new THREE.MeshBasicMaterial({ map: texture }), root, [0, 0.12, 0.057]);
  photograph.castShadow = false;
  const caption = mesh(new THREE.PlaneGeometry(1.7, 0.28), new THREE.MeshBasicMaterial({ map: svgTexture('birthday girl ♡', { italic: true }), transparent: true, depthWrite: false }), root, [0, -1.015, 0.06]);
  caption.castShadow = false;
  const tape = roundedBox([0.58, 0.23, 0.025], material('#c6c5ae', { transparent: true, opacity: 0.78, roughness: 0.9 }), root, [0.1, 1.2, 0.07], 0.012);
  tape.rotation.z = 0.14;
  const sticker = heart(0.22, material(palette.forest, { metalness: 0.05, roughness: 0.72 }), root, [0.78, -0.87, 0.13]);
  sticker.rotation.z = -0.16;
  const back = roundedBox([1.1, 1.7, 0.09], material('#b7c0b1'), root, [0, -0.08, -0.25], 0.025);
  back.rotation.x = -0.28;

  photograph.userData.action = 'photo';
  let bounceAt = -100;
  on('photo', () => { bounceAt = state.elapsed; });
  return {
    root, hitTarget: photograph,
    update() {
      const motion = state.reducedMotion ? 0.2 : 1;
      const bounce = Math.exp(-(state.elapsed - bounceAt) * 3) * Math.sin((state.elapsed - bounceAt) * 10);
      root.position.y = 1.63 + Math.sin(state.elapsed * 0.9) * 0.045 * motion + bounce * 0.1;
      root.rotation.z = -0.095 + Math.sin(state.elapsed * 0.65) * 0.018 * motion;
      sticker.rotation.y = Math.sin(state.elapsed * 1.2) * 0.14;
    },
  };
}

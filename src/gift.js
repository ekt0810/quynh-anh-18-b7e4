import * as THREE from 'three';
import { state, smooth } from './state.js';
import { palette, material, mesh, roundedBox, tube, svgTexture } from './geometry.js';

export function createGift(scene) {
  const root = new THREE.Group();
  scene.add(root);
  const wrapping = material(palette.forest, { roughness: 0.74 });
  const ribbon = material(palette.cream, { metalness: 0.05, roughness: 0.65 });
  const inner = material(palette.sage, { roughness: 0.8 });

  // Four walls and an inset base leave a real cavity beneath the hinged lid.
  roundedBox([1.7, 0.12, 1.5], inner, root, [0, 0.06, 0]);
  for (const z of [-0.7, 0.7]) roundedBox([1.7, 1.25, 0.1], wrapping, root, [0, 0.69, z]);
  for (const x of [-0.8, 0.8]) roundedBox([0.1, 1.25, 1.4], wrapping, root, [x, 0.69, 0]);
  for (const z of [-0.758, 0.758]) roundedBox([0.23, 1.26, 0.016], ribbon, root, [0, 0.69, z], 0.006);
  for (const x of [-0.858, 0.858]) roundedBox([0.016, 1.26, 0.23], ribbon, root, [x, 0.69, 0], 0.006);

  const lid = new THREE.Group();
  lid.position.y = 1.4;
  root.add(lid);
  roundedBox([1.82, 0.24, 1.62], wrapping, lid, [0, 0, 0]);
  roundedBox([0.25, 0.025, 1.65], ribbon, lid, [0, 0.135, 0], 0.008);
  roundedBox([1.84, 0.025, 0.25], ribbon, lid, [0, 0.137, 0], 0.008);
  for (const side of [-1, 1]) {
    tube([[0, 0.22, 0], [side * 0.42, 0.67, 0.03], [side * 0.68, 0.48, 0.02], [side * 0.38, 0.23, 0.03], [0, 0.22, 0]], 0.07, ribbon, lid, 32);
    tube([[side * 0.1, 0.22, 0], [side * 0.2, 0.2, 0.44], [side * 0.32, 0.08, 0.76], [side * 0.3, -0.24, 0.85]], 0.065, ribbon, lid, 24);
  }
  roundedBox([0.28, 0.22, 0.21], ribbon, lid, [0, 0.24, 0.03], 0.075);

  const tag = new THREE.Group();
  tag.position.set(0.48, 0.84, 0.77);
  tag.rotation.z = -0.17;
  root.add(tag);
  roundedBox([0.54, 0.43, 0.025], material(palette.cream), tag, [0, 0, 0], 0.045);
  const text = mesh(new THREE.PlaneGeometry(0.5, 0.22), new THREE.MeshBasicMaterial({ map: svgTexture('for you', { width: 300, height: 120, fontSize: 60, italic: true }), transparent: true }), tag, [0, 0, 0.018]);
  text.castShadow = false;
  tube([[0.48, 1.39, 0.75], [0.36, 1.14, 0.78], [0.48, 1.02, 0.79]], 0.01, ribbon, root, 16);

  const hitTarget = mesh(new THREE.BoxGeometry(1.9, 2.0, 1.8), new THREE.MeshBasicMaterial({ visible: false }), root, [0, 0.85, 0]);
  hitTarget.userData.action = 'gift';
  return {
    root, hitTarget,
    update() {
      const t = state.phase === 'wrapped' ? 0 : state.elapsed - state.openedAt;
      const lift = smooth(t / 0.8);
      const relocate = smooth((t - 0.7) / 1.3);
      const settle = smooth((t - 1.2) / 1.1);
      const wiggle = state.phase === 'wrapped' ? Math.sin(state.elapsed * 2) * 0.025 : 0;
      root.position.set(-0.95 - relocate * 1.58, 0.03, 0.45 + relocate * 0.4);
      root.rotation.set(0, -0.14 - relocate * 0.24, wiggle);
      root.scale.setScalar(1 - relocate * 0.58);
      lid.position.set(settle * -0.48, 1.4 + lift * 2.1 - settle * 1.95, -lift * 0.3 - settle * 0.55);
      lid.rotation.set(-lift * 0.45 - settle * 0.32, lift * 0.2, settle * 0.38);
      tag.rotation.z = -0.17 + Math.sin(state.elapsed * 1.5) * 0.045;
    },
  };
}

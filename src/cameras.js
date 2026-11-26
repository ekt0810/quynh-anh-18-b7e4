import * as THREE from 'three';
import { state } from './state.js';

export function createCamera(renderer) {
  const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 60);
  const target = new THREE.Vector3();
  const aim = new THREE.Vector3();
  let distance = 12;
  function resize() {
    const width = innerWidth, height = innerHeight;
    Object.assign(state.viewport, { width, height, mobile: width < 700 });
    camera.aspect = width / height;
    // Frame the whole miniature by horizontal angle on narrow screens.
    distance = Math.max(10.8, (width < 700 ? 2.6 : 4.25) / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect));
    distance = Math.min(distance, 28);
    camera.far = Math.max(60, distance + 40);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, width < 700 ? 1.65 : 2));
    renderer.setSize(width, height);
  }
  function update(immediate = false) {
    const portrait = state.viewport.mobile;
    const motion = state.reducedMotion ? 0 : 1;
    const parallax = portrait ? 0.06 : 0.3;
    target.set(state.pointer.x * parallax * motion, 3.5 + distance * 0.12 - state.pointer.y * 0.12 * motion, distance);
    // A higher look-at point leaves room below the scene for the greeting HUD.
    aim.set(0, portrait ? 1.7 + (state.viewport.height / state.viewport.width - 1.6) * 0.32 : 1.35, 0);
    camera.position.lerp(target, immediate ? 1 : 1 - Math.exp(-state.delta * 3));
    camera.lookAt(aim);
    // Move the projected scene up, keeping the bottom controls off the cake.
    const offsetY = portrait ? (document.body.classList.contains('music-visible') ? -0.075 : 0.055) : 0.025;
    camera.setViewOffset(state.viewport.width, state.viewport.height, 0, state.viewport.height * offsetY, state.viewport.width, state.viewport.height);
  }
  resize();
  update(true);
  window.addEventListener('resize', resize);
  return { camera, resize, update };
}

import './style.css';
import * as THREE from 'three';
import { state, tick, openGift, celebrate, emit } from './state.js';
import { createWorld } from './world.js';
import { createCamera } from './cameras.js';
import { createCake } from './cake.js';
import { createGift } from './gift.js';
import { createPortrait } from './portrait.js';
import { createEffects } from './effects.js';
import { createMusic } from './music.js';
import { createUI } from './ui.js';

const music = createMusic();
const ui = createUI(music);
const canvas = document.querySelector('#scene');
const loading = document.querySelector('#loading');
let world, cameraSystem, cake, gift, portrait, effects;
let firstFrame = false, photoLoaded = false, lastTime = performance.now();
const manager = new THREE.LoadingManager();
const finishLoading = () => {
  if (firstFrame && photoLoaded) {
    loading.classList.add('complete');
    document.body.dataset.ready = 'true';
  }
};
manager.onLoad = () => { photoLoaded = true; finishLoading(); };
manager.onError = () => { photoLoaded = true; finishLoading(); ui.toast('Ảnh chưa tải xong. Thử tải lại trang giúp mình nha.'); };

try {
  world = createWorld(canvas);
  cameraSystem = createCamera(world.renderer);
  cake = createCake(world.scene);
  gift = createGift(world.scene);
  portrait = createPortrait(world.scene, manager);
  effects = createEffects(world.scene);
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  function hitAt(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.set((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height * 2 - 1));
    raycaster.setFromCamera(mouse, cameraSystem.camera);
    const targets = [portrait.hitTarget];
    if (state.phase === 'wrapped') targets.push(gift.hitTarget);
    if (state.phase === 'wish') targets.push(cake.hitTarget);
    return raycaster.intersectObjects(targets, false)[0]?.object.userData.action;
  }
  canvas.addEventListener('pointermove', event => {
    state.pointer.x = event.clientX / innerWidth * 2 - 1;
    state.pointer.y = event.clientY / innerHeight * 2 - 1;
    canvas.style.cursor = hitAt(event) ? 'pointer' : 'default';
  });
  canvas.addEventListener('pointerleave', () => { state.pointer.x = 0; state.pointer.y = 0; });
  canvas.addEventListener('click', event => {
    const hit = hitAt(event);
    if (hit === 'gift') { music.start({ fromGift: true }); openGift(); }
    else if (hit === 'candle') celebrate();
    else if (hit === 'photo') emit('photo');
  });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    state.running = false;
    ui.toast('Đang khôi phục bữa tiệc…');
  });
  canvas.addEventListener('webglcontextrestored', () => { location.reload(); });
} catch (error) {
  console.error('Birthday scene initialization failed:', error);
  document.body.classList.add('no-webgl');
  photoLoaded = true;
}

let frames = 0;
function frame(now) {
  tick((now - lastTime) / 1000);
  lastTime = now;
  if (world && cameraSystem && cake && gift && portrait && effects) {
    world.update();
    cameraSystem.update();
    cake.update();
    gift.update();
    portrait.update();
    effects.update();
    world.renderer.render(world.scene, cameraSystem.camera);
  }
  frames++;
  if (frames % 60 === 0) canvas.dataset.frames = String(frames);
  if (!firstFrame) { firstFrame = true; finishLoading(); }
}
if (world?.renderer) world.renderer.setAnimationLoop(frame);
else {
  const fallbackFrame = now => { frame(now); requestAnimationFrame(fallbackFrame); };
  requestAnimationFrame(fallbackFrame);
}
document.addEventListener('visibilitychange', () => {
  state.running = !document.hidden;
  lastTime = performance.now();
});
if (import.meta.env.DEV) window.__birthday = { state, world, cake, gift, portrait, music };

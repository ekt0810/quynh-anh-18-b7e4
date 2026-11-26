import * as THREE from 'three';
import { state, on } from './state.js';
import { palette } from './geometry.js';

export function createEffects(scene) {
  const count = state.viewport.mobile ? 240 : 430;
  const geometry = new THREE.PlaneGeometry(0.07, 0.13);
  const mat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.45, metalness: 0.12 });
  const pieces = new THREE.InstancedMesh(geometry, mat, count);
  pieces.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  pieces.frustumCulled = false;
  scene.add(pieces);
  const dummy = new THREE.Object3D();
  const colors = [palette.rose, palette.gold, palette.mint, palette.lilac, palette.cream].map(c => new THREE.Color(c));
  const particles = Array.from({ length: count }, (_, i) => ({
    position: new THREE.Vector3(), velocity: new THREE.Vector3(),
    rotation: new THREE.Euler(), spin: new THREE.Vector3(), life: 0, seed: i * 0.53,
  }));
  particles.forEach((p, i) => {
    dummy.scale.setScalar(0);
    dummy.updateMatrix();
    pieces.setMatrixAt(i, dummy.matrix);
    pieces.setColorAt(i, colors[i % colors.length]);
  });
  pieces.instanceColor.needsUpdate = true;

  function burst(strength = 1) {
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const angle = Math.random() * Math.PI * 2;
      const speed = (1.2 + Math.random() * 2.3) * strength;
      p.position.set(-0.3 + (Math.random() - 0.5) * 0.9, 1.8 + Math.random() * 0.6, 0.6);
      p.velocity.set(Math.cos(angle) * speed, 2.2 + Math.random() * 3.3, Math.sin(angle) * speed * 0.6);
      p.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      p.spin.set(Math.random() * 7 - 3.5, Math.random() * 6 - 3, Math.random() * 8 - 4);
      p.life = 5.5 + Math.random() * 2;
    }
  }
  let openBurstAt = Infinity;
  on('open', () => { openBurstAt = state.elapsed + 0.7; });
  on('celebrate', () => burst(1.35));
  on('confetti', () => burst(1.2));
  on('reset', () => { openBurstAt = Infinity; particles.forEach(p => { p.life = 0; }); });

  // Quiet, continuously moving points make the scene alive before any click.
  const dustCount = 65;
  const positions = new Float32Array(dustCount * 3);
  const dustSeeds = [];
  for (let i = 0; i < dustCount; i++) {
    dustSeeds.push({ x: Math.sin(i * 85.3) * 4.5, y: (i * 0.713) % 5, z: Math.cos(i * 73.2) * 2 });
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: '#fffdf0', size: 0.042, transparent: true, opacity: 0.8, depthWrite: false }));
  scene.add(dust);

  return {
    update() {
      const dt = state.delta, time = state.elapsed;
      if (time > openBurstAt) { burst(0.85); openBurstAt = Infinity; }
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) { dummy.scale.setScalar(0); }
        else {
          p.velocity.y -= 2.7 * dt;
          p.velocity.x *= Math.exp(-0.22 * dt);
          p.velocity.z *= Math.exp(-0.22 * dt);
          p.position.addScaledVector(p.velocity, dt);
          p.position.x += Math.sin(time * 3 + p.seed) * dt * 0.18;
          if (p.position.y < 0.02) {
            p.position.y = 0.02;
            p.velocity.multiplyScalar(0.78);
            p.velocity.y = 0;
            p.rotation.x = -Math.PI / 2;
          } else {
            p.rotation.x += p.spin.x * dt;
            p.rotation.y += p.spin.y * dt;
            p.rotation.z += p.spin.z * dt;
          }
          dummy.position.copy(p.position);
          dummy.rotation.copy(p.rotation);
          dummy.scale.setScalar(Math.min(1, p.life));
        }
        dummy.updateMatrix();
        pieces.setMatrixAt(i, dummy.matrix);
      }
      pieces.instanceMatrix.needsUpdate = true;
      dustSeeds.forEach((s, i) => {
        positions[i * 3] = s.x + Math.sin(time * 0.3 + i) * 0.13;
        positions[i * 3 + 1] = (s.y + time * 0.065) % 5;
        positions[i * 3 + 2] = s.z;
      });
      dustGeometry.attributes.position.needsUpdate = true;
    },
  };
}

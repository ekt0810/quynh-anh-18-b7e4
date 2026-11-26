import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const palette = { cream: 0xf3f0e7, sage: 0xa7b8a7, forest: 0x38574b, ink: 0x283b33, sand: 0xc5b995, slate: 0x8c9da1, mist: 0xc9d0bf };
export function material(color, options = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0, ...options });
}
export function mesh(geometry, mat, parent, position = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, mat);
  object.position.set(...position);
  object.castShadow = true;
  object.receiveShadow = true;
  if (parent) parent.add(object);
  return object;
}
export function roundedBox(size, mat, parent, position, radius = 0.08) {
  return mesh(new RoundedBoxGeometry(...size, 3, radius), mat, parent, position);
}
export function sphere(radius, mat, parent, position, scale = [1, 1, 1]) {
  const object = mesh(new THREE.SphereGeometry(radius, 24, 16), mat, parent, position);
  object.scale.set(...scale);
  return object;
}
export function tube(points, radius, mat, parent, tubularSegments = 40) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  return mesh(new THREE.TubeGeometry(curve, tubularSegments, radius, 7, false), mat, parent);
}
export function heart(size, mat, parent, position = [0, 0, 0]) {
  const s = new THREE.Shape();
  s.moveTo(0, -0.48);
  s.bezierCurveTo(-0.12, -0.28, -0.58, 0.02, -0.48, 0.32);
  s.bezierCurveTo(-0.4, 0.62, -0.08, 0.57, 0, 0.32);
  s.bezierCurveTo(0.08, 0.57, 0.4, 0.62, 0.48, 0.32);
  s.bezierCurveTo(0.58, 0.02, 0.12, -0.28, 0, -0.48);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.13, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.065, bevelSegments: 3, steps: 1 });
  geo.center();
  const result = mesh(geo, mat, parent, position);
  result.scale.setScalar(size);
  return result;
}
export function star(size, mat, parent, position = [0, 0, 0]) {
  const s = new THREE.Shape();
  for (let n = 0; n < 10; n++) {
    const a = n * Math.PI / 5 + Math.PI / 2;
    const r = n % 2 ? 0.45 : 1;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (n === 0) s.moveTo(x, y); else s.lineTo(x, y);
  }
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: true, bevelSize: 0.035, bevelThickness: 0.035, bevelSegments: 2 });
  geo.center();
  const result = mesh(geo, mat, parent, position);
  result.scale.setScalar(size);
  return result;
}

export function svgTexture(text, { width = 640, height = 140, color = '#425b4c', fontSize = 54, italic = false } = {}) {
  const safeText = text.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="${color}" font-family="Georgia,serif" font-size="${fontSize}" font-style="${italic ? 'italic' : 'normal'}">${safeText}</text></svg>`;
  const texture = new THREE.TextureLoader().load(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

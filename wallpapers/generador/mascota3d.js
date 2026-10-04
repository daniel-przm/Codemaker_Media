// La mascota en 3D: el cubo de la marca, con los ojos en la cara derecha (+X),
// en la misma posición que en el SVG (u,v sobre una cara de lado 80).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';

const G = window.M.geometria;
const LADO_SVG = G.LADO; // 80

/** Un punto (u,v) de la cara +X de un cubo de semilado h, en coordenadas locales. */
const enCaraX = (h, u, v) => new THREE.Vector3(h, h * (1 - (2 * v) / LADO_SVG), h * (1 - (2 * u) / LADO_SVG));

function capsula(ancho, alto, fondo) {
  const r = ancho / 2, s = new THREE.Shape();
  const y0 = -alto / 2 + r, y1 = alto / 2 - r;
  s.moveTo(-r, y0); s.lineTo(-r, y1);
  s.absarc(0, y1, r, Math.PI, 0, true);
  s.lineTo(r, y0);
  s.absarc(0, y0, r, 0, Math.PI, true);
  const g = new THREE.ExtrudeGeometry(s, { depth: fondo, bevelEnabled: true, bevelThickness: fondo * 0.5, bevelSize: fondo * 0.5, bevelSegments: 4, curveSegments: 24 });
  g.translate(0, 0, -fondo);
  return g;
}

const mat = (color, extra = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.38, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.3, envMapIntensity: 0.35, ...extra });

/** Los ojos de la marca sobre la cara +X. */
function ojos(h, color = '#ffffff', { forma = 'capsula', emisivo = 0 } = {}) {
  const g = new THREE.Group();
  const esc = (2 * h) / LADO_SVG;
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.25, emissive: color, emissiveIntensity: emisivo });
  for (const { u, v } of [{ u: 23, v: 24 }, { u: 53, v: 24 }]) {
    const geo = forma === 'capsula'
      ? capsula(G.OJO_ANCHO * esc, G.OJO_ALTO * esc, h * 0.04)
      : new RoundedBoxGeometry(G.OJO_ANCHO * esc * 1.1, G.OJO_ANCHO * esc * 1.6, h * 0.08, 2, h * 0.02);
    const o = new THREE.Mesh(geo, m);
    o.position.copy(enCaraX(h, u, v)).add(new THREE.Vector3(h * 0.005, 0, 0));
    o.rotation.y = Math.PI / 2; // la cápsula mira hacia +X
    o.castShadow = true;
    g.add(o);
  }
  return g;
}

/**
 * Una mascota. `studio` = 'marca' | 'voxel' | 'modeling' | 'form' | 'game' | 'robotics' | 'code'.
 * `lado` es la arista del cubo.
 */
export function mascota(studio = 'marca', lado = 2) {
  const h = lado / 2;
  const grupo = new THREE.Group();
  const P = studio === 'marca' ? { cuerpo: '#007AFB', fondo: '#00316b', detalle: '#ffffff' } : window.M.studios.find((s) => s.id === studio).paleta;
  const sombra = (o) => { o.traverse((c) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } }); return o; };

  if (studio === 'voxel') {
    const m = mat(P.cuerpo, { roughness: 0.45, clearcoat: 0.2 });
    const q = h * 0.96;
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) {
      const c = new THREE.Mesh(new RoundedBoxGeometry(q, q, q, 2, q * 0.06), m);
      c.position.set((x * h) / 2, (y * h) / 2, (z * h) / 2);
      grupo.add(c);
    }
    const mo = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 });
    for (const u of [23, 53]) {
      const o = new THREE.Mesh(new THREE.BoxGeometry(h * 0.06, h * 0.42, h * 0.24), mo);
      o.position.copy(enCaraX(h, u, 26)).add(new THREE.Vector3(0.0, 0, 0));
      grupo.add(o);
    }
    return sombra(grupo);
  }

  const radio = studio === 'form' ? h * 0.62 : h * 0.3;
  let cuerpo = new THREE.Mesh(new RoundedBoxGeometry(lado, lado, lado, 8, radio), mat(P.cuerpo, studio === 'code' ? { roughness: 0.5, clearcoat: 0.3 } : {}));

  if (studio === 'modeling') {
    // La resta booleana: un agujero cilíndrico en la cara de arriba.
    const ev = new Evaluator();
    ev.attributes = ['position', 'normal'];
    const a = new Brush(cuerpo.geometry);
    const b = new Brush(new THREE.CylinderGeometry(h * 0.5, h * 0.5, lado, 48));
    b.position.y = h * 0.7; b.updateMatrixWorld();
    const r = ev.evaluate(a, b, SUBTRACTION);
    cuerpo = new THREE.Mesh(r.geometry, mat(P.cuerpo));
  }
  grupo.add(cuerpo);

  if (studio === 'game') {
    const pant = new THREE.Mesh(new RoundedBoxGeometry(h * 0.05, h * 0.8, h * 1.2, 2, h * 0.02), new THREE.MeshStandardMaterial({ color: P.fondo, roughness: 0.2 }));
    pant.position.copy(enCaraX(h, 38, 26)).add(new THREE.Vector3(0.01, 0, 0));
    grupo.add(pant);
    grupo.add(ojos(h * 1.02, '#e9d5ff', { emisivo: 0.6 }));
    // la cruceta en la cara izquierda (+Z)
    const md = new THREE.MeshStandardMaterial({ color: P.detalle, roughness: 0.3 });
    for (const [w, hh] of [[h * 0.42, h * 0.13], [h * 0.13, h * 0.42]]) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(w, hh, h * 0.06), md);
      c.position.set(h * 0.35, 0, h + 0.005); grupo.add(c);
    }
    for (const [dx, dy] of [[-0.35, 0.05], [-0.6, -0.12]]) {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.08, h * 0.08, h * 0.06, 20), md);
      b.rotation.x = Math.PI / 2; b.position.set(h * dx, h * dy, h + 0.01); grupo.add(b);
    }
    return sombra(grupo);
  }

  if (studio === 'code') {
    const mv = new THREE.MeshStandardMaterial({ color: '#4ADE80', emissive: '#4ADE80', emissiveIntensity: 0.9, roughness: 0.3 });
    // cuatro bits: 1 0 / 0 1
    const bits = [[0, 18, 1], [1, 18, 0], [0, 40, 0], [1, 40, 1]];
    for (const [col, v, uno] of bits) {
      const u = col ? 55 : 25;
      const geo = uno ? new THREE.BoxGeometry(h * 0.05, h * 0.4, h * 0.1) : new THREE.TorusGeometry(h * 0.12, h * 0.04, 10, 28, Math.PI * 2);
      const b = new THREE.Mesh(geo, mv);
      b.position.copy(enCaraX(h, u, v + 6));
      if (!uno) { b.rotation.y = Math.PI / 2; b.scale.set(0.8, 1.35, 1); }
      grupo.add(b);
    }
    // módulos de RAM en el costado (+Z)
    for (let i = 0; i < 4; i++) {
      const r = new THREE.Mesh(new THREE.BoxGeometry(h * 0.1, h * 1.1, h * 0.12), mv);
      r.position.set(h * (0.6 - i * 0.32), -h * 0.1, h + 0.04); grupo.add(r);
    }
    return sombra(grupo);
  }

  grupo.add(ojos(h, '#ffffff'));

  if (studio === 'robotics') {
    const mr = new THREE.MeshStandardMaterial({ color: '#1f2937', roughness: 0.6 });
    const ml = new THREE.MeshStandardMaterial({ color: P.detalle, roughness: 0.3 });
    for (const z of [h * 1.08, -h * 1.08]) {
      const rueda = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.42, h * 0.42, h * 0.18, 40), mr);
      rueda.rotation.x = Math.PI / 2; rueda.position.set(0, -h * 0.75, z); grupo.add(rueda);
      const buje = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.16, h * 0.16, h * 0.2, 24), ml);
      buje.rotation.x = Math.PI / 2; buje.position.copy(rueda.position); grupo.add(buje);
    }
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.035, h * 0.035, h * 0.6, 12), new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.6, roughness: 0.3 }));
    ant.position.set(0, h * 1.25, 0); grupo.add(ant);
    const bola = new THREE.Mesh(new THREE.SphereGeometry(h * 0.13, 24, 16), new THREE.MeshStandardMaterial({ color: P.detalle, emissive: P.detalle, emissiveIntensity: 0.7 }));
    bola.position.set(0, h * 1.58, 0); grupo.add(bola);
  }
  return sombra(grupo);
}

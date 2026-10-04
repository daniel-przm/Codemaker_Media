// Lo común de una escena 3D: renderer, cámara isométrica exacta, luces, fondo y bloom.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export const W = 1920, H = 1080;
/** Ejes de pantalla de la cámara isométrica, en el mundo. */
export const R = new THREE.Vector3(1, 0, -1).normalize();
export const U = new THREE.Vector3(-1, 2, -1).normalize();
export const F = new THREE.Vector3(1, 1, 1).normalize(); // hacia la cámara

export function crear({ alto = 10, centro = [960, 540], fondo = ['#13264a', '#070b16', '#020308'], exposicion = 0.9, bloom = [0.28, 0.5, 0.9], fov = 0 } = {}) {
  const dpr = window.devicePixelRatio;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(dpr);
  renderer.setSize(W, H);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposicion;
  document.body.appendChild(renderer.domElement);

  const escena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  escena.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  escena.environmentIntensity = 0.35;

  // Fondo: degradado radial pintado en un canvas.
  const c = document.createElement('canvas'); c.width = 1920; c.height = 1080;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(1100, 420, 0, 1100, 420, 1300);
  g.addColorStop(0, fondo[0]); g.addColorStop(0.55, fondo[1]); g.addColorStop(1, fondo[2]);
  x.fillStyle = g; x.fillRect(0, 0, 1920, 1080);
  const tf = new THREE.CanvasTexture(c); tf.colorSpace = THREE.SRGBColorSpace;
  escena.background = tf;

  // Cámara ortográfica en isométrica exacta: así el cubo se ve como el hexágono de la marca.
  const ancho = (alto * W) / H;
  // fov = 0: isométrica exacta. fov > 0: perspectiva con el mismo encuadre en el plano del objetivo.
  const dist = fov ? (alto / 2) / Math.tan((fov * Math.PI) / 360) : 60;
  const cam = fov ? new THREE.PerspectiveCamera(fov, W / H, 0.1, 400) : new THREE.OrthographicCamera(-ancho / 2, ancho / 2, alto / 2, -alto / 2, 0.1, 200);
  const pxPorUnidad = H / alto;
  // El origen del mundo cae en `centro` (px de pantalla).
  const objetivo = new THREE.Vector3()
    .addScaledVector(R, -(centro[0] - W / 2) / pxPorUnidad)
    .addScaledVector(U, (centro[1] - H / 2) / pxPorUnidad);
  cam.position.copy(objetivo).addScaledVector(F, dist);
  cam.up.set(0, 1, 0);
  cam.lookAt(objetivo);

  /** Un punto del mundo a partir de px de pantalla (relativos al origen) y una profundidad. */
  const enPantalla = (dx, dy, prof = 0) => new THREE.Vector3()
    .addScaledVector(R, dx / pxPorUnidad).addScaledVector(U, -dy / pxPorUnidad).addScaledVector(F, prof);

  escena.add(new THREE.HemisphereLight('#cfe0ff', '#0b1630', 0.25));
  const sol = new THREE.DirectionalLight('#ffffff', 1.7);
  sol.position.set(7, 12, 3);
  sol.castShadow = true;
  sol.shadow.mapSize.set(4096, 4096);
  Object.assign(sol.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 0.5, far: 60 });
  sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.02; sol.shadow.radius = 6;
  escena.add(sol);
  const relleno = new THREE.DirectionalLight('#7fb0ff', 0.35); relleno.position.set(-6, 3, 8); escena.add(relleno);
  const contra = new THREE.DirectionalLight('#9cc9ff', 0.8); contra.position.set(-8, 6, -8); escena.add(contra);

  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(dpr);
  composer.setSize(W, H);
  composer.addPass(new RenderPass(escena, cam));
  if (bloom) composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), ...bloom));
  composer.addPass(new OutputPass());

  return { THREE, renderer, escena, cam, sol, enPantalla, pxPorUnidad, render: () => composer.render() };
}

export function listo(render) {
  render();
  requestAnimationFrame(() => { render(); window.LISTO = true; });
}

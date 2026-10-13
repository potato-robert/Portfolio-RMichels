// @ts-nocheck
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {
  particleWavesFragmentShader,
  particleWavesVertexShader,
} from '../particle-waves-shaders';
import { lerpFactorPerFrame } from './wave-formula';

const SM_BREAKPOINT = 576;
const XL_BREAKPOINT = 1200;

export interface LandingModelScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  mouseX: number;
  mouseY: number;
  windowHalfX: number;
  windowHalfY: number;
  loaded: boolean;
  /** Keeps dot CSS size constant when the renderer pixel ratio is capped below native DPR. */
  pointScale: number;
  particleMaterial: THREE.ShaderMaterial | null;
}

export function setLandingPointScale(landing: LandingModelScene, scale: number): void {
  landing.pointScale = scale;
  if (landing.particleMaterial) landing.particleMaterial.uniforms.uPointScale.value = scale;
}

export function getLandingModelDisplaySize(): { width: number; height: number } {
  const xl = window.innerWidth >= XL_BREAKPOINT;
  return {
    width: window.innerWidth,
    height: xl ? window.innerHeight : window.innerHeight * 0.8,
  };
}

function handleParticles(landing: LandingModelScene, mesh: THREE.Object3D): void {
  const scene = landing.scene;
  const childMesh = mesh as THREE.Mesh;
  if (!childMesh.geometry) return;

  // Position only, non-indexed: one dot per (welded) vertex. Copying the mesh geometry would
  // draw every index entry (several overlapping dots per vertex) and upload unused attributes.
  const pointGeo = new THREE.BufferGeometry();
  const position = childMesh.geometry.getAttribute('position');
  pointGeo.setAttribute('position', position.clone());

  const count = position.count;
  const scales = new Float32Array(count);
  scales.fill(0.06);
  pointGeo.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
  pointGeo.setAttribute('gridIndex', new THREE.BufferAttribute(new Float32Array(count * 2), 2));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0xffffff) },
      uCount: { value: 0 },
      uWaveAnimate: { value: 0 },
      uPointScale: { value: landing.pointScale },
    },
    vertexShader: particleWavesVertexShader,
    fragmentShader: particleWavesFragmentShader,
  });
  landing.particleMaterial = material;

  const particles = new THREE.Points(pointGeo, material);
  particles.scale.copy(mesh.scale);
  particles.rotation.copy(mesh.rotation);
  particles.position.copy(mesh.position);
  scene.add(particles);
}

export function createLandingModelScene(): LandingModelScene {
  const scene = new THREE.Scene();
  const { width, height } = getLandingModelDisplaySize();

  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = window.innerWidth > SM_BREAKPOINT ? 11 : 15;
  camera.rotation.x = -Math.PI / 5;

  scene.add(new THREE.AmbientLight(0xffffff, 0.62));
  const light = new THREE.PointLight(0xc7c7c7, 1.7, 0, 0);
  light.decay = 0;
  light.position.set(-3, 7, 6);
  scene.add(light);

  const windowHalfX =
    window.innerWidth < XL_BREAKPOINT ? window.innerWidth / 2 : (window.innerWidth / 4) * 3;

  return {
    scene,
    camera,
    mouseX: 0,
    mouseY: 0,
    windowHalfX,
    windowHalfY: window.innerHeight / 4,
    loaded: false,
    pointScale: 1,
    particleMaterial: null,
  };
}

export function loadLandingModel(
  landing: LandingModelScene,
  onLoaded?: () => void,
  onError?: (error: unknown) => void,
): void {
  // assets/models/me_v2.glb is the source; rm-assets (glb-pipeline.ts, 'flat-shaded-portrait')
  // emits a tiny meshopt-compressed build without NORMAL, so GLTFLoader enables flatShading.
  // Callers defer invocation until after LCP.
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(
    '/assets/models/me_v2.glb',
    (gltf) => {
      const mesh = gltf.scene.children[0];
      mesh.traverse((node) => {
        if (!(node as THREE.Mesh).isMesh) return;
        const mat = (node as THREE.Mesh).material;
        const materials = Array.isArray(mat) ? mat : [mat];
        for (const m of materials) {
          if (m && 'roughness' in m) {
            (m as THREE.MeshStandardMaterial).roughness = 0.66;
            (m as THREE.MeshStandardMaterial).metalness = 0.01;
          }
        }
      });
      landing.scene.add(mesh);
      handleParticles(landing, mesh);
      landing.loaded = true;
      onLoaded?.();
    },
    undefined,
    (error) => onError?.(error),
  );
}

export function updateLandingModelCamera(landing: LandingModelScene, deltaMs = 1000 / 60): void {
  landing.windowHalfX =
    window.innerWidth < XL_BREAKPOINT ? window.innerWidth / 2 : (window.innerWidth / 4) * 3;
  landing.camera.position.z = window.innerWidth > SM_BREAKPOINT ? 11 : 15;

  const lerp = lerpFactorPerFrame(0.015, deltaMs);
  landing.camera.position.x += (landing.mouseX - landing.camera.position.x) * lerp;
  landing.camera.position.y += (-landing.mouseY - landing.camera.position.y) * lerp;
  landing.camera.lookAt(landing.scene.position);
}

export function setLandingModelMouse(
  landing: LandingModelScene,
  clientX: number,
  clientY: number,
): void {
  landing.mouseX = (landing.windowHalfX - clientX) / 230;
  landing.mouseY = (landing.windowHalfY - clientY) / 230;
}

export function resizeLandingModelCamera(landing: LandingModelScene, width: number, height: number): void {
  landing.camera.aspect = width / height;
  landing.camera.updateProjectionMatrix();
}

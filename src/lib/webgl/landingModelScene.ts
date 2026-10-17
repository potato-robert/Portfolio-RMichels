// @ts-nocheck
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { particleWavesFragmentShader } from '../particle-waves-shaders';
import {
  bindPortraitFaceMaterial,
  portraitPointVertexShader,
  type PortraitFaceUniformSet,
} from '../portrait-face-displace-shaders';
import {
  PORTRAIT_FACE_LIFT,
  PORTRAIT_FACE_NOISE,
  PORTRAIT_FACE_RADIUS,
  PORTRAIT_FACE_SEPARATION,
  expandFaces,
  portraitFaceDisplacementPad,
  portraitPointerNdc,
} from './portraitFaceDisplace';
import { lerpFactorPerFrame } from './wave-formula';

const SM_BREAKPOINT = 576;
const XL_BREAKPOINT = 1200;
const FACE_STRENGTH_LERP = 0.12;
const FACE_HIT_LERP = 0.205;

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
  faceMesh: THREE.Mesh | null;
  faceUniforms: PortraitFaceUniformSet | null;
  faceHit: THREE.Vector3;
  faceTargetHit: THREE.Vector3;
  faceStrength: number;
  faceTime: number;
  faceRaycaster: THREE.Raycaster;
  faceNdc: THREE.Vector2;
  faceInvMatrix: THREE.Matrix4;
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

function packPositions(attribute: THREE.BufferAttribute | THREE.InterleavedBufferAttribute): Float32Array {
  const packed = new Float32Array(attribute.count * 3);
  for (let i = 0; i < attribute.count; i++) {
    packed[i * 3] = attribute.getX(i);
    packed[i * 3 + 1] = attribute.getY(i);
    packed[i * 3 + 2] = attribute.getZ(i);
  }
  return packed;
}

function padBoundingSphere(geometry: THREE.BufferGeometry): void {
  geometry.computeBoundingSphere();
  if (geometry.boundingSphere) geometry.boundingSphere.radius += portraitFaceDisplacementPad();
}

function createPortraitFaceUniforms(): PortraitFaceUniformSet {
  return {
    uHit: { value: new THREE.Vector3() },
    uStrength: { value: 0 },
    uTime: { value: 0 },
    uRadius: { value: PORTRAIT_FACE_RADIUS },
    uLift: { value: PORTRAIT_FACE_LIFT },
    uNoiseAmp: { value: PORTRAIT_FACE_NOISE },
    uCameraRight: { value: new THREE.Vector3(1, 0, 0) },
    uCameraUp: { value: new THREE.Vector3(0, 1, 0) },
    uViewDirection: { value: new THREE.Vector3(0, 0, 1) },
  };
}

function attachPortraitFaces(landing: LandingModelScene, mesh: THREE.Mesh): void {
  const position = mesh.geometry?.getAttribute('position');
  if (!position) return;

  const uniforms = createPortraitFaceUniforms();
  landing.faceUniforms = uniforms;
  landing.faceMesh = mesh;

  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  for (const material of materials) bindPortraitFaceMaterial(material, uniforms);

  // Dots stay on the welded vertices. The visible mesh is unwelded so each
  // facet can translate as a rigid triangle and leave a gap.
  const packed = packPositions(position);
  const index = mesh.geometry.getIndex();
  const expanded = expandFaces(packed, index ? index.array : null);
  const faceGeo = new THREE.BufferGeometry();
  faceGeo.setAttribute('position', new THREE.BufferAttribute(expanded.positions, 3));
  faceGeo.setAttribute('faceCentroid', new THREE.BufferAttribute(expanded.centroids, 3));
  padBoundingSphere(faceGeo);
  const previous = mesh.geometry;
  mesh.geometry = faceGeo;
  previous.dispose();

  const pointGeo = new THREE.BufferGeometry();
  pointGeo.setAttribute('position', new THREE.BufferAttribute(packed, 3));
  const scales = new Float32Array(packed.length / 3);
  scales.fill(0.06);
  pointGeo.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
  padBoundingSphere(pointGeo);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0xffffff) },
      uPointScale: { value: landing.pointScale },
      ...uniforms,
    },
    vertexShader: portraitPointVertexShader,
    fragmentShader: particleWavesFragmentShader,
  });
  landing.particleMaterial = material;

  const particles = new THREE.Points(pointGeo, material);
  particles.scale.copy(mesh.scale);
  particles.rotation.copy(mesh.rotation);
  particles.position.copy(mesh.position);
  landing.scene.add(particles);
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
    faceMesh: null,
    faceUniforms: null,
    faceHit: new THREE.Vector3(),
    faceTargetHit: new THREE.Vector3(),
    faceStrength: 0,
    faceTime: 0,
    faceRaycaster: new THREE.Raycaster(),
    faceNdc: new THREE.Vector2(),
    faceInvMatrix: new THREE.Matrix4(),
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
      const portraitMesh = (mesh as THREE.Mesh).isMesh ? (mesh as THREE.Mesh) : null;
      if (portraitMesh) attachPortraitFaces(landing, portraitMesh);
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

export interface PortraitFacePointer {
  clientX: number;
  clientY: number;
  rect: { left: number; top: number; width: number; height: number };
  deltaMs: number;
  pointerFine: boolean;
  portraitVisible: boolean;
}

function updatePortraitCameraBasis(landing: LandingModelScene, mesh: THREE.Mesh): void {
  const uniforms = landing.faceUniforms;
  if (!uniforms) return;

  landing.camera.updateMatrixWorld();
  mesh.updateWorldMatrix(true, false);
  landing.faceInvMatrix.copy(mesh.matrixWorld).invert();

  uniforms.uCameraRight.value
    .setFromMatrixColumn(landing.camera.matrixWorld, 0)
    .transformDirection(landing.faceInvMatrix);
  uniforms.uCameraUp.value
    .setFromMatrixColumn(landing.camera.matrixWorld, 1)
    .transformDirection(landing.faceInvMatrix);
  uniforms.uViewDirection.value
    .setFromMatrixColumn(landing.camera.matrixWorld, 2)
    .multiplyScalar(-1)
    .transformDirection(landing.faceInvMatrix);
}

/** Raycast the rest pose and ease the face-separation uniforms. GPU displacement does not move the hit. */
export function updatePortraitFaceInteraction(landing: LandingModelScene, pointer: PortraitFacePointer): void {
  const uniforms = landing.faceUniforms;
  const mesh = landing.faceMesh;
  if (!uniforms || !mesh) return;

  const dt = Math.min(Math.max(pointer.deltaMs, 0), 100) * 0.001;
  landing.faceTime += dt;
  uniforms.uTime.value = landing.faceTime;

  const ndc =
    pointer.pointerFine && pointer.portraitVisible
      ? portraitPointerNdc(pointer.rect, pointer.clientX, pointer.clientY)
      : null;

  if (!ndc && landing.faceStrength <= 1e-4) {
    landing.faceStrength = 0;
    uniforms.uStrength.value = 0;
    return;
  }

  let targetStrength = 0;
  if (ndc) {
    landing.camera.updateMatrixWorld();
    mesh.updateWorldMatrix(true, false);
    landing.faceNdc.set(ndc.x, ndc.y);
    landing.faceRaycaster.setFromCamera(landing.faceNdc, landing.camera);
    const hits = landing.faceRaycaster.intersectObject(mesh, false);
    const hit = hits[0];
    if (hit) {
      landing.faceTargetHit.copy(hit.point);
      mesh.worldToLocal(landing.faceTargetHit);
      targetStrength = PORTRAIT_FACE_SEPARATION;
    }
  }

  const strengthLerp = lerpFactorPerFrame(FACE_STRENGTH_LERP, pointer.deltaMs);
  if (targetStrength > 0) {
    if (landing.faceStrength < 1e-3) landing.faceHit.copy(landing.faceTargetHit);
    else landing.faceHit.lerp(landing.faceTargetHit, lerpFactorPerFrame(FACE_HIT_LERP, pointer.deltaMs));
  }
  landing.faceStrength += (targetStrength - landing.faceStrength) * strengthLerp;

  updatePortraitCameraBasis(landing, mesh);
  uniforms.uHit.value.copy(landing.faceHit);
  uniforms.uStrength.value = landing.faceStrength;
}

export function disposeLandingModelScene(landing: LandingModelScene): void {
  landing.scene.traverse((obj) => {
    const drawable = obj as THREE.Mesh | THREE.Points;
    if (!drawable.isMesh && !drawable.isPoints) return;
    drawable.geometry?.dispose();
    const mat = drawable.material;
    if (Array.isArray(mat)) mat.forEach((entry) => entry.dispose());
    else mat?.dispose();
  });
  landing.faceMesh = null;
  landing.faceUniforms = null;
  landing.particleMaterial = null;
}

// @ts-nocheck
import * as THREE from 'three';
import {
  createJoeiddonPerlinState,
  hololensRayAlphaFromLegacyPerlin,
  type PerlinState,
} from '../joeiddon-perlin';

const RAY_VERTEX_SHADER = `
  attribute float distanceAlongLine;
  varying float vDistance;

  void main() {
    vDistance = distanceAlongLine;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RAY_FRAGMENT_SHADER = `
  varying float vDistance;

  uniform float startFadeIn;
  uniform float startSolid;
  uniform float endSolid;
  uniform float endFadeOut;
  uniform float maxAlpha;
  uniform vec3 color;
  uniform vec3 emissiveColor;

  void main() {
    float alpha = 0.0;
    if (vDistance < startFadeIn) {
      alpha = 0.0;
    } else if (vDistance < startSolid) {
      alpha = maxAlpha * (vDistance - startFadeIn) / (startSolid - startFadeIn);
    } else if (vDistance < endSolid) {
      alpha = maxAlpha;
    } else if (vDistance < endFadeOut) {
      alpha = maxAlpha * (1.0 - (vDistance - endSolid) / (endFadeOut - endSolid));
    } else {
      alpha = 0.0;
    }
    vec3 finalColor = mix(color, emissiveColor, alpha);
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export interface HololensMockupState {
  hololens: THREE.Object3D | null;
  origHololensPosition: THREE.Vector3 | null;
  holograms: THREE.Mesh[];
  rays: THREE.Line[];
  perlin: PerlinState;
}

export function createHololensMockupState(): HololensMockupState {
  return {
    hololens: null,
    origHololensPosition: null,
    holograms: [],
    rays: [],
    perlin: createJoeiddonPerlinState(),
  };
}

/** Legacy threeJsMockup.js read Ray node geometry directly (not only Mesh). */
function getRayLineEndpointsLocal(node: THREE.Object3D): [THREE.Vector3, THREE.Vector3] | null {
  const lineLike = node as THREE.Line;
  const mesh = node as THREE.Mesh;
  const geometry =
    lineLike.isLine || (lineLike as THREE.LineSegments).isLineSegments
      ? lineLike.geometry
      : mesh.isMesh
        ? mesh.geometry
        : null;
  if (!geometry) return null;
  const positionAttribute = geometry.getAttribute('position');
  if (!positionAttribute || positionAttribute.count < 2) return null;
  return [
    new THREE.Vector3().fromBufferAttribute(positionAttribute, 0),
    new THREE.Vector3().fromBufferAttribute(positionAttribute, 1),
  ];
}

/**
 * Legacy createLine() used Ray-local vertices and mockupMesh.attach(line).
 * Current GLB Ray nodes have rotation/scale on the node; preserve that TRS on the
 * shader line (sibling under the same parent) so orientation matches LineSegments.
 */
function createRayLineFromNode(
  rayNode: THREE.Object3D,
  mockupMesh: THREE.Object3D,
  rays: THREE.Line[],
): void {
  const local = getRayLineEndpointsLocal(rayNode);
  if (!local) return;

  const geometry = new THREE.BufferGeometry().setFromPoints(local);
  const distanceAlongLine = new Float32Array([0, 1]);
  geometry.setAttribute('distanceAlongLine', new THREE.BufferAttribute(distanceAlongLine, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: RAY_VERTEX_SHADER,
    fragmentShader: RAY_FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    uniforms: {
      startFadeIn: { value: 0.15 },
      startSolid: { value: 0.5 },
      endSolid: { value: 0.55 },
      endFadeOut: { value: 0.95 },
      maxAlpha: { value: 1 },
      color: { value: new THREE.Color(0.7, 0.7, 1) },
      emissiveColor: { value: new THREE.Color(0.6, 0.6, 1) },
    },
  });

  const line = new THREE.Line(geometry, material);
  const parent = rayNode.parent ?? mockupMesh;
  parent.add(line);
  line.position.copy(rayNode.position);
  line.quaternion.copy(rayNode.quaternion);
  line.scale.copy(rayNode.scale);

  rays.push(line);
}

export function processHololensMockupMesh(
  mockupMesh: THREE.Object3D,
  state: HololensMockupState,
): void {
  const raysMeshToRemove: THREE.Object3D[] = [];

  mockupMesh.traverse((node) => {
    if (node.name === 'Hololens') {
      state.origHololensPosition = new THREE.Vector3(node.position.x, node.position.y, node.position.z);
      state.hololens = node;
    }
    if (node.name.includes('Ray')) {
      createRayLineFromNode(node, mockupMesh, state.rays);
      raysMeshToRemove.push(node);
      return;
    }
    if ((node as THREE.Mesh).isMesh) {
      const mesh = node as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat?.name === 'Hologram') {
        mat.emissive = new THREE.Color(0x555577);
        state.holograms.push(mesh);
      } else if (mat) {
        mat.blending = THREE.NormalBlending;
        mat.needsUpdate = true;
      }
    }
  });

  if (state.hololens) {
    state.holograms.forEach((hologram) => {
      state.hololens!.attach(hologram);
    });
  }

  raysMeshToRemove.forEach((rayMesh) => mockupMesh.remove(rayMesh));
}

const HOLO_START_EMISSIVE = new THREE.Color(0x404055);
const HOLO_END_EMISSIVE = new THREE.Color(0xaaaacc);

export function animateHololensMockup(
  state: HololensMockupState,
  cameraX: number,
  cameraY: number,
  mouseX: number,
  timeMs: number,
): void {
  const timeShift = timeMs * 0.0005;
  let lastValue = 0;

  state.rays.forEach((ray, index) => {
    const noiseValue = hololensRayAlphaFromLegacyPerlin(
      state.perlin,
      cameraX,
      cameraY,
      index,
      timeShift,
    );
    // Legacy perlin can be negative; shader alpha must stay >= 0 (threeJsMockup.js comment).
    (ray.material as THREE.ShaderMaterial).uniforms.maxAlpha.value = Math.max(0, noiseValue);
    lastValue = noiseValue;
  });

  const emissiveColor = HOLO_START_EMISSIVE.clone().lerp(HOLO_END_EMISSIVE, lastValue);
  state.holograms.forEach((hologram) => {
    (hologram.material as THREE.MeshStandardMaterial).emissive = emissiveColor;
  });

  if (state.hololens && state.origHololensPosition) {
    const hlTimeOffset = Math.sin(timeMs * 0.001) * 3;
    state.hololens.position.z = state.origHololensPosition.z + hlTimeOffset;
    state.hololens.position.x = state.origHololensPosition.x - mouseX / 200;
  }
}

export function disposeHololensMockupState(state: HololensMockupState): void {
  state.rays.forEach((ray) => {
    ray.geometry.dispose();
    (ray.material as THREE.Material).dispose();
  });
  state.rays.length = 0;
  state.holograms.length = 0;
  state.hololens = null;
  state.origHololensPosition = null;
}

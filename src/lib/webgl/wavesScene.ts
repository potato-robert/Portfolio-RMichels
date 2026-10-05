// @ts-nocheck
import * as THREE from 'three';
import { getDevicePerformanceTier } from '../device-capability';
import {
  particleWavesFragmentShader,
  particleWavesVertexShader,
} from '../particle-waves-shaders';
import { advanceWaveCount } from './wave-formula';

const SEPARATION = 160;

export interface ParticleGrid {
  amountX: number;
  amountY: number;
}

export function getParticleGrid(): ParticleGrid {
  const w = window.innerWidth;
  const tier = getDevicePerformanceTier();

  if (tier === 'reduced') {
    if (w < 768) return { amountX: 70, amountY: 16 };
    if (w < 1200) return { amountX: 90, amountY: 24 };
    return { amountX: 120, amountY: 30 };
  }

  if (w < 768) return { amountX: 90, amountY: 20 };
  if (w < 1200) return { amountX: 120, amountY: 30 };
  return { amountX: 180, amountY: 40 };
}

export interface WavesScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  particles: THREE.Points;
  material: THREE.ShaderMaterial;
  amountX: number;
  amountY: number;
  count: number;
}

export function createWavesScene(grid?: ParticleGrid): WavesScene {
  const { amountX, amountY } = grid ?? getParticleGrid();
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(120, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = 3500;

  const numParticles = amountX * amountY;
  const positions = new Float32Array(numParticles * 3);
  const gridIndices = new Float32Array(numParticles * 2);

  let i = 0;
  let gi = 0;
  for (let ix = 0; ix < amountX; ix++) {
    for (let iy = 0; iy < amountY; iy++) {
      positions[i] = ix * SEPARATION - (amountX * SEPARATION) / 2;
      positions[i + 1] = 0;
      positions[i + 2] = iy * SEPARATION - (amountY * SEPARATION) / 2;
      gridIndices[gi] = ix;
      gridIndices[gi + 1] = iy;
      i += 3;
      gi += 2;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('gridIndex', new THREE.BufferAttribute(gridIndices, 2));
  geometry.setAttribute(
    'scale',
    new THREE.BufferAttribute(new Float32Array(numParticles).fill(1), 1),
  );

  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0x666666) },
      uCount: { value: 0 },
      uWaveAnimate: { value: 1 },
    },
    vertexShader: particleWavesVertexShader,
    fragmentShader: particleWavesFragmentShader,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  return { scene, camera, particles, material, amountX, amountY, count: 0 };
}

export function updateWavesCamera(
  waves: WavesScene,
  scrollY: number,
  docHeight: number,
): void {
  waves.camera.position.y = docHeight - scrollY + 100;

  const t = Math.max(0, Math.min(1, scrollY / docHeight));
  const newCol = 0.13 + t * (0.38 - 0.13);
  waves.material.uniforms.color.value.setRGB(newCol, newCol, newCol);
}

export function animateWavesParticles(waves: WavesScene, deltaMs: number, active = true): void {
  if (!active) return;
  waves.count = advanceWaveCount(waves.count, deltaMs);
  waves.material.uniforms.uCount.value = waves.count;
}

export function resizeWavesCamera(waves: WavesScene): void {
  waves.camera.aspect = window.innerWidth / window.innerHeight;
  waves.camera.updateProjectionMatrix();
}

export function disposeWavesScene(waves: WavesScene): void {
  waves.particles.geometry.dispose();
  waves.material.dispose();
}

// @ts-nocheck
import * as THREE from 'three';
import { getPhoneMeshOffsetX } from './mockupCamera';

export function configureScreenTexture(map: THREE.Texture): void {
  map.colorSpace = THREE.SRGBColorSpace;
  map.minFilter = THREE.LinearFilter;
  map.magFilter = THREE.LinearFilter;
}

export function applyPhoneScreenMaterial(
  mockupMesh: THREE.Object3D,
  map: THREE.Texture | undefined,
): void {
  if (!map) return;
  configureScreenTexture(map);
  mockupMesh.traverse((node) => {
    if ((node as THREE.Mesh).isMesh) {
      const mesh = node as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat?.name === 'screen') {
        mesh.material = new THREE.MeshBasicMaterial({ map });
      }
    }
  });
}

export function setPhoneMeshLayout(mockupMesh: THREE.Object3D, innerWidth: number): void {
  mockupMesh.position.x = getPhoneMeshOffsetX(innerWidth);
}

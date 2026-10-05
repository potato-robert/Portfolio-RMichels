// @ts-nocheck — three.js has no bundled types in astro check; mirrors hololensMockupModel.ts
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createHololensMockupState, processHololensMockupMesh } from './hololensMockupModel';

describe('processHololensMockupMesh', () => {
  it('replaces glTF Line Ray nodes with shader lines and removes placeholders', () => {
    const mockupRoot = new THREE.Group();
    const rayGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -10, 0),
    ]);
    const rayPlaceholder = new THREE.LineSegments(rayGeom, new THREE.LineBasicMaterial({ color: 0xffffff }));
    rayPlaceholder.name = 'Ray1';
    rayPlaceholder.position.set(2, 1, -1);
    mockupRoot.add(rayPlaceholder);

    const state = createHololensMockupState();
    processHololensMockupMesh(mockupRoot, state);

    expect(mockupRoot.children.some((c) => c.name.includes('Ray'))).toBe(false);
    expect(state.rays.length).toBe(1);
    const line = state.rays[0];
    expect(line.position.x).toBeCloseTo(2);
    expect(line.position.y).toBeCloseTo(1);
    expect(line.position.z).toBeCloseTo(-1);
    const pos = line.geometry.getAttribute('position');
    expect(pos.getX(0)).toBeCloseTo(0);
    expect(pos.getY(1)).toBeCloseTo(-10);
  });
});

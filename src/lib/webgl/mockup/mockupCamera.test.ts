import { describe, expect, it } from 'vitest';
import {
  computeMockupCameraZ,
  getMockupWindowHalfX,
  getPhoneMeshOffsetX,
  stepMockupCameraMotion,
} from './mockupCamera';
import { MD_BREAKPOINT_PX, SM_BREAKPOINT_PX, XXXXL_BREAKPOINT_PX } from './mockupConstants';

describe('computeMockupCameraZ', () => {
  it('uses z=10 below md for phone', () => {
    expect(computeMockupCameraZ(500, 'phone')).toBe(10);
  });

  it('matches legacy formula at 1280px phone', () => {
    const z = computeMockupCameraZ(1280, 'phone');
    expect(z).toBeCloseTo(20 - (1280 / SM_BREAKPOINT_PX) * 2.3);
  });

  it('caps at xxxxl breakpoint for phone', () => {
    const atXxxxl = computeMockupCameraZ(XXXXL_BREAKPOINT_PX + 100, 'phone');
    const atCap = computeMockupCameraZ(XXXXL_BREAKPOINT_PX, 'phone');
    expect(atXxxxl).toBeCloseTo(atCap);
  });

  it('hololens uses smaller slope above md', () => {
    const z = computeMockupCameraZ(MD_BREAKPOINT_PX + 1, 'hololens');
    expect(z).toBeCloseTo(22 - ((MD_BREAKPOINT_PX + 1) / SM_BREAKPOINT_PX) * 0.85);
  });
});

describe('getMockupWindowHalfX', () => {
  it('uses half width below xl', () => {
    expect(getMockupWindowHalfX(800)).toBe(400);
  });

  it('uses three-quarters width at xl+', () => {
    expect(getMockupWindowHalfX(1400)).toBe(1050);
  });
});

describe('getPhoneMeshOffsetX', () => {
  it('offsets at md+', () => {
    expect(getPhoneMeshOffsetX(MD_BREAKPOINT_PX + 1)).toBe(0.4);
    expect(getPhoneMeshOffsetX(MD_BREAKPOINT_PX)).toBe(0);
  });
});

describe('stepMockupCameraMotion', () => {
  it('applies hololens xShift outside lerp (legacy animate)', () => {
    const state = { positionX: 0, positionY: 0, positionZ: 19 };
    const mouse = { mouseX: 0, mouseY: 0, windowHalfX: 500, windowHalfY: 200 };
    stepMockupCameraMotion('hololens', state, mouse, 0, 16);
    expect(state.positionX).toBeCloseTo(-0.02);
  });
});

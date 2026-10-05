import {
  MD_BREAKPOINT_PX,
  PHONE_CAMERA_LERP_X,
  PHONE_CAMERA_LERP_Y,
  HOLOLENS_CAMERA_LERP_X,
  HOLOLENS_CAMERA_LERP_Y,
  SM_BREAKPOINT_PX,
  XL_BREAKPOINT_PX,
  XXXXL_BREAKPOINT_PX,
} from './mockupConstants';
import { lerpFactorPerFrame } from '../wave-formula';

export type MockupCameraKind = 'phone' | 'hololens';

export interface MockupMouseState {
  mouseX: number;
  mouseY: number;
  windowHalfX: number;
  windowHalfY: number;
}

export function getMockupWindowHalfX(innerWidth: number): number {
  return innerWidth < XL_BREAKPOINT_PX ? innerWidth / 2 : (innerWidth / 4) * 3;
}

export function getMockupWindowHalfY(innerHeight: number): number {
  return innerHeight / 4;
}

export function sampleMockupMouse(
  state: MockupMouseState,
  clientX: number,
  clientY: number,
): void {
  state.mouseX = (state.windowHalfX - clientX) / 1000;
  state.mouseY = (state.windowHalfY - clientY) / 1000;
}

/** Legacy piecewise camera.position.z from resizeRendererToDisplaySize. */
export function computeMockupCameraZ(innerWidth: number, kind: MockupCameraKind): number {
  const isPhone = kind === 'phone';
  const base = isPhone ? 20 : 22;
  const slope = isPhone ? 2.3 : 0.85;

  if (innerWidth > XXXXL_BREAKPOINT_PX) {
    return base - (XXXXL_BREAKPOINT_PX / SM_BREAKPOINT_PX) * slope;
  }
  if (innerWidth > MD_BREAKPOINT_PX || !isPhone) {
    return base - (innerWidth / SM_BREAKPOINT_PX) * slope;
  }
  return 10;
}

export function getPhoneMeshOffsetX(innerWidth: number): number {
  return innerWidth > MD_BREAKPOINT_PX ? 0.4 : 0;
}

export interface MockupLookAtTarget {
  x: number;
  y: number;
  z: number;
}

export function getMockupLookAtTarget(kind: MockupCameraKind): MockupLookAtTarget {
  if (kind === 'phone') {
    return { x: 0, y: 0, z: 0 };
  }
  return { x: -1.5, y: 7.5, z: 0 };
}

export interface MockupCameraMotionState {
  positionX: number;
  positionY: number;
  positionZ: number;
}

/**
 * Legacy threeJsMockup.js animate() camera block — xShift applied outside the x lerp;
 * hololens uses fixed 0.03 / 0.1 per frame (not delta-scaled).
 */
export function stepMockupCameraMotion(
  kind: MockupCameraKind,
  state: MockupCameraMotionState,
  mouse: MockupMouseState,
  timeMs: number,
  deltaMs: number,
): void {
  const isPhone = kind === 'phone';
  const innerWidth = typeof window !== 'undefined' ? window.innerWidth : XL_BREAKPOINT_PX;
  const xShift = isPhone ? (innerWidth > MD_BREAKPOINT_PX ? 0.05 : 0) : -0.02;
  const timeShift = timeMs * 0.0005;

  const targetX = mouse.mouseX + Math.sin(timeShift) / 2;

  if (isPhone) {
    const lerpX = lerpFactorPerFrame(PHONE_CAMERA_LERP_X, deltaMs);
    const lerpY = lerpFactorPerFrame(PHONE_CAMERA_LERP_Y, deltaMs);
    state.positionX += xShift + (targetX - state.positionX) * lerpX;
    state.positionY += (-mouse.mouseY - state.positionY) * lerpY;
  } else {
    state.positionX += xShift + (targetX - state.positionX) * HOLOLENS_CAMERA_LERP_X;
    state.positionY += (-mouse.mouseY - state.positionY) * HOLOLENS_CAMERA_LERP_Y + 0.2;
  }
}

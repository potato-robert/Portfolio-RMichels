/**
 * Case-study 3D mockup constants (legacy threeJsMockup.js).
 *
 * Tier matrix:
 * - minimal: static fallback / phoneSkip — no GLB
 * - reduced: phone full motion + GLB; hololens static LQIP only
 * - full: phone + hololens full legacy motion
 */

export const MOCKUP_FOV = 75;

export const SM_BREAKPOINT_PX = 576;
export const MD_BREAKPOINT_PX = 768;
export const XL_BREAKPOINT_PX = 1200;
export const XXXXL_BREAKPOINT_PX = 2304;

export const PHONE_SCROLL_DIVISOR = 1200;
export const HOLOLENS_SCROLL_DIVISOR = 2000;

/** Per-frame lerp bases at 60 Hz (see lerpFactorPerFrame). */
export const PHONE_CAMERA_LERP_X = 0.05;
export const PHONE_CAMERA_LERP_Y = 0.03;
export const HOLOLENS_CAMERA_LERP_X = 0.03;
export const HOLOLENS_CAMERA_LERP_Y = 0.1;

export const PHONE_MESH_X_OFFSET = 0.4;

export const PHONE_MODEL_PATH = '/assets/models/phone.glb';
export const HOLOLENS_MODEL_PATH = '/assets/models/hlAndBridgeCombined.glb';

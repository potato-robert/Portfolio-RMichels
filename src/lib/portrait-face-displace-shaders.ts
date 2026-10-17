// @ts-nocheck
import * as THREE from 'three';
import {
  PORTRAIT_FACE_NOISE_FINE,
  PORTRAIT_FACE_NOISE_SCALE,
  PORTRAIT_FACE_PLANAR_RAMP,
  PORTRAIT_FACE_VARY_MIN,
  PORTRAIT_NOISE_TIME_W,
  PORTRAIT_NOISE_TIME_X,
  PORTRAIT_NOISE_TIME_Y,
  PORTRAIT_NOISE_TIME_Z,
} from './webgl/portraitFaceDisplace';

function glslFloat(n: number): string {
  const text = String(n);
  return text.includes('.') || text.includes('e') ? text : `${text}.0`;
}

/**
 * Shared offset. Sample is the face centroid for the mesh and the welded
 * vertex for the dot cloud. Must match portraitFaceOffset() in
 * src/lib/webgl/portraitFaceDisplace.ts.
 */
export const portraitFaceOffsetGlsl = /* glsl */ `
float portraitHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float portraitValueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = portraitHash(i);
  float b = portraitHash(i + vec2(1.0, 0.0));
  float c = portraitHash(i + vec2(0.0, 1.0));
  float d = portraitHash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 2.0 - 1.0;
}

float portraitFaceFalloff(float dist, float radius) {
  float t = clamp(dist / radius, 0.0, 1.0);
  float s = t * t * (3.0 - 2.0 * t);
  return 1.0 - s;
}

vec3 portraitFaceOffset(vec3 samplePos) {
  if (uStrength == 0.0 || uRadius <= 0.0) return vec3(0.0);
  vec3 delta = samplePos - uHit;
  float dist = length(delta);
  float falloff = portraitFaceFalloff(dist, uRadius) * uStrength;
  if (falloff == 0.0) return vec3(0.0);
  float alongView = dot(delta, uViewDirection);
  vec3 planar = delta - uViewDirection * alongView;
  float planarLen = length(planar);
  float ramp = min(planarLen / ${glslFloat(PORTRAIT_FACE_PLANAR_RAMP)}, 1.0);
  vec3 planarDir = planarLen > 1e-6 ? (planar / planarLen) * ramp : vec3(0.0);
  float nFine = portraitValueNoise(samplePos.xy * ${glslFloat(PORTRAIT_FACE_NOISE_FINE)} + vec2(uTime * ${glslFloat(PORTRAIT_NOISE_TIME_X)}, uTime * ${glslFloat(PORTRAIT_NOISE_TIME_Y)}));
  float nCoarse = portraitValueNoise(vec2(samplePos.y * ${glslFloat(PORTRAIT_FACE_NOISE_SCALE)} - uTime * ${glslFloat(PORTRAIT_NOISE_TIME_W)}, samplePos.z * ${glslFloat(PORTRAIT_FACE_NOISE_SCALE)} + uTime * ${glslFloat(PORTRAIT_NOISE_TIME_Z)}));
  float nDir = portraitValueNoise(vec2(samplePos.x * ${glslFloat(PORTRAIT_FACE_NOISE_SCALE)} + uTime * ${glslFloat(PORTRAIT_NOISE_TIME_Z)}, samplePos.z * ${glslFloat(PORTRAIT_FACE_NOISE_FINE)} - uTime * ${glslFloat(PORTRAIT_NOISE_TIME_X)}));
  float vary = ${glslFloat(PORTRAIT_FACE_VARY_MIN)} + ${glslFloat(1 - PORTRAIT_FACE_VARY_MIN)} * (nFine * 0.5 + 0.5);
  float liftScale = 0.35 + 0.65 * (nCoarse * 0.5 + 0.5);
  vec3 towardCamera = -uViewDirection;
  vec3 wobble = uCameraRight * nCoarse + uCameraUp * nDir;
  return (planarDir * vary + towardCamera * uLift * liftScale + wobble * uNoiseAmp) * falloff;
}
`;

const portraitFaceUniforms = /* glsl */ `
uniform vec3 uHit;
uniform float uStrength;
uniform float uTime;
uniform float uRadius;
uniform float uLift;
uniform float uNoiseAmp;
uniform vec3 uCameraRight;
uniform vec3 uCameraUp;
uniform vec3 uViewDirection;
`;

export const portraitFaceMeshPars = /* glsl */ `
attribute vec3 faceCentroid;
${portraitFaceUniforms}
${portraitFaceOffsetGlsl}
`;

export const portraitFaceMeshBegin = /* glsl */ `
transformed += portraitFaceOffset(faceCentroid);
`;

export const portraitPointVertexShader = /* glsl */ `
attribute float scale;
uniform float uPointScale;
${portraitFaceUniforms}
${portraitFaceOffsetGlsl}

void main() {
  vec3 pos = position + portraitFaceOffset(position);
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = scale * uPointScale * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export interface PortraitFaceUniformSet {
  uHit: { value: THREE.Vector3 };
  uStrength: { value: number };
  uTime: { value: number };
  uRadius: { value: number };
  uLift: { value: number };
  uNoiseAmp: { value: number };
  uCameraRight: { value: THREE.Vector3 };
  uCameraUp: { value: THREE.Vector3 };
  uViewDirection: { value: THREE.Vector3 };
}

export function bindPortraitFaceMaterial(material: THREE.Material, uniforms: PortraitFaceUniformSet): void {
  const standard = material as THREE.MeshStandardMaterial;
  if (!standard.isMeshStandardMaterial) return;

  const previousKey = standard.customProgramCacheKey.bind(standard);
  standard.customProgramCacheKey = () => `${previousKey()}|portrait-face`;
  standard.onBeforeCompile = (shader) => {
    shader.uniforms.uHit = uniforms.uHit;
    shader.uniforms.uStrength = uniforms.uStrength;
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uRadius = uniforms.uRadius;
    shader.uniforms.uLift = uniforms.uLift;
    shader.uniforms.uNoiseAmp = uniforms.uNoiseAmp;
    shader.uniforms.uCameraRight = uniforms.uCameraRight;
    shader.uniforms.uCameraUp = uniforms.uCameraUp;
    shader.uniforms.uViewDirection = uniforms.uViewDirection;

    if (!shader.vertexShader.includes('#include <begin_vertex>')) {
      console.warn('Portrait face shader: begin_vertex chunk missing');
      return;
    }

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${portraitFaceMeshPars}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${portraitFaceMeshBegin}`);
  };
}

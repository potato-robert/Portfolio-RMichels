// @ts-nocheck
import * as THREE from 'three';
import { getWebGLPixelRatio } from '../device-capability';

export interface WebGLRendererOptions {
  canvas?: HTMLCanvasElement;
  antialias?: boolean;
  alpha?: boolean;
}

function registerPerfHook(renderer: THREE.WebGLRenderer): void {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('perf') !== '1') return;
  } catch {
    return;
  }

  const info = renderer.info;
  const snapshot = (): void => {
    (window as Window & { __auditWebGLInfo?: Record<string, number> }).__auditWebGLInfo = {
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      points: info.render.points,
      lines: info.render.lines,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
    };
  };

  snapshot();
  const origRender = renderer.render.bind(renderer);
  renderer.render = (scene, camera) => {
    origRender(scene, camera);
    snapshot();
  };
}

export function createWebGLRenderer(options: WebGLRendererOptions = {}): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas: options.canvas,
    antialias: options.antialias ?? true,
    alpha: options.alpha ?? true,
  });
  renderer.setPixelRatio(getWebGLPixelRatio());
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  registerPerfHook(renderer);
  return renderer;
}

export function updateRendererSize(renderer: THREE.WebGLRenderer, width: number, height: number): void {
  const pixelRatio = getWebGLPixelRatio();
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height);
}

// @ts-nocheck
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { getDevicePerformanceTier, getWebGLPixelRatio } from '../lib/device-capability';
import { addAnimationCallback, removeAnimationCallback } from '../lib/webgl/animationLoop';
import { createVideoFrameScheduler } from '../lib/webgl/schedule-video-frame';

type MockupType = 'phone' | 'hololens';

/**
 * Static fallbacks when WebGL/GLB is skipped (minimal/reduced tier) or load fails.
 * hlAndBridgeCombined.glb (~20MB) is not compressed in-repo; reduced/minimal tiers use these instead.
 */
const MOCKUP_FALLBACKS: Record<MockupType, string> = {
  hololens: '/assets/img/clirioScanViews/bridgeScanView.jpg',
  phone: '/assets/video/frame.jpg',
};

function getMockupType(canvas: HTMLCanvasElement): MockupType {
  return canvas.hasAttribute('data-mockup-phone') ? 'phone' : 'hololens';
}

function showMockupFallback(canvas: HTMLCanvasElement, mockupType: MockupType) {
  const fallbackSrc = MOCKUP_FALLBACKS[mockupType];
  const mockupSection = document.querySelector('.mockup');
  if (!mockupSection || mockupSection.querySelector('.mockupFallback')) return;

  const img = document.createElement('img');
  img.src = fallbackSrc;
  img.alt = '';
  img.className = 'mockupFallback';
  img.loading = 'lazy';
  img.decoding = 'async';
  mockupSection.appendChild(img);
  canvas.style.display = 'none';
}

function shouldSkipGlbLoad(tier: string, mockupType: MockupType): boolean {
  if (tier === 'minimal') return true;
  if (tier === 'reduced' && mockupType === 'hololens') return true;
  return false;
}

export function initThreeMockup() {
  const canvas = document.querySelector<HTMLCanvasElement>('#threeModel');
  if (!canvas) return;

  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('role', 'presentation');
  canvas.setAttribute('tabindex', '-1');

  const mockupType = getMockupType(canvas);
  const cachedTier = getDevicePerformanceTier();
  const cachedDpr = getWebGLPixelRatio();

  if (shouldSkipGlbLoad(cachedTier, mockupType)) {
    console.warn(`Skipping ${mockupType} GLB on ${cachedTier} tier; using static fallback.`);
    showMockupFallback(canvas, mockupType);
    return;
  }

  const isPhone = mockupType === 'phone';
  const spinner = document.getElementById('spinner');
  const video = document.getElementById('video') as HTMLVideoElement | null;

  const scene = new THREE.Scene();
  let renderer: THREE.WebGLRenderer | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let videoTexture: THREE.VideoTexture | undefined;
  let screenTexture: THREE.Texture | undefined;
  let disposed = false;
  let isVisible = true;
  let lastCanvasWidth = 0;
  let lastCanvasHeight = 0;
  let hololensRenderLoop: ((time: number, delta: number) => void) | null = null;

  const perfQuietMode = new URLSearchParams(window.location.search).has('perf');

  const ensureRenderer = () => {
    if (renderer) return renderer;
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: cachedTier === 'full',
    });
    renderer.setPixelRatio(cachedDpr);
    const cw = canvas.clientWidth || 1;
    const ch = canvas.clientHeight || 1;
    camera = new THREE.PerspectiveCamera(45, cw / ch, 0.1, 100);
    camera.position.z = 5;
    scene.add(new THREE.AmbientLight(0xffffff, 1));
    return renderer;
  };

  const applyCanvasSize = () => {
    if (!renderer || !camera) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w <= 0 || h <= 0) return;
    if (w === lastCanvasWidth && h === lastCanvasHeight) return;
    lastCanvasWidth = w;
    lastCanvasHeight = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  const renderOnce = () => {
    if (disposed || !isVisible || !renderer || !camera) return;
    applyCanvasSize();
    renderer.render(scene, camera);
  };

  const prepareScreenTexture = () => {
    if (videoTexture || screenTexture) return;

    if (video && perfQuietMode) {
      screenTexture = new THREE.TextureLoader().load('/assets/video/frame.jpg');
    } else if (video) {
      video.preload = 'auto';
      const startVideo = () => {
        video.play().catch(() => {});
      };
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        startVideo();
      } else {
        video.addEventListener('loadeddata', startVideo, { once: true });
        video.load();
      }
      videoTexture = new THREE.VideoTexture(video);
    }
  };

  const videoFrameLoop = video ? createVideoFrameScheduler(video) : null;

  const stopPhonePump = () => {
    videoFrameLoop?.cancel();
  };

  const startPhonePump = () => {
    if (!isPhone || !video || !isVisible || disposed) return;
    stopPhonePump();

    const step = () => {
      if (disposed || !isVisible) {
        stopPhonePump();
        return;
      }
      renderOnce();
      videoFrameLoop?.schedule(step);
    };

    videoFrameLoop?.schedule(step);
  };

  const path = isPhone ? '/assets/models/phone.glb' : '/assets/models/hlAndBridgeCombined.glb';
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  const onModelLoaded = (gltf: { scene: THREE.Group }) => {
    if (disposed) return;
    ensureRenderer();
    prepareScreenTexture();

    const mockupMesh = gltf.scene.children[0];
    mockupMesh.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        if (isPhone && (mesh.material as THREE.MeshStandardMaterial).name === 'screen') {
          const map = videoTexture ?? screenTexture;
          if (map) mesh.material = new THREE.MeshBasicMaterial({ map });
        }
      }
    });
    scene.add(mockupMesh);
    if (spinner) spinner.style.display = 'none';
    canvas.style.display = 'block';

    void renderer?.compileAsync(scene, camera!).then(() => {
      if (isPhone) {
        startPhonePump();
      } else {
        renderOnce();
        if (!hololensRenderLoop) {
          hololensRenderLoop = () => {
            renderOnce();
          };
          addAnimationCallback(hololensRenderLoop);
        }
      }
    });
  };

  const onModelError = (error: unknown) => {
    console.error(`Failed to load ${mockupType} mockup model:`, error);
    if (spinner) spinner.style.display = 'none';
    showMockupFallback(canvas, mockupType);
  };

  const loadModel = () => {
    loader.load(path, onModelLoaded, undefined, onModelError);
  };

  const scheduleModelLoad = () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadModel, { timeout: 4000 });
    } else {
      loadModel();
    }
  };

  scheduleModelLoad();

  const resizeObserver = new ResizeObserver(() => {
    lastCanvasWidth = 0;
    lastCanvasHeight = 0;
    if (isVisible) renderOnce();
  });
  resizeObserver.observe(canvas);

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries.some((e) => e.isIntersecting);
      if (visible === isVisible) return;
      isVisible = visible;
      if (isVisible) {
        if (isPhone) startPhonePump();
        else renderOnce();
      } else {
        stopPhonePump();
      }
    },
    { threshold: 0.05 },
  );
  intersectionObserver.observe(canvas);

  const disposeMockup = () => {
    if (disposed) return;
    disposed = true;
    stopPhonePump();
    if (hololensRenderLoop) {
      removeAnimationCallback(hololensRenderLoop);
      hololensRenderLoop = null;
    }
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    videoTexture?.dispose();
    screenTexture?.dispose();
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      }
    });
    renderer?.dispose();
    renderer = null;
    camera = null;
  };

  canvas.addEventListener('webglcontextlost', (event: Event) => {
    event.preventDefault();
    disposeMockup();
    showMockupFallback(canvas, mockupType);
  });
}

initThreeMockup();

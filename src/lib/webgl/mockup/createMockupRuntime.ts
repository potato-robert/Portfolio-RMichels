// @ts-nocheck
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import type { DevicePerformanceTier } from '../../device-capability';
import { getWebGLPixelRatio } from '../../device-capability';
import { getScrollLenis } from '../../scroll-lenis';
import { addAnimationCallback, removeAnimationCallback } from '../animationLoop';
import {
  HOLOLENS_MODEL_PATH,
  HOLOLENS_SCROLL_DIVISOR,
  MOCKUP_FOV,
  PHONE_MODEL_PATH,
  PHONE_SCROLL_DIVISOR,
} from './mockupConstants';
import {
  computeMockupCameraZ,
  getMockupLookAtTarget,
  getMockupWindowHalfX,
  getMockupWindowHalfY,
  sampleMockupMouse,
  stepMockupCameraMotion,
  type MockupMouseState,
} from './mockupCamera';
import {
  animateHololensMockup,
  createHololensMockupState,
  disposeHololensMockupState,
  processHololensMockupMesh,
} from './hololensMockupModel';
import { applyPhoneScreenMaterial, configureScreenTexture, setPhoneMeshLayout } from './phoneMockupModel';
import { computeMockupScrollRotationY } from './mockupScroll';

export type MockupType = 'phone' | 'hololens';

export interface MockupRuntimeOptions {
  canvas: HTMLCanvasElement;
  mockupType: MockupType;
  tier: DevicePerformanceTier;
  /** When true, use frame.jpg instead of video (minimal tier only). */
  useStaticScreenPoster: boolean;
  onModelReady?: () => void;
  onModelError?: (error: unknown) => void;
}

export interface MockupRuntime {
  dispose: () => void;
  scheduleLoad: () => void;
}

export function shouldSkipMockupGlb(tier: DevicePerformanceTier, mockupType: MockupType): boolean {
  if (tier === 'minimal') return true;
  if (tier === 'reduced' && mockupType === 'hololens') return true;
  return false;
}

export function createMockupRuntime(options: MockupRuntimeOptions): MockupRuntime {
  const { canvas, mockupType, tier, useStaticScreenPoster, onModelReady, onModelError } = options;
  const isPhone = mockupType === 'phone';
  const enableMotion = tier !== 'minimal';

  const scene = new THREE.Scene();
  let renderer: THREE.WebGLRenderer | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let mockupMesh: THREE.Object3D | null = null;
  let initialMockupMeshRotation: THREE.Euler | null = null;
  let videoTexture: THREE.VideoTexture | undefined;
  let screenTexture: THREE.Texture | undefined;
  let disposed = false;
  let isVisible = true;
  let lastCanvasWidth = 0;
  let lastCanvasHeight = 0;

  const hololensState = isPhone ? null : createHololensMockupState();

  const mouse: MockupMouseState = {
    mouseX: 0,
    mouseY: 0,
    windowHalfX: getMockupWindowHalfX(window.innerWidth),
    windowHalfY: getMockupWindowHalfY(window.innerHeight),
  };

  const cameraMotion = { positionX: 0, positionY: 0, positionZ: 0 };

  const ensureRenderer = () => {
    if (renderer) return renderer;
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: tier === 'full',
    });
    renderer.setPixelRatio(getWebGLPixelRatio());
    const cw = canvas.clientWidth || 1;
    const ch = canvas.clientHeight || 1;
    camera = new THREE.PerspectiveCamera(MOCKUP_FOV, cw / ch, 0.1, 1000);
    camera.position.set(0, 0, 0);

    if (isPhone) {
      scene.add(new THREE.AmbientLight(0xffffff, 1));
      const light = new THREE.PointLight(0x909090, 0.3, 0, 0);
      light.decay = 0;
      light.position.set(-6, 7, 6);
      scene.add(light);
    } else {
      scene.add(new THREE.AmbientLight(0xffffff, 3));
      const light = new THREE.PointLight(0x909090, 1, 0, 0);
      light.decay = 0;
      light.position.set(-2, 10, 8);
      scene.add(light);
    }

    syncCameraFromLayout();
    return renderer;
  };

  const syncCameraFromLayout = () => {
    if (!camera) return;
    mouse.windowHalfX = getMockupWindowHalfX(window.innerWidth);
    mouse.windowHalfY = getMockupWindowHalfY(window.innerHeight);
    cameraMotion.positionZ = computeMockupCameraZ(window.innerWidth, mockupType);
    camera.position.z = cameraMotion.positionZ;
    if (mockupMesh && isPhone) {
      setPhoneMeshLayout(mockupMesh, window.innerWidth);
    }
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
    syncCameraFromLayout();
  };

  const renderOnce = () => {
    if (disposed || !isVisible || !renderer || !camera) return;
    applyCanvasSize();
    renderer.render(scene, camera);
  };

  const prepareScreenTexture = () => {
    if (!isPhone || videoTexture || screenTexture) return;
    const video = document.getElementById('video') as HTMLVideoElement | null;

    if (useStaticScreenPoster || !video) {
      screenTexture = new THREE.TextureLoader().load('/assets/video/frame.jpg', (tex) => {
        configureScreenTexture(tex);
      });
      return;
    }

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
    configureScreenTexture(videoTexture);
  };

  const updateScrollRotation = (animatedScroll: number) => {
    if (!mockupMesh || !initialMockupMeshRotation || !enableMotion) return;
    const rect = canvas.getBoundingClientRect();
    mockupMesh.rotation.y = computeMockupScrollRotationY({
      animatedScroll,
      canvasTop: rect.top,
      canvasHeight: canvas.clientHeight || rect.height,
      initialRotationY: initialMockupMeshRotation.y,
      scrollDivisor: isPhone ? PHONE_SCROLL_DIVISOR : HOLOLENS_SCROLL_DIVISOR,
    });
  };

  const animationFrame = (time: number, delta: number) => {
    if (disposed || !isVisible || !renderer || !camera || !mockupMesh || !enableMotion) return;

    applyCanvasSize();

    stepMockupCameraMotion(mockupType, cameraMotion, mouse, time, delta);
    camera.position.x = cameraMotion.positionX;
    camera.position.y = cameraMotion.positionY;
    camera.position.z = cameraMotion.positionZ;

    const lookAt = getMockupLookAtTarget(mockupType);
    camera.lookAt(lookAt.x, lookAt.y, lookAt.z);

    if (!isPhone && hololensState) {
      animateHololensMockup(hololensState, camera.position.x, camera.position.y, mouse.mouseX, time);
    }

    renderer.render(scene, camera);
  };

  let animationRegistered = false;
  const ensureAnimationLoop = () => {
    if (!enableMotion || animationRegistered) return;
    addAnimationCallback(animationFrame);
    animationRegistered = true;
  };

  const stopAnimationLoop = () => {
    if (!animationRegistered) return;
    removeAnimationCallback(animationFrame);
    animationRegistered = false;
  };

  const onModelLoaded = (gltf: { scene: THREE.Group }) => {
    if (disposed) return;
    ensureRenderer();
    prepareScreenTexture();

    mockupMesh = gltf.scene.children[0];
    initialMockupMeshRotation = mockupMesh.rotation.clone();

    if (isPhone) {
      applyPhoneScreenMaterial(mockupMesh, videoTexture ?? screenTexture);
      setPhoneMeshLayout(mockupMesh, window.innerWidth);
    } else if (hololensState) {
      processHololensMockupMesh(mockupMesh, hololensState);
    }

    scene.add(mockupMesh);
    syncCameraFromLayout();
    onModelReady?.();

    void renderer?.compileAsync(scene, camera!).then(() => {
      if (enableMotion) {
        ensureAnimationLoop();
      } else {
        renderOnce();
      }
    });
  };

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  const loadModel = () => {
    const path = isPhone ? PHONE_MODEL_PATH : HOLOLENS_MODEL_PATH;
    loader.load(path, onModelLoaded, undefined, (error) => onModelError?.(error));
  };

  const scheduleLoad = () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadModel, { timeout: 4000 });
    } else {
      loadModel();
    }
  };

  const getScrollY = () => getScrollLenis()?.animatedScroll ?? window.scrollY ?? 0;

  const hookLenis = () => {
    const lenis = getScrollLenis();
    if (lenis) {
      lenis.on('scroll', (instance) => {
        updateScrollRotation(instance.animatedScroll);
      });
      updateScrollRotation(lenis.animatedScroll);
      return;
    }
    requestAnimationFrame(hookLenis);
  };

  if (enableMotion) {
    hookLenis();
  }

  const onDocumentMouseMove = (event: MouseEvent) => {
    if (!enableMotion) return;
    sampleMockupMouse(mouse, event.clientX, event.clientY);
  };
  document.addEventListener('mousemove', onDocumentMouseMove);

  const resizeObserver = new ResizeObserver(() => {
    lastCanvasWidth = 0;
    lastCanvasHeight = 0;
    if (isVisible) {
      syncCameraFromLayout();
      if (enableMotion && animationRegistered) return;
      renderOnce();
    }
  });
  resizeObserver.observe(canvas);

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries.some((e) => e.isIntersecting);
      if (visible === isVisible) return;
      isVisible = visible;
      if (isVisible && enableMotion && mockupMesh) {
        ensureAnimationLoop();
      } else if (!isVisible) {
        stopAnimationLoop();
      }
    },
    { threshold: 0.05 },
  );
  intersectionObserver.observe(canvas);

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    stopAnimationLoop();
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    document.removeEventListener('mousemove', onDocumentMouseMove);
    videoTexture?.dispose();
    screenTexture?.dispose();
    if (hololensState) disposeHololensMockupState(hololensState);
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
    mockupMesh = null;
  };

  return { dispose, scheduleLoad };
}

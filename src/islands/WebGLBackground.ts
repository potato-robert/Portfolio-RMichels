// @ts-nocheck
import { calcDocHeight } from './tools';
import { getDevicePerformanceTier } from '../lib/device-capability';
import { is3dEnabled } from '../lib/site-3d';
import { getScrollLenis } from '../lib/scroll-lenis';
import { addAnimationCallback, removeAnimationCallback } from '../lib/webgl/animationLoop';
import { createWebGLRenderer, updateRendererSize } from '../lib/webgl/createRenderer';
import {
  animateWavesParticles,
  createWavesScene,
  disposeWavesScene,
  resizeWavesCamera,
  updateWavesCamera,
} from '../lib/webgl/wavesScene';

export function initWebGLBackground() {
  if (document.querySelector('.waves')) return;

  if (!is3dEnabled()) return;

  const tier = getDevicePerformanceTier();
  if (tier === 'minimal') {
    console.warn('Low-powered device detected. Aborting particle waves load.');
    return;
  }

  const container = document.createElement('div');
  container.classList.add('waves');
  container.setAttribute('aria-hidden', 'true');
  document.body.appendChild(container);

  let waves = createWavesScene();
  const renderer = createWebGLRenderer({ antialias: false });
  const canvas = renderer.domElement;
  canvas.style.visibility = 'hidden';
  canvas.classList.add('wavesCanvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('role', 'presentation');
  canvas.setAttribute('tabindex', '-1');
  container.appendChild(canvas);

  let docHeight = calcDocHeight();
  let warmupFrames = 0;
  let disposed = false;
  let shadersReady = false;

  const getScrollY = () => getScrollLenis()?.animatedScroll ?? window.scrollY ?? 0;

  const updateCamera = (scrollY?: number) => {
    docHeight = calcDocHeight();
    updateWavesCamera(waves, scrollY ?? getScrollY(), docHeight);
  };

  let resizeTimer: ReturnType<typeof setTimeout> | null = null;
  const onWindowResize = () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateRendererSize(renderer, window.innerWidth, window.innerHeight);
      resizeWavesCamera(waves);
      updateCamera();
    }, 100);
  };

  const renderFrame = (_time: number, delta: number) => {
    if (disposed) return;

    animateWavesParticles(waves, delta);
    renderer.render(waves.scene, waves.camera);

    if (warmupFrames < 15) {
      warmupFrames++;
      if (warmupFrames === 15 && shadersReady) {
        canvas.style.visibility = 'visible';
      }
    }
  };

  addAnimationCallback(renderFrame);

  void renderer.compileAsync(waves.scene, waves.camera).then(() => {
    shadersReady = true;
    if (warmupFrames >= 15) canvas.style.visibility = 'visible';
  });

  const hookLenis = () => {
    const lenis = getScrollLenis();
    if (lenis) {
      lenis.on('scroll', (instance) => {
        updateCamera(instance.animatedScroll);
      });
      updateCamera(lenis.animatedScroll);
      return;
    }
    requestAnimationFrame(hookLenis);
  };

  const disposeWaves = () => {
    if (disposed) return;
    disposed = true;
    removeAnimationCallback(renderFrame);
    window.removeEventListener('resize', onWindowResize);
    if (resizeTimer) clearTimeout(resizeTimer);
    disposeWavesScene(waves);
    renderer.dispose();
    container.remove();
  };

  const rebuildAfterContextRestore = () => {
    disposeWavesScene(waves);
    waves = createWavesScene();
    updateRendererSize(renderer, window.innerWidth, window.innerHeight);
    resizeWavesCamera(waves);
    updateCamera();
    warmupFrames = 0;
    shadersReady = false;
    canvas.style.visibility = 'hidden';
    void renderer.compileAsync(waves.scene, waves.camera).then(() => {
      shadersReady = true;
    });
  };

  window.addEventListener('resize', onWindowResize);
  updateCamera();
  setTimeout(updateCamera, 500);
  hookLenis();

  canvas.addEventListener('webglcontextlost', (event: Event) => {
    event.preventDefault();
    disposed = true;
    removeAnimationCallback(renderFrame);
  });

  canvas.addEventListener('webglcontextrestored', () => {
    disposed = false;
    addAnimationCallback(renderFrame);
    rebuildAfterContextRestore();
  });
}

function start() {
  initWebGLBackground();
}

if ('requestIdleCallback' in window) {
  requestIdleCallback(start);
} else {
  setTimeout(start, 1);
}

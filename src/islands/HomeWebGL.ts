// @ts-nocheck
import { getDevicePerformanceTier } from '../lib/device-capability';
import { calcDocHeight } from '../islands/tools';
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
import {
  createLandingModelScene,
  loadLandingModel,
  resizeLandingModelCamera,
  setLandingModelMouse,
  updateLandingModelCamera,
} from '../lib/webgl/landingModelScene';

export function initHomeWebGL() {
  if (document.querySelector('.waves')) return;

  const tier = getDevicePerformanceTier();
  if (tier === 'minimal') {
    console.warn('Low-powered device detected. Aborting WebGL load.');
    return;
  }

  const modelContainer = document.getElementById('threeModel');
  const tmpImage = document.getElementById('landingModelImage') as HTMLImageElement | null;
  const tmpSpinner = document.getElementById('spinner');
  const landingArea = document.getElementById('landingArea');

  if (!modelContainer || !tmpImage) return;

  const container = document.createElement('div');
  container.classList.add('waves');
  container.setAttribute('aria-hidden', 'true');
  document.body.appendChild(container);

  const renderer = createWebGLRenderer();
  const canvas = renderer.domElement;
  canvas.style.visibility = 'hidden';
  canvas.classList.add('wavesCanvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('role', 'presentation');
  canvas.setAttribute('tabindex', '-1');
  container.appendChild(canvas);

  let waves = createWavesScene();
  let landing = createLandingModelScene();

  let docHeight = calcDocHeight();
  let modelVisible = true;
  let modelLoaded = false;
  let warmupFrames = 0;
  let shadersReady = false;
  let disposed = false;
  let lastLandingWidth = 0;
  let lastLandingHeight = 0;

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
      lastLandingWidth = 0;
      lastLandingHeight = 0;
      updateCamera();
    }, 100);
  };

  const renderFrame = (_time: number, delta: number) => {
    if (disposed) return;

    const canvas = renderer.domElement;
    const canvasRect = canvas.getBoundingClientRect();
    const pr = renderer.getPixelRatio();

    animateWavesParticles(waves, delta);

    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, canvas.width, canvas.height);
    renderer.autoClear = true;
    renderer.render(waves.scene, waves.camera);

    if (modelLoaded && modelVisible) {
      const rect = modelContainer.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        if (rect.width !== lastLandingWidth || rect.height !== lastLandingHeight) {
          lastLandingWidth = rect.width;
          lastLandingHeight = rect.height;
          resizeLandingModelCamera(landing, rect.width, rect.height);
        }

        const left = Math.floor((rect.left - canvasRect.left) * pr);
        const bottom = Math.floor((canvasRect.bottom - rect.bottom) * pr);
        const width = Math.floor(rect.width * pr);
        const height = Math.floor(rect.height * pr);

        renderer.setScissorTest(true);
        renderer.setScissor(left, bottom, width, height);
        renderer.setViewport(left, bottom, width, height);
        renderer.autoClear = false;
        renderer.clearDepth();

        updateLandingModelCamera(landing, delta);
        renderer.render(landing.scene, landing.camera);

        renderer.setScissorTest(false);
        renderer.autoClear = true;
      }
    }

    if (warmupFrames < 15) {
      warmupFrames++;
      if (warmupFrames === 15 && shadersReady) {
        canvas.style.visibility = 'visible';
      }
    }
  };

  addAnimationCallback(renderFrame);

  const compileScenes = async () => {
    await renderer.compileAsync(waves.scene, waves.camera);
    if (landing.loaded) {
      await renderer.compileAsync(landing.scene, landing.camera);
    }
    shadersReady = true;
    if (warmupFrames >= 15) canvas.style.visibility = 'visible';
  };
  void compileScenes();

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

  const showModel = () => {
    modelLoaded = true;
    modelContainer.style.display = '';
    requestAnimationFrame(() => {
      modelContainer.style.visibility = 'visible';
      tmpImage.style.display = 'none';
      if (tmpSpinner) tmpSpinner.style.display = 'none';
    });
    void renderer.compileAsync(landing.scene, landing.camera).then(() => {
      shadersReady = true;
    });
  };

  setTimeout(() => {
    if (!modelLoaded && tmpSpinner) tmpSpinner.style.display = '';
  }, 300);

  const scheduleLandingModelLoad = () => {
    loadLandingModel(
      landing,
      showModel,
      (error) => {
        console.error('Failed to load landing model:', error);
        if (tmpSpinner) tmpSpinner.style.display = 'none';
      },
    );
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(scheduleLandingModelLoad, { timeout: 4000 });
  } else {
    window.addEventListener('load', () => setTimeout(scheduleLandingModelLoad, 200), { once: true });
  }

  const onMouseMove = (event: MouseEvent) => {
    if (!modelLoaded || !modelVisible) return;
    setLandingModelMouse(landing, event.clientX, event.clientY);
  };

  document.addEventListener('mousemove', onMouseMove);

  const visibilityTarget = landingArea ?? modelContainer;
  const observer = new IntersectionObserver(
    (entries) => {
      modelVisible = entries.some((e) => e.isIntersecting);
    },
    { threshold: 0.05 },
  );
  observer.observe(visibilityTarget);

  const disposeAll = () => {
    if (disposed) return;
    disposed = true;
    removeAnimationCallback(renderFrame);
    observer.disconnect();
    document.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', onWindowResize);
    if (resizeTimer) clearTimeout(resizeTimer);
    disposeWavesScene(waves);
    landing.scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.geometry?.dispose();
        const mat = obj.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      }
    });
    renderer.dispose();
    container.remove();
  };

  const rebuildAfterContextRestore = () => {
    disposeWavesScene(waves);
    landing.scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.geometry?.dispose();
        const mat = obj.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      }
    });

    waves = createWavesScene();
    landing = createLandingModelScene();
    modelLoaded = false;
    lastLandingWidth = 0;
    lastLandingHeight = 0;
    warmupFrames = 0;
    shadersReady = false;
    canvas.style.visibility = 'hidden';
    tmpImage.style.display = '';
    updateRendererSize(renderer, window.innerWidth, window.innerHeight);
    resizeWavesCamera(waves);
    updateCamera();
    scheduleLandingModelLoad();
    void compileScenes();
  };

  window.addEventListener('resize', onWindowResize);
  updateCamera();
  setTimeout(updateCamera, 500);
  hookLenis();

  canvas.addEventListener('webglcontextlost', (event: Event) => {
    event.preventDefault();
    removeAnimationCallback(renderFrame);
    disposed = true;
    canvas.style.display = 'none';
    tmpImage.style.display = '';
  });

  canvas.addEventListener('webglcontextrestored', () => {
    canvas.style.display = '';
    disposed = false;
    addAnimationCallback(renderFrame);
    rebuildAfterContextRestore();
  });

  return disposeAll;
}

function start() {
  initHomeWebGL();
}

if ('requestIdleCallback' in window) {
  requestIdleCallback(start);
} else {
  setTimeout(start, 1);
}

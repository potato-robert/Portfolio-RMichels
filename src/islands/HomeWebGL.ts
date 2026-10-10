// @ts-nocheck
import { getDevicePerformanceTier } from '../lib/device-capability';
import { is3dEnabled } from '../lib/site-3d';
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
import {
  shouldHideLandingFallback,
  shouldRestoreLandingFallback,
  shouldScissorRenderPortrait,
} from '../lib/webgl/landingPortraitFallback';

export function initHomeWebGL() {
  if (document.querySelector('.waves')) return;

  if (!is3dEnabled()) return;

  const tier = getDevicePerformanceTier();
  if (tier === 'minimal') {
    console.warn('Low-powered device detected. Aborting WebGL load.');
    return;
  }

  const modelContainer = document.getElementById('threeModel');
  const tmpImage = document.getElementById('landingModelImage') as HTMLImageElement | null;
  const tmpSpinner = document.getElementById('spinner');
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
  let modelLoaded = false;
  let fallbackHidden = false;
  let confirmedPortraitFrames = 0;
  let framesWithoutConfirmedPortrait = 0;
  let missedPortraitRenderFrames = 0;
  const PORTRAIT_FALLBACK_GRACE_FRAMES = 60;
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

  const syncLandingFallbackImage = (portraitRect: DOMRect) => {
    if (
      shouldRestoreLandingFallback({
        fallbackHidden,
        modelLoaded,
        rect: portraitRect,
        confirmedPortraitFrames,
        framesWithoutConfirmedPortrait,
        missedPortraitRenderFrames,
        graceFrames: PORTRAIT_FALLBACK_GRACE_FRAMES,
      })
    ) {
      tmpImage.style.display = '';
      fallbackHidden = false;
      confirmedPortraitFrames = 0;
      framesWithoutConfirmedPortrait = 0;
      missedPortraitRenderFrames = 0;
      if (tmpSpinner) tmpSpinner.style.display = 'none';
      return;
    }

    if (
      !fallbackHidden &&
      shouldHideLandingFallback(confirmedPortraitFrames) &&
      modelLoaded
    ) {
      tmpImage.style.display = 'none';
      fallbackHidden = true;
      if (tmpSpinner) tmpSpinner.style.display = 'none';
    }
  };

  const renderFrame = (_time: number, delta: number) => {
    if (disposed) return;

    const canvas = renderer.domElement;
    const canvasRect = canvas.getBoundingClientRect();
    const pr = renderer.getPixelRatio();
    const portraitRect = modelContainer.getBoundingClientRect();

    animateWavesParticles(waves, delta);

    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, canvas.width, canvas.height);
    renderer.autoClear = true;
    renderer.render(waves.scene, waves.camera);

    let portraitDrawnThisFrame = false;
    if (shouldScissorRenderPortrait({ modelLoaded, rect: portraitRect })) {
      if (portraitRect.width !== lastLandingWidth || portraitRect.height !== lastLandingHeight) {
        lastLandingWidth = portraitRect.width;
        lastLandingHeight = portraitRect.height;
        resizeLandingModelCamera(landing, portraitRect.width, portraitRect.height);
      }

      const left = Math.floor((portraitRect.left - canvasRect.left) * pr);
      const bottom = Math.floor((canvasRect.bottom - portraitRect.bottom) * pr);
      const width = Math.floor(portraitRect.width * pr);
      const height = Math.floor(portraitRect.height * pr);

      if (width > 0 && height > 0) {
        renderer.setScissorTest(true);
        renderer.setScissor(left, bottom, width, height);
        renderer.setViewport(left, bottom, width, height);
        renderer.autoClear = false;
        renderer.clearDepth();

        updateLandingModelCamera(landing, delta);
        renderer.render(landing.scene, landing.camera);

        renderer.setScissorTest(false);
        renderer.autoClear = true;
        portraitDrawnThisFrame = true;
        confirmedPortraitFrames++;
      }
    }

    const portraitShouldDraw = shouldScissorRenderPortrait({ modelLoaded, rect: portraitRect });
    if (modelLoaded && fallbackHidden && confirmedPortraitFrames === 0) {
      framesWithoutConfirmedPortrait++;
    } else if (portraitDrawnThisFrame) {
      framesWithoutConfirmedPortrait = 0;
    }

    if (fallbackHidden && portraitShouldDraw) {
      if (portraitDrawnThisFrame) missedPortraitRenderFrames = 0;
      else missedPortraitRenderFrames++;
    } else if (!fallbackHidden) {
      missedPortraitRenderFrames = 0;
    }

    syncLandingFallbackImage(portraitRect);

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
    confirmedPortraitFrames = 0;
    framesWithoutConfirmedPortrait = 0;
    missedPortraitRenderFrames = 0;
    modelContainer.style.display = '';
    requestAnimationFrame(() => {
      modelContainer.style.visibility = 'visible';
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
    if (!modelLoaded) return;
    const portraitRect = modelContainer.getBoundingClientRect();
    if (!shouldScissorRenderPortrait({ modelLoaded, rect: portraitRect })) return;
    setLandingModelMouse(landing, event.clientX, event.clientY);
  };

  document.addEventListener('mousemove', onMouseMove);

  const disposeAll = () => {
    if (disposed) return;
    disposed = true;
    removeAnimationCallback(renderFrame);
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
    fallbackHidden = false;
    confirmedPortraitFrames = 0;
    framesWithoutConfirmedPortrait = 0;
    missedPortraitRenderFrames = 0;
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
    fallbackHidden = false;
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

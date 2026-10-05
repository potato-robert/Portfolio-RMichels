import { getDevicePerformanceTier } from '../lib/device-capability';
import {
  createMockupRuntime,
  shouldSkipMockupGlb,
  type MockupType,
} from '../lib/webgl/mockup/createMockupRuntime';

/** Static fallbacks when WebGL/GLB is skipped (minimal tier) or load fails. */
const MOCKUP_FALLBACKS: Record<MockupType, string> = {
  hololens: '/assets/img/clirioScanViews/lqip/bridgeScanView.jpg',
  phone: '/assets/video/frame.jpg',
};

function getMockupType(canvas: HTMLCanvasElement): MockupType {
  return canvas.hasAttribute('data-mockup-phone') ? 'phone' : 'hololens';
}

function getMockupSection(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.sectionText.mockup, .mockup');
}

function mountMockupCanvas(canvas: HTMLCanvasElement) {
  const mockupSection = getMockupSection();
  if (!mockupSection || mockupSection.contains(canvas)) return;
  mockupSection.appendChild(canvas);
}

function hideMockupCanvas(canvas: HTMLCanvasElement) {
  canvas.classList.remove('mockupCanvas--active');
  canvas.style.display = 'none';
}

function showMockupCanvas(canvas: HTMLCanvasElement) {
  canvas.classList.add('mockupCanvas--active');
  canvas.style.display = 'block';
}

function disableMockupHeavyMedia() {
  const video = document.getElementById('video') as HTMLVideoElement | null;
  if (!video) return;
  video.pause();
  video.removeAttribute('src');
  video.load();
}

type MockupFallbackReason = 'skip' | 'fail';

function showMockupFallback(
  canvas: HTMLCanvasElement,
  mockupType: MockupType,
  reason: MockupFallbackReason = 'fail',
) {
  hideMockupCanvas(canvas);
  disableMockupHeavyMedia();

  const mockupSection = getMockupSection();
  if (!mockupSection || mockupSection.querySelector('.mockupFallback')) return;

  if (mockupType === 'phone' && reason === 'skip') {
    mockupSection.classList.add('mockup--phoneSkip');
    return;
  }

  const fallbackSrc = MOCKUP_FALLBACKS[mockupType];
  const img = document.createElement('img');
  img.src = fallbackSrc;
  img.alt = '';
  img.className = 'mockupFallback';
  img.loading = 'lazy';
  img.decoding = 'async';
  img.addEventListener(
    'error',
    () => {
      img.remove();
    },
    { once: true },
  );
  img.addEventListener(
    'load',
    () => {
      mockupSection.classList.add('mockup--staticFallback');
    },
    { once: true },
  );
  mockupSection.appendChild(img);
}

export function initThreeMockup() {
  const canvas = document.querySelector<HTMLCanvasElement>('#threeModel');
  if (!canvas) return;

  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('role', 'presentation');
  canvas.setAttribute('tabindex', '-1');
  hideMockupCanvas(canvas);

  mountMockupCanvas(canvas);

  const mockupType = getMockupType(canvas);
  const effectiveTier = getDevicePerformanceTier();
  const spinner = document.getElementById('spinner');

  if (shouldSkipMockupGlb(effectiveTier, mockupType)) {
    console.warn(`Skipping ${mockupType} GLB on ${effectiveTier} tier; using static fallback.`);
    showMockupFallback(canvas, mockupType, 'skip');
    return;
  }

  const useStaticScreenPoster = effectiveTier === 'minimal';

  const runtime = createMockupRuntime({
    canvas,
    mockupType,
    tier: effectiveTier,
    useStaticScreenPoster,
    onModelReady: () => {
      if (spinner) spinner.style.display = 'none';
      showMockupCanvas(canvas);
    },
    onModelError: (error) => {
      console.error(`Failed to load ${mockupType} mockup model:`, error);
      if (spinner) spinner.style.display = 'none';
      showMockupFallback(canvas, mockupType);
    },
  });

  runtime.scheduleLoad();

  canvas.addEventListener('webglcontextlost', (event: Event) => {
    event.preventDefault();
    runtime.dispose();
    showMockupFallback(canvas, mockupType);
  });
}

initThreeMockup();

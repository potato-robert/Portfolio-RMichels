import { getDevicePerformanceTier } from '../lib/device-capability';
import { is3dEnabled } from '../lib/site-3d';
import {
  createMockupRuntime,
  shouldSkipMockupGlb,
  type MockupType,
} from '../lib/webgl/mockup/createMockupRuntime';
import { showMockupStaticFallback } from '../lib/webgl/mockup/mockupStaticFallback';

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

export function initThreeMockup() {
  const canvas = document.querySelector<HTMLCanvasElement>('#threeModel');
  if (!canvas) return;

  const mockupType = getMockupType(canvas);

  if (!is3dEnabled()) {
    showMockupStaticFallback(canvas, mockupType, 'skip');
    return;
  }

  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('role', 'presentation');
  canvas.setAttribute('tabindex', '-1');
  hideMockupCanvas(canvas);

  mountMockupCanvas(canvas);

  const effectiveTier = getDevicePerformanceTier();
  const spinner = document.getElementById('spinner');

  if (shouldSkipMockupGlb(effectiveTier, mockupType)) {
    console.warn(`Skipping ${mockupType} GLB on ${effectiveTier} tier; using static fallback.`);
    showMockupStaticFallback(canvas, mockupType, 'skip');
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
      showMockupStaticFallback(canvas, mockupType);
    },
  });

  runtime.scheduleLoad();

  canvas.addEventListener('webglcontextlost', (event: Event) => {
    event.preventDefault();
    runtime.dispose();
    showMockupStaticFallback(canvas, mockupType);
  });
}

initThreeMockup();

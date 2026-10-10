import type { MockupType } from './createMockupRuntime';

/** Static fallbacks when WebGL/GLB is skipped (minimal tier, user pref) or load fails. */
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

function hideMockupCanvas(canvas: HTMLCanvasElement) {
  canvas.classList.remove('mockupCanvas--active');
  canvas.style.display = 'none';
}

function disableMockupHeavyMedia() {
  const video = document.getElementById('video') as HTMLVideoElement | null;
  if (!video) return;
  video.pause();
  video.removeAttribute('src');
  video.load();
}

type MockupFallbackReason = 'skip' | 'fail';

export function showMockupStaticFallback(
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

/** Project pages when site 3D is disabled or mockup WebGL is skipped. */
export function initProjectMockupStaticFallback() {
  const canvas = document.querySelector<HTMLCanvasElement>('#threeModel');
  if (!canvas) return;

  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('role', 'presentation');
  canvas.setAttribute('tabindex', '-1');

  const mockupType = getMockupType(canvas);
  const spinner = document.getElementById('spinner');
  if (spinner) spinner.style.display = 'none';

  showMockupStaticFallback(canvas, mockupType, 'skip');
}

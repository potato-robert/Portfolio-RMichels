import './ProjectLightbox.ts';
import './ProjectToc.ts';

function scheduleThreeMockup() {
  if (!document.querySelector('#threeModel')) return;
  void import('./ThreeMockup.ts');
}

// Defer mockup WebGL chunk until after LCP-critical project content (matches HomeWebGL GLB deferral).
if ('requestIdleCallback' in window) {
  requestIdleCallback(scheduleThreeMockup, { timeout: 4000 });
} else {
  globalThis.addEventListener('load', () => setTimeout(scheduleThreeMockup, 200), { once: true });
}

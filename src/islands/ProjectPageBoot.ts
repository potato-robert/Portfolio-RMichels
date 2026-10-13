import './ProjectLightbox.ts';
import './ProjectToc.ts';
import { is3dEnabled } from '../lib/site-3d';
import { initProjectMockupStaticFallback } from '../lib/webgl/mockup/mockupStaticFallback';

function scheduleThreeMockup() {
  if (!document.querySelector('#threeModel')) return;
  if (!is3dEnabled()) {
    initProjectMockupStaticFallback();
    return;
  }
  void import('./ThreeMockup.ts');
}

// Defer mockup WebGL chunk until after LCP-critical project content (matches HomeWebGL GLB deferral).
if ('requestIdleCallback' in window) {
  requestIdleCallback(scheduleThreeMockup, { timeout: 4000 });
} else {
  globalThis.addEventListener('load', () => setTimeout(scheduleThreeMockup, 200), { once: true });
}

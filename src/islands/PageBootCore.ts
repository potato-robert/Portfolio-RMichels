import { cleanupLegacyCookies } from '../lib/legacy-cookie-cleanup';
import { initAnalyticsEvents } from '../lib/analytics';
import { syncPerfTierToDocument } from '../lib/device-capability';
import { is3dEnabled } from '../lib/site-3d';

syncPerfTierToDocument();

cleanupLegacyCookies();
initAnalyticsEvents();

const pageType = document.body.dataset.pageType;
const webglEnabled = is3dEnabled();

const WAVE_PAGE_TYPES = new Set(['projects', 'about', 'project']);

function showLandingStaticFallback() {
  const spinner = document.getElementById('spinner');
  if (spinner) spinner.style.display = 'none';
}

function scheduleWebGLBackground() {
  if (!webglEnabled) return;
  // Case studies with Three.js mockups use a dedicated canvas; skip full-page waves to avoid dual WebGL contexts.
  if (pageType === 'project' && document.querySelector('#threeModel')) return;
  void import('./WebGLBackground.ts');
}

if (pageType === 'home') {
  if (webglEnabled) {
    void import('./HomeWebGL.ts');
  } else {
    showLandingStaticFallback();
  }
  void import('./TextRotate.ts');
  void import('./ProjectTileParallax.ts');
} else if (WAVE_PAGE_TYPES.has(pageType ?? '')) {
  if (pageType === 'project') {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(scheduleWebGLBackground, { timeout: 5000 });
    } else {
      setTimeout(scheduleWebGLBackground, 1);
    }
  } else if (webglEnabled) {
    void import('./WebGLBackground.ts');
  }
}

if (pageType === 'projects') {
  void import('./ProjectTileParallax.ts');
}

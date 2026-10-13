import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { getDevicePerformanceTier } from '../lib/device-capability';
import { setScrollLenis } from '../lib/scroll-lenis';

declare global {
  interface Window {
    locoScroll?: { update: () => void };
  }
}

export function initLenis() {
  let currentlyEnabled = true;
  const tier = getDevicePerformanceTier();
  const storedOverride = localStorage.getItem('lenisSmoothScrolling');
  const stored =
    storedOverride !== null ? storedOverride !== 'false' : tier === 'full';

  const lenis = new Lenis({
    smoothWheel: stored,
    autoRaf: true,
    anchors: true,
  });

  setScrollLenis(lenis);
  window.locoScroll = { update: () => lenis.resize() };

  const refreshScroll = () => lenis.resize();
  document.fonts?.ready?.then(refreshScroll);
  window.addEventListener('load', refreshScroll);

  const setupToggle = () => {
    const toggle = document.getElementById('lenisScrollToggle') as HTMLInputElement | null;
    if (!toggle) return;

    toggle.checked = stored;
    toggle.addEventListener('change', (e) => {
      const enabled = (e.target as HTMLInputElement).checked;
      localStorage.setItem('lenisSmoothScrolling', String(enabled));
      if (currentlyEnabled !== enabled) window.location.reload();
      currentlyEnabled = enabled;
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupToggle);
  } else {
    setupToggle();
  }
}

initLenis();

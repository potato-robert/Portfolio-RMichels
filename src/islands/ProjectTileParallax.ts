import { projectTileParallaxTranslateY } from '../lib/project-tile-parallax';
import { getScrollLenis } from '../lib/scroll-lenis';

function offset(el: Element) {
  return el.getBoundingClientRect().top;
}

function getVisibleElements(selector: string): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(selector)).filter((el) => {
    const row = el.closest('.projRow');
    return row && !row.classList.contains('projRow--hidden');
  });
}

const PARALLAX_SELECTORS = [
  '.projRow:not(.projRow--hidden) .projJScontainer',
  '.projRow:not(.projRow--hidden) .projLabel',
] as const;

const WIDE_LAYOUT_MQ = '(min-width: 1200px) and (orientation: landscape)';

export function initProjectTileParallax() {
  let scrollEndTimer: ReturnType<typeof setTimeout> | null = null;
  let wideLayout = window.matchMedia(WIDE_LAYOUT_MQ).matches;
  let activeElements: HTMLElement[] = [];
  let inactiveBySelector = new Map<string, HTMLElement[]>();
  let lenisScrollBound = false;

  const refreshElementLists = () => {
    wideLayout = window.matchMedia(WIDE_LAYOUT_MQ).matches;
    activeElements = wideLayout
      ? getVisibleElements('.projRow:not(.projRow--hidden) .projLabel')
      : getVisibleElements('.projRow:not(.projRow--hidden) .projJScontainer');

    inactiveBySelector = new Map();
    for (const selector of PARALLAX_SELECTORS) {
      inactiveBySelector.set(selector, getVisibleElements(selector));
    }
  };

  refreshElementLists();

  const resetInactiveParallaxStyles = () => {
    const activeSet = new Set(activeElements);

    for (const elements of inactiveBySelector.values()) {
      for (const el of elements) {
        if (!activeSet.has(el)) {
          el.style.transform = '';
          el.style.willChange = '';
        }
      }
    }
  };

  const setWillChange = (active: boolean) => {
    const prop = active ? 'transform' : '';
    for (const el of activeElements) {
      el.style.willChange = prop;
    }
  };

  const update = () => {
    resetInactiveParallaxStyles();

    const viewportHeight = window.innerHeight;
    const reads: { el: HTMLElement; yPos: number }[] = activeElements.map((el) => ({
      el,
      yPos: offset(el),
    }));

    for (const { el, yPos } of reads) {
      const translateY = projectTileParallaxTranslateY(yPos, viewportHeight, wideLayout);
      el.style.transform = `translateY(${translateY}px)`;
    }
  };

  const scheduleScrollEnd = () => {
    if (scrollEndTimer) clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(() => setWillChange(false), 150);
  };

  const onScroll = () => {
    setWillChange(true);
    update();
    scheduleScrollEnd();
  };

  const onLayoutChange = () => {
    refreshElementLists();
    onScroll();
  };

  const bindLenisScroll = () => {
    const lenis = getScrollLenis();
    if (!lenis || lenisScrollBound) return lenisScrollBound;
    lenis.on('scroll', onScroll);
    lenisScrollBound = true;
    onScroll();
    return true;
  };

  const hookLenis = () => {
    if (bindLenisScroll()) return;
    requestAnimationFrame(hookLenis);
  };

  window.matchMedia(WIDE_LAYOUT_MQ).addEventListener('change', onLayoutChange);
  window.addEventListener('resize', onLayoutChange, { passive: true });
  hookLenis();
}

initProjectTileParallax();

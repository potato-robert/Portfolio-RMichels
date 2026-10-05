import { getScrollLenis } from '../lib/scroll-lenis';

function mapVal(num: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function clamp(num: number, min: number, max: number) {
  return num <= min ? min : num >= max ? max : num;
}

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

    const buffer = 50;
    let min = -80;
    let max = 100;
    if (!wideLayout) {
      min = -40;
      max = 0;
    }

    const viewportHeight = window.innerHeight;
    const reads: { el: HTMLElement; yPos: number }[] = activeElements.map((el) => ({
      el,
      yPos: offset(el),
    }));

    for (const { el, yPos } of reads) {
      const bottomVal = clamp(mapVal(yPos, 0, viewportHeight, max, min), min - buffer, max + buffer);
      el.style.transform = `translateY(${-bottomVal}px)`;
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

  const hookLenis = () => {
    const lenis = getScrollLenis();
    if (lenis) {
      lenis.on('scroll', onScroll);
      onScroll();
      return;
    }
    requestAnimationFrame(hookLenis);
  };

  window.matchMedia(WIDE_LAYOUT_MQ).addEventListener('change', onLayoutChange);
  window.addEventListener('resize', onLayoutChange, { passive: true });
  hookLenis();
}

initProjectTileParallax();

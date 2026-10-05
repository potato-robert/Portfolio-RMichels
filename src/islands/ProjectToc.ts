import { getScrollLenis } from '../lib/scroll-lenis';

const MEDIA_QUERY = '(min-width: 1200px) and (orientation: landscape)';
const MIN_GUTTER_PX = 160;
const SCROLL_OFFSET_REM = 5;
const IO_ROOT_MARGIN = '-20% 0px -55% 0px';
const RESIZE_DEBOUNCE_MS = 100;
const FADE_SCROLL_PX = 480; // scroll distance over which TOC fades in; ends at stick point
const STICKY_TOP_REM = 5.2; // 3.2rem header + 2rem gap

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function scrollOffsetPx(): number {
  return -parseFloat(getComputedStyle(document.documentElement).fontSize) * SCROLL_OFFSET_REM;
}

function getScrollY(): number {
  return getScrollLenis()?.animatedScroll ?? window.scrollY ?? 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getTocGutterWidth(): number {
  const homeLink = document.querySelector<HTMLElement>('.homeIcon a, .homeIcon');
  const textCol = document.querySelector<HTMLElement>('#projContent .sectionText');
  if (!homeLink || !textCol) return 0;
  return textCol.getBoundingClientRect().left - homeLink.getBoundingClientRect().left;
}

function getHeadingTargets(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      '#projContent .sectionText > h2[id], #projContent .sectionText > h3[id]',
    ),
  );
}

function getStickyTopPx(): number {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return STICKY_TOP_REM * rem;
}

export function initProjectToc() {
  const nav = document.getElementById('projToc');
  const layout = document.querySelector<HTMLElement>('.projContentLayout');
  const body = document.querySelector<HTMLElement>('.projContentBody');
  if (!nav || !layout || !body) return;

  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('[data-toc-link]'));
  const targets = getHeadingTargets();
  if (links.length < 2 || targets.length < 2) return;

  let sectionObserver: IntersectionObserver | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let resizeTimer: ReturnType<typeof setTimeout> | null = null;
  let scrollUnsubscribe: (() => void) | null = null;
  let rafId: number | null = null;
  let scrollActivityTimer: ReturnType<typeof setTimeout> | null = null;
  let scrollTrackingActive = false;
  let lastScrollY = -1;
  let enabled = false;
  let activeId: string | null = null;
  let scrollLockId: string | null = null;
  let tocScrollPending = false;
  let pendingScrollCleanups: Array<() => void> = [];

  const setActive = (id: string | null) => {
    if (id === activeId) return;
    activeId = id;
    for (const link of links) {
      const href = link.getAttribute('href') ?? '';
      const isActive = id !== null && href === `#${id}`;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  };

  const lockActive = (id: string) => {
    scrollLockId = id;
    setActive(id);
  };

  /** Match IntersectionObserver active-zone logic without waiting for IO callbacks. */
  const pickActiveSection = (): string | null => {
    const zoneTop = window.innerHeight * 0.2;
    const zoneBottom = window.innerHeight * 0.45;

    const inZone: { id: string; top: number }[] = [];
    for (const target of targets) {
      const top = target.getBoundingClientRect().top;
      if (top >= zoneTop - 1 && top <= zoneBottom) inZone.push({ id: target.id, top });
    }
    if (inZone.length > 0) {
      inZone.sort((a, b) => a.top - b.top);
      return inZone[0].id;
    }

    let bestAbove: { id: string; top: number } | null = null;
    for (const target of targets) {
      const top = target.getBoundingClientRect().top;
      if (top <= zoneTop && (!bestAbove || top > bestAbove.top)) {
        bestAbove = { id: target.id, top };
      }
    }
    return bestAbove?.id ?? targets[0]?.id ?? null;
  };

  const clearPendingScroll = () => {
    for (const cleanup of pendingScrollCleanups) cleanup();
    pendingScrollCleanups = [];
    tocScrollPending = false;
  };

  const cancelScrollLock = () => {
    if (!scrollLockId && !tocScrollPending) return;
    scrollLockId = null;
    clearPendingScroll();
    setActive(pickActiveSection());
  };

  const finishScrollLock = (id: string) => {
    clearPendingScroll();
    scrollLockId = null;
    setActive(id);
  };

  const releaseActiveLock = (id: string) => {
    finishScrollLock(id);
  };

  const isNearScrollTarget = (id: string): boolean => {
    const target = document.getElementById(id);
    if (!target) return false;
    const expectedTop = getStickyTopPx() - scrollOffsetPx();
    return Math.abs(target.getBoundingClientRect().top - expectedTop) < 80;
  };

  const watchPendingScroll = (targetId: string) => {
    clearPendingScroll();
    tocScrollPending = true;

    const lenis = getScrollLenis();
    if (lenis) {
      pendingScrollCleanups.push(
        lenis.on('virtual-scroll', ({ event }) => {
          if (!tocScrollPending) return;
          const type = event.type;
          if (type.includes('wheel') || type.includes('touch') || type.includes('key')) {
            cancelScrollLock();
          }
        }),
      );
    }

    const onUserScrollKey = (event: KeyboardEvent) => {
      if (!tocScrollPending) return;
      const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
      if (keys.includes(event.key)) cancelScrollLock();
    };
    window.addEventListener('keydown', onUserScrollKey, { passive: true });
    pendingScrollCleanups.push(() => window.removeEventListener('keydown', onUserScrollKey));

    const onNativeScrollInterrupt = () => {
      if (!tocScrollPending || getScrollLenis()) return;
      cancelScrollLock();
    };
    window.addEventListener('wheel', onNativeScrollInterrupt, { passive: true });
    window.addEventListener('touchmove', onNativeScrollInterrupt, { passive: true });
    pendingScrollCleanups.push(() => {
      window.removeEventListener('wheel', onNativeScrollInterrupt);
      window.removeEventListener('touchmove', onNativeScrollInterrupt);
    });

    const timeout = window.setTimeout(() => {
      if (tocScrollPending) cancelScrollLock();
    }, 4000);
    pendingScrollCleanups.push(() => window.clearTimeout(timeout));
  };

  const handlePendingScrollMotion = () => {
    if (!tocScrollPending || !scrollLockId) return;

    const lenis = getScrollLenis();
    if (!lenis || lenis.isScrolling === 'smooth') return;

    if (isNearScrollTarget(scrollLockId)) {
      finishScrollLock(scrollLockId);
      return;
    }

    cancelScrollLock();
  };

  const disconnectObserver = () => {
    sectionObserver?.disconnect();
    sectionObserver = null;
  };

  const stopScrollTracking = () => {
    scrollTrackingActive = false;
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (scrollActivityTimer) {
      clearTimeout(scrollActivityTimer);
      scrollActivityTimer = null;
    }
    lastScrollY = -1;
  };

  const detachScroll = () => {
    scrollUnsubscribe?.();
    scrollUnsubscribe = null;
    stopScrollTracking();
  };

  const trackScroll = () => {
    if (!scrollTrackingActive) {
      rafId = null;
      return;
    }
    const y = getScrollY();
    if (y !== lastScrollY) {
      lastScrollY = y;
      updateScrollPosition();
    }
    rafId = requestAnimationFrame(trackScroll);
  };

  const bumpScrollActivity = () => {
    scrollTrackingActive = true;
    if (scrollActivityTimer) clearTimeout(scrollActivityTimer);
    scrollActivityTimer = setTimeout(() => {
      scrollTrackingActive = false;
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }, 150);

    if (rafId == null) {
      rafId = requestAnimationFrame(trackScroll);
    }
  };

  const updateHorizontalPosition = () => {
    const homeLink = document.querySelector<HTMLElement>('.homeIcon a, .homeIcon');
    const homeLeft = homeLink?.getBoundingClientRect().left;
    if (homeLeft != null) nav.style.left = `${homeLeft}px`;
  };

  /** Fixed positioning + scroll sync (#MainGrid overflow:hidden breaks CSS sticky). */
  const updateScrollPosition = () => {
    const firstH2 = targets[0];
    if (!firstH2) return;

    const stickyTop = getStickyTopPx();
    const h2Top = firstH2.getBoundingClientRect().top;
    const navTop = Math.max(stickyTop, h2Top);
    const scrollY = getScrollY();
    const stickScrollY = h2Top + scrollY - stickyTop;
    const fadeStart = stickScrollY - FADE_SCROLL_PX;

    let navOpacity: number;
    if (prefersReducedMotion()) {
      navOpacity = navTop <= stickyTop + 1 ? 1 : 0;
    } else {
      navOpacity = clamp((scrollY - fadeStart) / FADE_SCROLL_PX, 0, 1);
    }

    updateHorizontalPosition();
    nav.style.top = `${navTop}px`;
    nav.style.opacity = String(navOpacity);
    nav.style.pointerEvents = navOpacity > 0.05 ? 'auto' : 'none';
  };

  const applyFixedLayout = () => {
    nav.classList.add('projToc--fixed');
    const navWidth = parseFloat(getComputedStyle(nav).maxWidth) || 208;
    nav.style.width = `${navWidth}px`;
    updateScrollPosition();
  };

  const clearFixedLayout = () => {
    nav.classList.remove('projToc--fixed');
    nav.style.left = '';
    nav.style.top = '';
    nav.style.width = '';
    nav.style.opacity = '';
    nav.style.pointerEvents = '';
    nav.style.paddingTop = '';
    nav.style.marginLeft = '';
  };

  const attachScroll = () => {
    detachScroll();
    const onScroll = () => {
      bumpScrollActivity();
      updateScrollPosition();
      handlePendingScrollMotion();
    };

    const lenis = getScrollLenis();
    if (lenis) {
      scrollUnsubscribe = lenis.on('scroll', onScroll);
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
      scrollUnsubscribe = () => window.removeEventListener('scroll', onScroll);
    }

    onScroll();
  };

  const startObserver = () => {
    disconnectObserver();
    const visible = new Map<string, number>();

    sectionObserver = new IntersectionObserver(
      (entries) => {
        if (scrollLockId) return;

        for (const entry of entries) {
          const id = entry.target.id;
          if (!id) continue;
          if (entry.isIntersecting) visible.set(id, entry.boundingClientRect.top);
          else visible.delete(id);
        }

        if (visible.size === 0) return;

        const nextId = [...visible.entries()].sort((a, b) => a[1] - b[1])[0]?.[0];
        if (nextId) setActive(nextId);
      },
      { rootMargin: IO_ROOT_MARGIN, threshold: 0 },
    );

    for (const target of targets) sectionObserver.observe(target);
  };

  const scrollToHash = (hash: string, updateHistory = true) => {
    if (!hash.startsWith('#')) return;
    const id = hash.slice(1);
    if (!id) return;

    lockActive(id);
    watchPendingScroll(id);

    const offset = scrollOffsetPx();
    const duration = prefersReducedMotion() ? 0 : undefined;
    const lenis = getScrollLenis();

    const onComplete = () => {
      if (updateHistory) history.replaceState(null, '', hash);
      releaseActiveLock(id);
      updateScrollPosition();
    };

    if (lenis) {
      lenis.scrollTo(hash, { offset, duration, onComplete });
      return;
    }

    const el = document.querySelector<HTMLElement>(hash);
    if (!el) {
      cancelScrollLock();
      return;
    }

    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    if (prefersReducedMotion()) {
      window.scrollTo({ top, behavior: 'auto' });
      onComplete();
      return;
    }

    window.scrollTo({ top, behavior: 'smooth' });
    const onScrollEnd = () => {
      if (!tocScrollPending) return;
      if (isNearScrollTarget(id)) {
        if (updateHistory) history.replaceState(null, '', hash);
        finishScrollLock(id);
      } else {
        cancelScrollLock();
      }
      updateScrollPosition();
    };
    if ('onscrollend' in window) {
      const handler = () => onScrollEnd();
      window.addEventListener('scrollend', handler, { once: true });
      pendingScrollCleanups.push(() => window.removeEventListener('scrollend', handler));
    } else {
      const timeout = setTimeout(onScrollEnd, 600);
      pendingScrollCleanups.push(() => clearTimeout(timeout));
    }
  };

  const bindLinkClicks = () => {
    for (const link of links) {
      if (link.dataset.tocBound === 'true') continue;
      link.dataset.tocBound = 'true';
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) scrollToHash(href);
      });
    }
  };

  const disable = () => {
    if (!enabled) return;
    enabled = false;
    nav.hidden = true;
    nav.classList.remove('is-enabled');
    detachScroll();
    clearFixedLayout();
    disconnectObserver();
    clearPendingScroll();
    scrollLockId = null;
    setActive(null);
  };

  const enable = () => {
    if (enabled) {
      applyFixedLayout();
      return;
    }
    enabled = true;
    nav.hidden = false;
    nav.classList.add('is-enabled');
    bindLinkClicks();
    startObserver();
    applyFixedLayout();
    attachScroll();

    if (location.hash && targets.some((t) => `#${t.id}` === location.hash)) {
      requestAnimationFrame(() => scrollToHash(location.hash, false));
    } else if (targets[0]?.id) {
      setActive(targets[0].id);
    }
  };

  const evaluate = () => {
    if (!window.matchMedia(MEDIA_QUERY).matches) {
      disable();
      return;
    }
    if (getTocGutterWidth() < MIN_GUTTER_PX) {
      disable();
      return;
    }
    enable();
  };

  const scheduleEvaluate = () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(evaluate, RESIZE_DEBOUNCE_MS);
  };

  bindLinkClicks();
  evaluate();

  resizeObserver = new ResizeObserver(scheduleEvaluate);
  resizeObserver.observe(layout);
  window.addEventListener('orientationchange', scheduleEvaluate);

  window.addEventListener('load', () => {
    scheduleEvaluate();
    if (location.hash && targets.some((t) => `#${t.id}` === location.hash)) {
      const tryHash = () => {
        if (getScrollLenis()) scrollToHash(location.hash, false);
        else setTimeout(tryHash, 50);
      };
      tryHash();
    }
  });
}

initProjectToc();

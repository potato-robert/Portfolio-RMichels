/** Umami Cloud (EU). Replace after creating the site in Umami dashboard. */
export const UMAMI_SCRIPT_URL = 'https://cloud.umami.is/script.js';
export const UMAMI_WEBSITE_ID = '03ed0fa0-424b-4665-b916-6187234aa1de';

export const ANALYTICS_OPT_OUT_KEY = 'rmAnalyticsOptOut';

export function shouldLoadAnalytics(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (window.localStorage.getItem(ANALYTICS_OPT_OUT_KEY) === '1') return false;
  } catch {
    return false;
  }
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.globalPrivacyControl === true) return false;
  const dnt = nav.doNotTrack ?? (window as Window & { doNotTrack?: string }).doNotTrack;
  if (dnt === '1' || dnt === 'yes') return false;
  return true;
}

function getUrlParameter(name: string): string {
  const escaped = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp(`[\\?&]${escaped}=([^&#]*)`);
  const results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

/** Fire portfolio_link custom event when Umami is available. */
export function trackPortfolioLinkIfPresent(): void {
  const portfolioLinkValue = getUrlParameter('portfolio_link');
  if (!portfolioLinkValue) return;

  const umami = (window as Window & { umami?: { track: (name: string, data?: Record<string, string>) => void } })
    .umami;
  if (typeof umami?.track === 'function') {
    umami.track('portfolio_link', { portfolio_link: portfolioLinkValue });
    return;
  }

  const script = document.querySelector<HTMLScriptElement>('script[data-website-id]');
  if (!script) return;

  const onLoad = () => {
    const u = (window as Window & { umami?: { track: (name: string, data?: Record<string, string>) => void } })
      .umami;
    if (typeof u?.track === 'function') {
      u.track('portfolio_link', { portfolio_link: portfolioLinkValue });
    }
  };

  if (script.getAttribute('data-loaded') === 'true') {
    onLoad();
  } else {
    script.addEventListener('load', onLoad, { once: true });
  }
}

export function initAnalyticsEvents(): void {
  if (!shouldLoadAnalytics()) return;
  trackPortfolioLinkIfPresent();
}

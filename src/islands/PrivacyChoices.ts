import { ANALYTICS_OPT_OUT_KEY } from '../lib/analytics';
import { EXTERNAL_MEDIA_PROVIDERS, EXTERNAL_MEDIA_STORAGE_KEY } from '../lib/legal';

type RememberedMedia = Partial<Record<string, boolean>>;

function readRemembered(): RememberedMedia {
  try {
    const raw = localStorage.getItem(EXTERNAL_MEDIA_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as RememberedMedia;
  } catch {
    return {};
  }
}

function writeRemembered(map: RememberedMedia): void {
  try {
    localStorage.setItem(EXTERNAL_MEDIA_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function isGerman(): boolean {
  return document.documentElement.lang === 'de' || window.location.pathname.startsWith('/de/');
}

function strings() {
  if (isGerman()) {
    return {
      title: 'Einstellungen auf diesem Gerät',
      analytics: 'Analytics deaktivieren',
      analyticsHint:
        'Wenn aktiviert, wird Umami nicht geladen. Do Not Track und Global Privacy Control werden immer respektiert.',
      analyticsGpc: 'Ihr Browser sendet bereits Do Not Track oder Global Privacy Control — Analytics ist deaktiviert.',
      embeds: 'Gespeicherte Einbettungen',
      none: 'Keine Anbieter gespeichert.',
      forget: 'Vergessen',
      reloadHint: 'Seite neu laden, damit Änderungen an Einbettungen wirksam werden.',
    };
  }
  return {
    title: 'Settings on this device',
    analytics: 'Disable analytics',
    analyticsHint:
      'When enabled, Umami will not load. Do Not Track and Global Privacy Control are always honored.',
    analyticsGpc: 'Your browser already sends Do Not Track or Global Privacy Control — analytics is off.',
    embeds: 'Remembered embeds',
    none: 'No providers saved.',
    forget: 'Forget',
    reloadHint: 'Reload the page for embed changes to take effect.',
  };
}

function dntOrGpcActive(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.globalPrivacyControl === true) return true;
  const dnt = nav.doNotTrack ?? (window as Window & { doNotTrack?: string }).doNotTrack;
  return dnt === '1' || dnt === 'yes';
}

function render(): void {
  const mount = document.querySelector('[data-privacy-choices]');
  if (!mount) return;

  const t = strings();
  const remembered = readRemembered();
  const providerIds = Object.keys(remembered).filter((id) => remembered[id]);

  const analyticsOptOut = localStorage.getItem(ANALYTICS_OPT_OUT_KEY) === '1';
  const gpc = dntOrGpcActive();

  let embedList = `<p>${t.none}</p>`;
  if (providerIds.length > 0) {
    embedList = `<ul class="privacy-choices__list">${providerIds
      .map((id) => {
        const label = EXTERNAL_MEDIA_PROVIDERS.find((p) => p.id === id)?.displayName ?? id;
        return `<li><span>${label}</span><button type="button" data-forget-embed="${id}">${t.forget}</button></li>`;
      })
      .join('')}</ul><p><small>${t.reloadHint}</small></p>`;
  }

  mount.innerHTML = `
    <h3>${t.title}</h3>
    <div class="privacy-choices__row">
      <label>
        <input type="checkbox" id="privacyAnalyticsOptOut" ${analyticsOptOut ? 'checked' : ''} ${gpc ? 'disabled' : ''} />
        ${t.analytics}
      </label>
    </div>
    <p><small>${gpc ? t.analyticsGpc : t.analyticsHint}</small></p>
    <h3>${t.embeds}</h3>
    ${embedList}
  `;

  const optOut = mount.querySelector<HTMLInputElement>('#privacyAnalyticsOptOut');
  optOut?.addEventListener('change', () => {
    if (optOut.checked) {
      localStorage.setItem(ANALYTICS_OPT_OUT_KEY, '1');
    } else {
      localStorage.removeItem(ANALYTICS_OPT_OUT_KEY);
    }
  });

  mount.querySelectorAll<HTMLButtonElement>('[data-forget-embed]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.forgetEmbed;
      if (!id) return;
      const map = readRemembered();
      delete map[id];
      writeRemembered(map);
      render();
    });
  });
}

render();

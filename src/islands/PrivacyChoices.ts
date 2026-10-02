import { ANALYTICS_OPT_OUT_KEY } from '../lib/analytics';
import {
  clearAllEmbedsRemembered,
  forgetEmbedProvider,
  isAllEmbedsRemembered,
  isAnyEmbedRemembered,
  isEmbedProviderRemembered,
  readRememberedMedia,
  rememberAllEmbeds,
  rememberEmbedProvider,
} from '../lib/external-media-prefs';
import { EXTERNAL_MEDIA_PROVIDERS } from '../lib/legal';
import { uiCheckboxMarkup } from '../lib/checkbox-markup';

function isGerman(): boolean {
  return document.documentElement.lang === 'de' || window.location.pathname.startsWith('/de/');
}

function strings() {
  if (isGerman()) {
    return {
      analyticsTitle: 'Analytics',
      analytics: 'Analytics deaktivieren',
      analyticsHint:
        'Wenn aktiviert, wird Umami nicht geladen. Do Not Track und Global Privacy Control werden immer respektiert.',
      analyticsGpc:
        'Ihr Browser sendet bereits Do Not Track oder Global Privacy Control — Analytics ist deaktiviert.',
      embedsTitle: 'Einbettungen',
      alwaysLoadAll: 'Alle Einbettungen auf diesem Gerät immer laden',
      alwaysLoadAllHint:
        'Fallstudien laden Inhalte Dritter automatisch, ohne vorher auf „Inhalt laden“ zu klicken.',
      alwaysLoadProvider: 'Immer laden',
      privacyInfo: 'Datenschutzhinweise',
      reloadHint: 'Seite neu laden, damit Änderungen an Einbettungen wirksam werden.',
    };
  }
  return {
    analyticsTitle: 'Analytics',
    analytics: 'Disable analytics',
    analyticsHint:
      'When enabled, Umami will not load. Do Not Track and Global Privacy Control are always honored.',
    analyticsGpc: 'Your browser already sends Do Not Track or Global Privacy Control — analytics is off.',
    embedsTitle: 'Embeds',
    alwaysLoadAll: 'Always load all embeds on this device',
    alwaysLoadAllHint:
      'Case studies will load third-party content automatically without clicking Load content first.',
    alwaysLoadProvider: 'Always load',
    privacyInfo: 'Privacy information',
    reloadHint: 'Reload the page for embed changes to take effect.',
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function dntOrGpcActive(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.globalPrivacyControl === true) return true;
  const dnt = nav.doNotTrack ?? (window as Window & { doNotTrack?: string }).doNotTrack;
  return dnt === '1' || dnt === 'yes';
}

function renderCheckbox(inputAttrs: string, labelText: string, extraClassNames = ''): string {
  return uiCheckboxMarkup(inputAttrs, escapeHtml(labelText), extraClassNames);
}

function renderProviderRows(remembered: ReturnType<typeof readRememberedMedia>, t: ReturnType<typeof strings>): string {
  return EXTERNAL_MEDIA_PROVIDERS.map((provider) => {
    const checked = isEmbedProviderRemembered(provider.id, remembered);
    const ariaLabel = `${t.alwaysLoadProvider}: ${provider.displayName}`;
    return `<li class="privacy-choices__provider">
      <div class="privacy-choices__provider-meta">
        <span class="privacy-choices__provider-name">${escapeHtml(provider.displayName)}</span>
        <a class="privacy-choices__provider-link" href="${escapeHtml(provider.privacyUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t.privacyInfo)}</a>
      </div>
      ${uiCheckboxMarkup(
        `data-embed-provider="${escapeHtml(provider.id)}" aria-label="${escapeHtml(ariaLabel)}" ${checked ? 'checked' : ''}`,
        escapeHtml(t.alwaysLoadProvider),
        'ui-checkbox--compact',
      )}
    </li>`;
  }).join('');
}

function render(): void {
  const mount = document.querySelector('[data-privacy-choices]');
  if (!mount) return;

  const t = strings();
  const remembered = readRememberedMedia();

  const analyticsOptOut = localStorage.getItem(ANALYTICS_OPT_OUT_KEY) === '1';
  const gpc = dntOrGpcActive();
  const allEmbeds = isAllEmbedsRemembered(remembered);
  const someEmbeds = isAnyEmbedRemembered(remembered) && !allEmbeds;

  mount.innerHTML = `
    <section class="privacy-choices__block" aria-labelledby="privacy-analytics-heading">
      <h2 id="privacy-analytics-heading">${escapeHtml(t.analyticsTitle)}</h2>
      <div class="privacy-choices__row">
        ${renderCheckbox(
          `id="privacyAnalyticsOptOut" ${analyticsOptOut ? 'checked' : ''} ${gpc ? 'disabled' : ''}`,
          t.analytics,
          'ui-checkbox--block',
        )}
      </div>
      <p class="privacy-choices__hint">${escapeHtml(gpc ? t.analyticsGpc : t.analyticsHint)}</p>
    </section>
    <section class="privacy-choices__block" aria-labelledby="privacy-embeds-heading">
      <h2 id="privacy-embeds-heading">${escapeHtml(t.embedsTitle)}</h2>
      <p class="privacy-choices__lede">${escapeHtml(t.alwaysLoadAllHint)}</p>
      <div class="privacy-choices__row">
        ${renderCheckbox(
          `id="privacyAlwaysLoadEmbeds" ${allEmbeds ? 'checked' : ''}`,
          t.alwaysLoadAll,
          'ui-checkbox--block',
        )}
      </div>
      <ul class="privacy-choices__providers">${renderProviderRows(remembered, t)}</ul>
      <p class="privacy-choices__hint">${escapeHtml(t.reloadHint)}</p>
    </section>
  `;

  const optOut = mount.querySelector<HTMLInputElement>('#privacyAnalyticsOptOut');
  optOut?.addEventListener('change', () => {
    if (optOut.checked) {
      localStorage.setItem(ANALYTICS_OPT_OUT_KEY, '1');
    } else {
      localStorage.removeItem(ANALYTICS_OPT_OUT_KEY);
    }
  });

  const alwaysLoadEmbeds = mount.querySelector<HTMLInputElement>('#privacyAlwaysLoadEmbeds');
  if (alwaysLoadEmbeds && someEmbeds) {
    alwaysLoadEmbeds.indeterminate = true;
  }
  alwaysLoadEmbeds?.addEventListener('change', () => {
    if (alwaysLoadEmbeds.checked) {
      rememberAllEmbeds();
    } else {
      clearAllEmbedsRemembered();
    }
    render();
  });

  mount.querySelectorAll<HTMLInputElement>('[data-embed-provider]').forEach((input) => {
    input.addEventListener('change', () => {
      const id = input.dataset.embedProvider;
      if (!id) return;
      if (input.checked) {
        rememberEmbedProvider(id);
      } else {
        forgetEmbedProvider(id);
      }
      render();
    });
  });
}

render();

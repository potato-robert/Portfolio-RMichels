/** localStorage key for the footer “3D graphics” toggle (default on when unset). */
export const SITE_3D_STORAGE_KEY = 'site3dEnabled';

export function is3dEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(SITE_3D_STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function setupSite3dToggle(): void {
  let currentlyEnabled = is3dEnabled();

  const bind = () => {
    const toggle = document.getElementById('site3dToggle') as HTMLInputElement | null;
    if (!toggle) return;

    toggle.checked = currentlyEnabled;
    toggle.addEventListener('change', (e) => {
      const enabled = (e.target as HTMLInputElement).checked;
      localStorage.setItem(SITE_3D_STORAGE_KEY, String(enabled));
      if (currentlyEnabled !== enabled) window.location.reload();
      currentlyEnabled = enabled;
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
}

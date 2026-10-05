/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module 'virtual:rm-assets-manifest' {
  const manifest: import('./integrations/rm-assets/types').RmAssetsManifest;
  export default manifest;
}

declare global {
  interface Window {
    locoScroll?: { update: () => void };
    viewImage?: (source: HTMLElement | string) => void;
  }
}

export {};

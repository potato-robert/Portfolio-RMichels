import type { Browser, BrowserContext } from '@playwright/test';
import { forceClosePlaywright } from './force-close-browser.ts';

let active: { context?: BrowserContext; browser?: Browser } | null = null;

export function setActiveInteractionSession(
  session: { context?: BrowserContext; browser?: Browser } | null,
): void {
  active = session;
}

export function registerInteractionAbortTeardown(signal?: AbortSignal): () => void {
  if (!signal) return () => {};
  const onAbort = () => {
    if (!active) return;
    void forceClosePlaywright(active.context, active.browser);
  };
  signal.addEventListener('abort', onAbort);
  return () => signal.removeEventListener('abort', onAbort);
}

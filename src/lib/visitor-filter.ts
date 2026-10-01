export const VISITOR_FILTER_STORAGE_KEY = 'rmVisitorFilter';

export function readVisitorFilterSession(): string {
  if (typeof sessionStorage === 'undefined') return '';
  try {
    return sessionStorage.getItem(VISITOR_FILTER_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function writeVisitorFilterSession(filter: string): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    if (filter) {
      sessionStorage.setItem(VISITOR_FILTER_STORAGE_KEY, filter);
    } else {
      sessionStorage.removeItem(VISITOR_FILTER_STORAGE_KEY);
    }
  } catch {
    /* ignore quota / private mode */
  }
}

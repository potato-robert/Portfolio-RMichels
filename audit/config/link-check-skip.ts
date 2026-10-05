/** URLs known broken or out-of-scope for local audit link crawl (report-only). */
export const LINK_CHECK_SKIP_URL_PATTERNS: RegExp[] = [
  /^https:\/\/github\.com\/potato-robert\/tourguide_app\/?$/i,
  /** LinkedIn often returns 999 to automated crawlers; not a site href defect. */
  /^https:\/\/(www\.)?linkedin\.com\//i,
];

export function shouldSkipLinkCheckUrl(url: string): boolean {
  return LINK_CHECK_SKIP_URL_PATTERNS.some((re) => re.test(url));
}

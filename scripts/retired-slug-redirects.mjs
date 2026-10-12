/**
 * Retired public URL slugs → merged case study destinations (Apache 301 in public/.htaccess).
 * Keep in sync with verify-build (no dist output) and validate-content (no markdown source).
 */

/** @type {{ from: string, to: string }[]} */
export const RETIRED_SLUG_REDIRECTS = [
  { from: 'clirioScanShare', to: 'clirioCloud' },
  { from: 'qwadra', to: 'canfit' },
];

/** dist-relative paths that must not exist after build */
export function retiredSlugDistPaths() {
  /** @type {string[]} */
  const paths = [];
  for (const { from } of RETIRED_SLUG_REDIRECTS) {
    paths.push(`${from}/index.html`);
    paths.push(`de/${from}/index.html`);
  }
  return paths;
}

/**
 * @param {string} htaccess
 * @returns {string[]} missing rule descriptions
 */
export function findMissingHtaccessRedirectRules(htaccess) {
  /** @type {string[]} */
  const missing = [];
  for (const { from, to } of RETIRED_SLUG_REDIRECTS) {
    const enRule = `RewriteRule ^${from}/?$ /${to}/ [R=301,L]`;
    const deRule = `RewriteRule ^de/${from}/?$ /de/${to}/ [R=301,L]`;
    if (!htaccess.includes(enRule)) {
      missing.push(`EN ${from} → ${to}`);
    }
    if (!htaccess.includes(deRule)) {
      missing.push(`DE ${from} → ${to}`);
    }
  }
  return missing;
}

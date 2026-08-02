# VLCouch subdomain — deploy

Manual FTPS deploy only (not part of Astro CI). See [AGENTS.md](../../AGENTS.md).

## Prerequisites

1. DNS A/CNAME record for `vlcouch.rmichels.com` pointing at the same host as `tourguide.rmichels.com`
2. Hostinger FTPS credentials (same as other subdomain deploys)

## Deploy steps

1. Upload the entire `subdomains/vlcouch/` directory to the server path `/subdomains/vlcouch/` (or the Hostinger subdomain docroot for `vlcouch.rmichels.com`)
2. Confirm `index.html` is served as the directory index
3. Verify assets load:
   - https://vlcouch.rmichels.com/
   - https://vlcouch.rmichels.com/img/og-image.jpg
   - https://vlcouch.rmichels.com/robots.txt
   - https://vlcouch.rmichels.com/sitemap.xml

## Post-deploy verification

- [Google Rich Results Test](https://search.google.com/test/rich-results) — FAQ and SoftwareApplication schemas
- Mobile layout at 375px and desktop at 1200px+
- Lighthouse SEO score 90+
- Submit `sitemap.xml` in Google Search Console for the `vlcouch.rmichels.com` property

## Update download URL

The primary CTA and JSON-LD `downloadUrl` point to the latest release installer:

https://github.com/potato-robert/VLCouch/releases/latest/download/VLCouchSetup.exe

This URL stays stable across releases — CI uploads `VLCouchSetup.exe` on each release.

## Update sitemap

Bump `<lastmod>` in `sitemap.xml` when making content changes.

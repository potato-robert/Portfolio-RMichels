# Tourguide subdomain — deploy

Manual SFTP deploy only (not part of Astro CI). See [AGENTS.md](../../AGENTS.md) and [docs/DEPLOY.md](../../docs/DEPLOY.md).

## Canonical URLs

| Purpose | URL |
|---------|-----|
| Product landing (this folder) | https://tourguide.rmichels.com/ |
| Portfolio case study (Astro `dist/`) | https://rmichels.com/tourguide and https://rmichels.com/de/tourguide |
| Legal pages (static HTML in this folder) | e.g. https://tourguide.rmichels.com/privacyPolicy.html |

The case study on the main site links out to the subdomain for the app and legal content; keep cross-links consistent after deploy.

## Prerequisites

1. DNS for `tourguide.rmichels.com` pointing at the Hostinger subdomain docroot
2. Hostinger SFTP access (port 65002; same SSH/FTP user as main site — see `docs/DEPLOY.md`)

## Deploy steps

1. Upload the entire `subdomains/tourguide/` directory to `public_html/subdomains/tourguide/` on the server (or the Hostinger docroot for `tourguide.rmichels.com`)
2. Confirm `index.html` is served as the directory index
3. Verify assets and entry points load:
   - https://tourguide.rmichels.com/
   - https://tourguide.rmichels.com/css/main.css
   - https://tourguide.rmichels.com/favicon/site.webmanifest
   - https://tourguide.rmichels.com/privacyPolicy.html
   - https://tourguide.rmichels.com/termsOfService.html
   - https://tourguide.rmichels.com/communityGuidelines.html
   - https://tourguide.rmichels.com/accountDeletion.html
   - https://tourguide.rmichels.com/app-ads.txt

## Post-deploy verification

- [ ] From https://tourguide.rmichels.com/, “About the project” opens https://rmichels.com/tourguide
- [ ] From https://rmichels.com/tourguide, product CTAs reach Play Store / web app URLs in case study frontmatter
- Mobile layout at 375px and desktop at 1200px+
- Legal pages render with `css/legal.css` (no broken stylesheet paths)

## Notes

- `app-ads.txt` must stay at the subdomain root for AdMob / Play policy checks.
- OG/Twitter image paths in `index.html` may reference repo assets outside this folder on the server — confirm images resolve or update paths when changing hosting layout.

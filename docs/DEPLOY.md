# Deploy to Hostinger (SFTP)

Production deploy runs on push to `main` (and via **Actions → Deploy to Hostinger via SFTP → Run workflow**). CI builds `dist/`, then uploads with **SFTP** (port **65002**) — same host, username, and password as Cyberduck.

## Remote layout

| Path | Purpose |
|------|---------|
| `/home/USER/` | SFTP login root (what Cyberduck shows at the top) |
| `/home/USER/public_html/` | **CI deploy target** — live rmichels.com Astro `dist/` output |
| `/home/USER/public_html/subdomains/` | **Manual only** — CI never uploads here (excluded; no remote delete) |

The workflow sets `remote_path` to `/home/${HOSTINGER_SFTP_USERNAME}/public_html` automatically. You do **not** need a path secret.

## GitHub Actions secrets

| Secret | Description |
|--------|-------------|
| `HOSTINGER_SFTP_HOST` | FTP IP (e.g. `185.170.210.60`) |
| `HOSTINGER_SFTP_USERNAME` | SFTP username (e.g. `u106735338`) |
| `HOSTINGER_SFTP_PASSWORD` | Same password as Cyberduck |

## Deploy behaviour

- **No** `delete_remote_files` — stale files on the server (old PHP, etc.) are not removed automatically; only paths present in `dist/` are uploaded/overwritten.
- **`public_html/subdomains/`** is excluded from the upload set so manual subdomain trees are not modified by CI.
- Astro `dist/` does not include a `subdomains/` folder; the exclude is an extra safeguard.

## Manual subdomain deploys

See `subdomains/tourguide/DEPLOY.md` and `subdomains/vlcouch/DEPLOY.md`. Upload under **`public_html/subdomains/…`** on the server (same SFTP credentials).

## Troubleshooting

| Symptom | Check |
|--------|--------|
| Connection timeout on port 21 | CI uses SFTP on **65002**. |
| Auth failure | Secrets match Cyberduck. |
| Deploy OK but site unchanged | Username secret wrong → path `/home/USER/public_html` misses docroot. |
| Subdomain files changed | Should not happen from CI; confirm workflow still has `delete_remote_files: false` and subdomains excludes. |

First-time check: **Actions → Run workflow** on `main`, then verify https://rmichels.com/.

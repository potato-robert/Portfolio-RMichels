import fs from 'node:fs';
import path from 'node:path';

/** Tracked masters under repo-root assets/. */
export function resolveAssetDir(...parts: string[]): string {
  return path.join(process.cwd(), 'assets', ...parts);
}

export function heroMasterExists(slug: string): boolean {
  const heroPath = path.join(resolveAssetDir('img'), `${slug}.jpg`);
  return fs.existsSync(heroPath);
}

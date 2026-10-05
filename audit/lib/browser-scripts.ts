import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

/** Plain browser functions for Playwright (avoid tsx/esbuild __name injection). */
export function loadBrowserScript(filename: string): string {
  return fs.readFileSync(path.join(scriptDir, filename), 'utf8').trim();
}

export function loadBrowserEvaluateFn<T extends (...args: never[]) => unknown>(filename: string): T {
  let source = loadBrowserScript(filename);
  // Trailing `;` makes `(source)` invalid inside `return (...)`.
  if (source.endsWith(';')) {
    source = source.slice(0, -1);
  }
  return new Function(`return (${source})`)() as T;
}

export function browserScriptPath(filename: string): string {
  return path.join(scriptDir, filename);
}

import { stripCursorPlaywrightBrowsersPath } from './playwright-env.ts';

/** Env for spawned npm/docker children — consistent TTY color flags. */
export function auditChildEnv(): NodeJS.ProcessEnv {
  const base = stripCursorPlaywrightBrowsersPath();
  const env = { ...base };
  if (process.stdout.isTTY) {
    env.FORCE_COLOR = '1';
    delete env.NO_COLOR;
  } else {
    env.NO_COLOR = '1';
    delete env.FORCE_COLOR;
  }
  return env;
}

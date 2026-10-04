import readline from 'node:readline';

export class AuditAbortedError extends Error {
  override name = 'AuditAbortedError';

  constructor(message = 'Audit run aborted by user') {
    super(message);
  }
}

export function isAuditAborted(err: unknown): err is AuditAbortedError {
  return err instanceof AuditAbortedError;
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (!signal?.aborted) return;
  const reason = signal.reason;
  if (reason instanceof AuditAbortedError) throw reason;
  throw new AuditAbortedError();
}

export interface AuditAbortHandle {
  signal: AbortSignal;
  registerProcessHandlers(): void;
  dispose(): void;
}

export function createAuditAbort(): AuditAbortHandle {
  const controller = new AbortController();
  let sigintHandler: (() => void) | undefined;
  let keypressCleanup: (() => void) | undefined;

  const requestAbort = (via: string) => {
    if (controller.signal.aborted) {
      console.error('\nForce quit — exiting without snapshot…');
      process.exit(132);
    }
    console.error(
      `\nClean abort (${via}). Stopping after the current step and writing snapshot — press q again to force quit without snapshot.`,
    );
    controller.abort(new AuditAbortedError(`Audit run aborted (${via})`));
  };

  return {
    signal: controller.signal,

    registerProcessHandlers() {
      sigintHandler = () => requestAbort('Ctrl+C');
      process.on('SIGINT', sigintHandler);
      keypressCleanup = registerAbortHotkey(() => requestAbort('q'));
    },

    dispose() {
      if (sigintHandler) {
        process.off('SIGINT', sigintHandler);
        sigintHandler = undefined;
      }
      keypressCleanup?.();
      keypressCleanup = undefined;
    },
  };
}

/** Press `q` (TTY only) for the same clean abort as the first interrupt signal. */
function registerAbortHotkey(onAbort: () => void): () => void {
  if (!process.stdin.isTTY) return () => {};

  readline.emitKeypressEvents(process.stdin);
  const wasRaw = process.stdin.isRaw;
  process.stdin.setRawMode(true);
  process.stdin.resume();

  const onKeypress = (_str: string, key: readline.Key) => {
    if (!key || key.ctrl || key.meta) return;
    if (key.name === 'q' && !key.shift) onAbort();
  };

  process.stdin.on('keypress', onKeypress);

  return () => {
    process.stdin.off('keypress', onKeypress);
    process.stdin.setRawMode(wasRaw);
    if (!wasRaw) process.stdin.pause();
  };
}

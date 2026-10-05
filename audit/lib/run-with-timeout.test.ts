import { describe, expect, it, vi } from 'vitest';
import { JobTimeoutError, runWithTimeout } from './run-with-timeout.ts';

describe('runWithTimeout', () => {
  it('resolves when fn finishes before the timer', async () => {
    const result = await runWithTimeout('fast', 500, () => undefined, async () => 'ok');
    expect(result).toBe('ok');
  });

  it('rejects with JobTimeoutError when fn hangs', async () => {
    vi.useFakeTimers();
    const pending = runWithTimeout(
      'slow',
      1000,
      () => 'warm-goto',
      () => new Promise(() => {}),
    );
    const assertion = expect(pending).rejects.toMatchObject({
      label: 'slow',
      timeoutMs: 1000,
      lastStep: 'warm-goto',
    });
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
    vi.useRealTimers();
  });
});

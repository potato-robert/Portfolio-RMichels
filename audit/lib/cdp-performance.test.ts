import { describe, expect, it, vi } from 'vitest';
import { measureCdpPerfDelta } from './cdp-performance.ts';

describe('measureCdpPerfDelta', () => {
  it('skips CDP metrics when Chromium CDP is unavailable (WebKit)', async () => {
    const page = {
      context: () => ({
        newCDPSession: async () => {
          throw new Error('browserContext.newCDPSession: CDP session is only available in Chromium');
        },
      }),
    };

    const fn = vi.fn(async () => {});
    const delta = await measureCdpPerfDelta(page as never, fn);

    expect(delta).toEqual({});
    expect(fn).toHaveBeenCalledOnce();
  });
});

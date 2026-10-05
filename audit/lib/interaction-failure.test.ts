import { describe, expect, it } from 'vitest';
import {
  classifyInteractionFailure,
  interactionHasHardFailures,
  profileResultFailed,
} from './interaction-failure.ts';
import { JobTimeoutError } from './run-with-timeout.ts';

describe('interaction failure classification', () => {
  it('treats WebKit CDP errors as unsupported (non-fatal)', () => {
    const kind = classifyInteractionFailure({
      error: 'browserContext.newCDPSession: CDP session is only available in Chromium',
    });
    expect(kind).toBe('unsupported');
    expect(profileResultFailed(kind, true)).toBe(false);
  });

  it('classifies JobTimeoutError as timeout', () => {
    const kind = classifyInteractionFailure({
      err: new JobTimeoutError('ipad-webkit /tourguide', 180_000, 'scroll'),
    });
    expect(kind).toBe('timeout');
    expect(profileResultFailed(kind, true)).toBe(true);
  });

  it('flags crash kinds as hard failures', () => {
    expect(
      interactionHasHardFailures([
        { failed: true, failureKind: 'crash' },
      ]),
    ).toBe(true);
  });
});

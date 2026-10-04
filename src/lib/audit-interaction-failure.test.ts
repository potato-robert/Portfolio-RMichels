import { describe, expect, it } from 'vitest';
import {
  classifyInteractionFailure,
  interactionHasHardFailures,
  isHardInteractionFailure,
  profileResultFailed,
} from '../../audit/lib/interaction-failure.ts';

describe('interaction failure taxonomy', () => {
  it('tier mismatch is soft', () => {
    expect(classifyInteractionFailure({ tierMismatch: true })).toBe('tier');
    expect(isHardInteractionFailure('tier')).toBe(false);
    expect(profileResultFailed('tier', false)).toBe(false);
  });

  it('GPU crash is hard', () => {
    const kind = classifyInteractionFailure({ error: 'GPU process exited unexpectedly' });
    expect(kind).toBe('crash');
    expect(interactionHasHardFailures([{ failureKind: kind, failed: true }])).toBe(true);
  });

  it('docker failure is hard', () => {
    expect(classifyInteractionFailure({ dockerFailed: true })).toBe('docker');
    expect(
      interactionHasHardFailures([{ failureKind: 'docker', failed: true }]),
    ).toBe(true);
  });

  it('successful docker delegation is not a hard failure', () => {
    expect(profileResultFailed(undefined, false)).toBe(false);
    expect(interactionHasHardFailures([{ failureKind: 'docker', failed: false }])).toBe(
      false,
    );
    expect(interactionHasHardFailures([{ failed: false }])).toBe(false);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createVideoFrameScheduler } from './schedule-video-frame';

const addAnimationCallback = vi.fn();
const removeAnimationCallback = vi.fn();

vi.mock('./animationLoop', () => ({
  addAnimationCallback: (...args: unknown[]) => addAnimationCallback(...args),
  removeAnimationCallback: (...args: unknown[]) => removeAnimationCallback(...args),
}));

beforeEach(() => {
  addAnimationCallback.mockClear();
  removeAnimationCallback.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createVideoFrameScheduler', () => {
  it('uses requestVideoFrameCallback when available', () => {
    const schedule = vi.fn((cb: () => void) => {
      cb();
      return 1;
    });
    const cancel = vi.fn();
    const video = {
      requestVideoFrameCallback: schedule,
      cancelVideoFrameCallback: cancel,
    } as unknown as HTMLVideoElement;

    const scheduler = createVideoFrameScheduler(video);
    const cb = vi.fn();
    scheduler.schedule(cb);

    expect(schedule).toHaveBeenCalled();
    expect(cb).toHaveBeenCalled();
    expect(addAnimationCallback).not.toHaveBeenCalled();

    scheduler.cancel();
    expect(cancel).toHaveBeenCalledWith(1);
  });

  it('falls back to animation loop when rVFC is missing', () => {
    const video = {} as HTMLVideoElement;
    const scheduler = createVideoFrameScheduler(video);
    scheduler.schedule(() => {});

    expect(addAnimationCallback).toHaveBeenCalledTimes(1);
    scheduler.cancel();
    expect(removeAnimationCallback).toHaveBeenCalledTimes(1);
  });
});

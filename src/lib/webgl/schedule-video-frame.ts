import {
  addAnimationCallback,
  removeAnimationCallback,
  type AnimationFrameCallback,
} from './animationLoop';

export type VideoFrameHandle = number;

export interface VideoFrameScheduler {
  schedule: (callback: () => void) => void;
  cancel: () => void;
}

/** Prefer requestVideoFrameCallback; fall back to the shared animation loop. */
export function createVideoFrameScheduler(video: HTMLVideoElement): VideoFrameScheduler {
  let rvfcId: VideoFrameHandle | null = null;
  let pendingCallback: (() => void) | null = null;
  let loopWrapper: AnimationFrameCallback | null = null;

  const cancel = () => {
    if (rvfcId != null && 'cancelVideoFrameCallback' in video) {
      video.cancelVideoFrameCallback(rvfcId);
      rvfcId = null;
    }
    if (loopWrapper) {
      removeAnimationCallback(loopWrapper);
      loopWrapper = null;
    }
    pendingCallback = null;
  };

  const schedule = (callback: () => void) => {
    cancel();
    pendingCallback = callback;

    if (typeof video.requestVideoFrameCallback === 'function') {
      const onFrame = () => {
        rvfcId = null;
        pendingCallback?.();
      };
      rvfcId = video.requestVideoFrameCallback(onFrame);
      return;
    }

    loopWrapper = (_time: number, _delta: number) => {
      pendingCallback?.();
    };
    addAnimationCallback(loopWrapper);
  };

  return { schedule, cancel };
}

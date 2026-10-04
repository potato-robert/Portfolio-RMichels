(measuredMs) => {
  const perf = window.__scrollPerf;
  if (!perf) {
    throw new Error('Frame sampling was not started');
  }

  perf.sampling = false;
  if (perf.rafId !== undefined) {
    cancelAnimationFrame(perf.rafId);
  }
  perf.observer?.disconnect();
  perf.loafObserver?.disconnect();

  const sorted = [...perf.frameTimes].sort(function (a, b) {
    return a - b;
  });

  function pct(p) {
    if (sorted.length === 0) return 0;
    const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
    return sorted[Math.max(0, idx)];
  }

  return {
    frameCount: perf.frameTimes.length,
    p50: pct(50),
    p95: pct(95),
    max: sorted.at(-1) ?? 0,
    framesOver50ms: perf.frameTimes.filter(function (t) {
      return t > 50;
    }).length,
    framesOver100ms: perf.frameTimes.filter(function (t) {
      return t > 100;
    }).length,
    framesOver200ms: perf.frameTimes.filter(function (t) {
      return t > 200;
    }).length,
    longTasks: perf.longTasks,
    longAnimationFrames: perf.longAnimationFrames,
    durationMs: measuredMs,
  };
}

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

  const durationMs = measuredMs > 0 ? measuredMs : 1;
  const frameCount = perf.frameTimes.length;
  const effectiveFps = (frameCount / durationMs) * 1000;
  const framesOver16ms = perf.frameTimes.filter(function (t) {
    return t > 16.67;
  }).length;
  const droppedFramePct =
    frameCount > 0 ? Math.round((framesOver16ms / frameCount) * 1000) / 10 : 0;

  const scriptCounts = {};
  for (const url of perf.loafScripts) {
    scriptCounts[url] = (scriptCounts[url] || 0) + 1;
  }
  const loafAttribution = Object.entries(scriptCounts)
    .sort(function (a, b) {
      return b[1] - a[1];
    })
    .slice(0, 5)
    .map(function (pair) {
      return { sourceURL: pair[0], count: pair[1] };
    });

  return {
    frameCount: frameCount,
    p50: pct(50),
    p95: pct(95),
    p99: pct(99),
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
    durationMs: durationMs,
    effectiveFps: Math.round(effectiveFps * 10) / 10,
    droppedFramePct: droppedFramePct,
    loafAttribution: loafAttribution,
  };
}

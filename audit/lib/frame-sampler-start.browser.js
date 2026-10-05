() => {
  window.__scrollPerf = {
    frameTimes: [],
    sampling: true,
    longTasks: 0,
    longAnimationFrames: 0,
    loafScripts: [],
  };

  let last = performance.now();
  let isFirst = true;

  function sample(now) {
    const perf = window.__scrollPerf;
    if (!perf || !perf.sampling) return;

    if (!isFirst) {
      perf.frameTimes.push(now - last);
    } else {
      isFirst = false;
    }
    last = now;
    perf.rafId = requestAnimationFrame(sample);
  }

  window.__scrollPerf.rafId = requestAnimationFrame(sample);

  try {
    const observer = new PerformanceObserver(function (list) {
      if (window.__scrollPerf) {
        window.__scrollPerf.longTasks += list.getEntries().length;
      }
    });
    observer.observe({ type: 'longtask', buffered: true });
    window.__scrollPerf.observer = observer;
  } catch {
    // longtask not available in every context
  }

  try {
    const loafObserver = new PerformanceObserver(function (list) {
      const perf = window.__scrollPerf;
      if (!perf) return;
      for (const entry of list.getEntries()) {
        perf.longAnimationFrames += 1;
        const scripts = entry.scripts;
        if (scripts && scripts.length) {
          for (const s of scripts) {
            if (s.sourceURL) perf.loafScripts.push(s.sourceURL);
          }
        }
      }
    });
    loafObserver.observe({ type: 'long-animation-frame', buffered: true });
    window.__scrollPerf.loafObserver = loafObserver;
  } catch {
    // LoAF not available in older Chromium
  }
}

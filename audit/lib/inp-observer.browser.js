() => {
  window.__auditInp = { value: null, entries: 0 };
  try {
    const observer = new PerformanceObserver(function (list) {
      for (const entry of list.getEntries()) {
        const e = entry;
        if (e.interactionId && e.duration > 0) {
          window.__auditInp.entries += 1;
          const prev = window.__auditInp.value;
          if (prev === null || e.duration > prev) {
            window.__auditInp.value = e.duration;
          }
        }
      }
    });
    observer.observe({ type: 'event', buffered: true, durationThreshold: 0 });
    window.__auditInpObserver = observer;
  } catch {
    // event timing not supported
  }
}

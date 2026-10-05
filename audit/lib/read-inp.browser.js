() => {
  window.__auditInpObserver?.disconnect();
  const inp = window.__auditInp;
  return {
    inpMs: inp?.value ?? null,
    eventEntries: inp?.entries ?? 0,
  };
}

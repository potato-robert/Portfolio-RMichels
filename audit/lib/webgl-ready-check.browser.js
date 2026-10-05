() => {
  const canvas = document.querySelector('.wavesCanvas');
  const fallback = document.querySelector('.mockupFallback');
  if (fallback) return true;
  if (!canvas) return true;
  return getComputedStyle(canvas).visibility === 'visible';
};

export {};

const pageType = document.body.dataset.pageType;

const WAVE_PAGE_TYPES = new Set(['projects', 'about', 'project']);

if (pageType === 'home') {
  void import('./HomeWebGL.ts');
  void import('./TextRotate.ts');
  void import('./ProjectTileParallax.ts');
} else if (WAVE_PAGE_TYPES.has(pageType ?? '')) {
  void import('./WebGLBackground.ts');
}

if (pageType === 'projects') {
  void import('./ProjectTileParallax.ts');
}

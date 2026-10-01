export {};

const pageType = document.body.dataset.pageType;

if (pageType === 'project') {
  void import('./ProjectLightbox.ts');
  void import('./ThreeMockup.ts');
  void import('./ProjectToc.ts');
}

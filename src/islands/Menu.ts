import { setAnimationLoopPaused } from '../lib/webgl/animationLoop';

export function initMenu() {
  const menuToggle = document.getElementById('MenuToggle');
  const overlayMenu = document.getElementById('OverlayMenu');
  const mainGrid = document.getElementById('MainGrid');
  const contentToBlur = document.getElementById('Content');
  const menuContent = document.getElementById('MenuContent');
  if (!menuToggle || !overlayMenu || !mainGrid || !contentToBlur || !menuContent) return;

  overlayMenu.classList.add('hidden');
  overlayMenu.setAttribute('aria-hidden', 'true');
  menuToggle.setAttribute('aria-expanded', 'false');
  let tmpDisable = false;

  const setWebGLPaused = (paused: boolean) => {
    // Full-screen overlay covers the canvas; pause the shared loop while open.
    setAnimationLoopPaused(paused);
  };

  const toggle = () => {
    tmpDisable = true;
    const opening = overlayMenu.classList.contains('hidden');
    menuToggle.classList.toggle('change');
    overlayMenu.classList.toggle('hidden');
    contentToBlur.classList.toggle('blur');
    mainGrid.classList.toggle('noClick');
    mainGrid.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', opening ? 'true' : 'false');
    overlayMenu.setAttribute('aria-hidden', opening ? 'false' : 'true');
    setWebGLPaused(opening);
    if (!opening) menuToggle.focus();
    setTimeout(() => {
      tmpDisable = false;
    }, 200);
  };

  menuToggle.onclick = toggle;

  document.addEventListener('click', (event) => {
    if (!overlayMenu.classList.contains('hidden') && !tmpDisable) {
      if (!menuContent.contains(event.target as Node) && event.target !== menuToggle) toggle();
    }
  });

  document.onkeydown = (evt) => {
    const e = evt || window.event;
    if (e.key === 'Escape' && !overlayMenu.classList.contains('hidden')) toggle();
  };
}

initMenu();

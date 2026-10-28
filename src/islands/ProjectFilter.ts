import { stackFilterWithMatches } from '../lib/stack';

let activeFilter: string | null = null;

function sortProjects() {
  const hiddenDiv = document.getElementById('projectTileHidden');
  const visibleDiv = document.getElementById('projectTileVisible');
  const projectCount = document.getElementById('projectCount');
  if (!hiddenDiv || !visibleDiv) return;

  const itemsArr = Array.from(visibleDiv.children).filter(
    (n): n is HTMLElement => n.nodeType === 1,
  );
  if (projectCount) projectCount.textContent = String(itemsArr.length);
  itemsArr.sort((a, b) => Number(a.dataset.tile) - Number(b.dataset.tile));
  itemsArr.forEach((item) => visibleDiv.appendChild(item));
}

function rowMatchesFilter(stack: string[]): boolean {
  if (!activeFilter) return true;
  return stack.includes(activeFilter);
}

function paintButtons() {
  document.querySelectorAll<HTMLButtonElement>('.filterBtn').forEach((btn) => {
    btn.classList.toggle('filterBtn--selected', btn.dataset.js === activeFilter);
  });
}

function dropFilterParam(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('filter')) return;
  url.searchParams.delete('filter');
  history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

function writeFilterUrl() {
  const url = new URL(window.location.href);
  if (activeFilter) url.searchParams.set('filter', activeFilter);
  else url.searchParams.delete('filter');
  const next = `${url.pathname}${url.search}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next !== current) history.replaceState(null, '', next);
}

function applyActiveFilters() {
  document.dispatchEvent(
    new CustomEvent('updateProject', {
      bubbles: true,
      detail: {},
    }),
  );
  sortProjects();
  window.locoScroll?.update();
}

function setActiveFilter(slug: string | null) {
  activeFilter = slug;
  paintButtons();
  writeFilterUrl();
  applyActiveFilters();
}

function initFilterButtons() {
  document.querySelectorAll<HTMLButtonElement>('.filterBtn').forEach((item) => {
    const slug = item.dataset.js;
    if (!slug) return;
    item.addEventListener('click', () => {
      setActiveFilter(activeFilter === slug ? null : slug);
    });
  });
}

function initProjectRows() {
  const hiddenDiv = document.getElementById('projectTileHidden');
  const visibleDiv = document.getElementById('projectTileVisible');
  if (!hiddenDiv || !visibleDiv) return;

  let counter = 0;
  document.querySelectorAll<HTMLElement>('.projRow').forEach((item) => {
    const stack = (item.dataset.stack ?? '').split(/\s+/).filter(Boolean);
    const position = counter;
    item.setAttribute('data-tile', String(position));
    counter++;

    window.addEventListener('updateProject', () => {
      const active = rowMatchesFilter(stack);

      if (active) {
        item.classList.remove('projRow--hidden');
        visibleDiv.appendChild(item);
      } else {
        item.classList.add('projRow--hidden');
        hiddenDiv.appendChild(item);
      }
    });
  });
}

function applyUrlFilter() {
  const requested = new URLSearchParams(window.location.search).get('filter');
  const stacks = [...document.querySelectorAll<HTMLElement>('.projRow')].map((item) =>
    (item.dataset.stack ?? '').split(/\s+/).filter(Boolean),
  );
  const filter = stackFilterWithMatches(requested, stacks);
  if (!filter) {
    if (requested) dropFilterParam();
    return;
  }
  activeFilter = filter;
  paintButtons();
  applyActiveFilters();
}

initFilterButtons();
initProjectRows();
applyUrlFilter();

export {};

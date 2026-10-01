const activeFilters: string[] = [];

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

function rowMatchesFilters(roles: string[]): boolean {
  if (activeFilters.length === 0) return true;
  return activeFilters.some((slug) => roles.includes(slug));
}

function applyActiveFilters() {
  document.dispatchEvent(
    new CustomEvent('updateProject', {
      bubbles: true,
      detail: {},
    }),
  );
  setTimeout(sortProjects, 10);
  window.locoScroll?.update();
}

function initFilterButtons() {
  document.querySelectorAll<HTMLButtonElement>('.filterBtn').forEach((item) => {
    const slug = item.dataset.js;
    if (!slug) return;
    item.addEventListener('click', () => {
      item.classList.toggle('filterBtn--selected');
      const selected = item.classList.contains('filterBtn--selected');
      const index = activeFilters.indexOf(slug);
      if (selected && index === -1) activeFilters.push(slug);
      else if (!selected && index > -1) activeFilters.splice(index, 1);
      applyActiveFilters();
    });
  });
}

function initProjectRows() {
  const hiddenDiv = document.getElementById('projectTileHidden');
  const visibleDiv = document.getElementById('projectTileVisible');
  if (!hiddenDiv || !visibleDiv) return;

  let counter = 0;
  document.querySelectorAll<HTMLElement>('.projRow').forEach((item) => {
    const roles = (item.dataset.js ?? '').split(',').filter(Boolean);
    const position = counter;
    item.setAttribute('data-tile', String(position));
    counter++;

    window.addEventListener('updateProject', () => {
      const active = rowMatchesFilters(roles);

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
  const params = new URLSearchParams(window.location.search);
  const filter = params.get('filter');
  if (!filter) return;

  document.cookie = `visitorFilter=${encodeURIComponent(filter)}; path=/; max-age=31536000`;
  const filters = filter.split(',').filter(Boolean);
  activeFilters.length = 0;
  activeFilters.push(...filters);

  document.querySelectorAll<HTMLButtonElement>('.filterBtn').forEach((btn) => {
    const slug = btn.dataset.js;
    btn.classList.toggle('filterBtn--selected', !!slug && filters.includes(slug));
  });

  applyActiveFilters();
}

initFilterButtons();
initProjectRows();
applyUrlFilter();

export {};

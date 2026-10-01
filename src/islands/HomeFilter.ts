// Homepage URL filter — client-side cookie for static build (?filter=vr)
import {
  readVisitorFilterSession,
  writeVisitorFilterSession,
} from '../lib/visitor-filter';

function applyHomeFilter(): void {
  const section = document.getElementById('MyWork');
  if (!section) return;

  const params = new URLSearchParams(window.location.search);
  const filterParam = params.get('filter');
  const effectiveFilter = filterParam ?? readVisitorFilterSession();
  const filters = effectiveFilter ? effectiveFilter.split(',').filter(Boolean) : [];

  if (filterParam) {
    writeVisitorFilterSession(filterParam);
  }

  const rows = Array.from(section.querySelectorAll<HTMLElement>('.projRow'));
  rows.forEach((row, index) => {
    const roles = (row.dataset.js ?? '').split(',').filter(Boolean);
    let visible = false;

    if (filters.length === 0) {
      visible = index < 6;
    } else {
      visible = filters.some((slug) => roles.includes(slug));
    }

    row.classList.toggle('projRow--hidden', !visible);
    row.style.display = visible ? '' : 'none';
  });
}

applyHomeFilter();

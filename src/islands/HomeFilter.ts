import { visibleTileAlignments } from '../lib/home-tile-align';
import { stackFilterWithMatches } from '../lib/stack';

function stackSlugs(row: HTMLElement): string[] {
  return (row.dataset.stack ?? '').split(/\s+/).filter(Boolean);
}

function dropFilterParam(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('filter')) return;
  url.searchParams.delete('filter');
  history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

function applyHomeFilter(): void {
  const section = document.getElementById('MyWork');
  if (!section) return;

  const rows = Array.from(section.querySelectorAll<HTMLElement>('.projRow'));
  const requested = new URLSearchParams(window.location.search).get('filter');
  const filter = stackFilterWithMatches(requested, rows.map(stackSlugs));
  if (requested && !filter) dropFilterParam();

  const visibleFlags = rows.map((row, index) => {
    if (!filter) return index < 6;
    return stackSlugs(row).includes(filter);
  });
  const alignments = visibleTileAlignments(visibleFlags);

  rows.forEach((row, index) => {
    const visible = visibleFlags[index];
    const side = alignments[index];

    row.classList.toggle('projRow--hidden', !visible);
    row.classList.toggle('projRow--zigzag-end', side === 'end');
    row.classList.toggle('projRow--zigzag-start', side === 'start');
    row.style.display = visible ? '' : 'none';
  });
}

applyHomeFilter();

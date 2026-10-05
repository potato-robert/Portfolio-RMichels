// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import {
  buildSlideData,
  collectCarouselFigures,
  findSlideIndex,
  resolveCaption,
  resolveSlideSrc,
} from './project-lightbox';

function setupDom(html: string): HTMLElement {
  document.body.innerHTML = html;
  return document.getElementById('projContent')!;
}

describe('collectCarouselFigures', () => {
  it('includes figures with images', () => {
    setupDom(`
      <div id="projContent">
        <figure><img src="/a.jpg" alt="a"></figure>
        <figure><img src="/b.jpg" alt="b"></figure>
      </div>
    `);
    expect(collectCarouselFigures()).toHaveLength(2);
  });

  it('excludes figures with ignorecarousel', () => {
    setupDom(`
      <div id="projContent">
        <figure ignorecarousel>
          <figure><img src="/inner.jpg" alt="inner"></figure>
        </figure>
        <figure><img src="/top.jpg" alt="top"></figure>
      </div>
    `);
    const figures = collectCarouselFigures();
    expect(figures).toHaveLength(2);
    expect(figures.every((f) => !f.hasAttribute('ignorecarousel'))).toBe(true);
  });

  it('excludes figures without images', () => {
    setupDom(`
      <div id="projContent">
        <figure><p>no image</p></figure>
        <figure><img src="/a.jpg" alt="a"></figure>
      </div>
    `);
    expect(collectCarouselFigures()).toHaveLength(1);
  });
});

describe('resolveCaption', () => {
  it('uses own figcaption', () => {
    setupDom(`
      <div id="projContent">
        <figure id="fig">
          <img src="/a.jpg" alt="a">
          <figcaption>Own caption</figcaption>
        </figure>
      </div>
    `);
    const figure = document.getElementById('fig')!;
    expect(resolveCaption(figure)).toBe('Own caption');
  });

  it('falls back to parent figure caption', () => {
    setupDom(`
      <div id="projContent">
        <figure ignorecarousel>
          <div class="mediaRow">
            <figure id="inner">
              <img src="/a.jpg" alt="a">
            </figure>
          </div>
          <figcaption>Group caption</figcaption>
        </figure>
      </div>
    `);
    const inner = document.getElementById('inner')!;
    expect(resolveCaption(inner)).toBe('Group caption');
  });
});

describe('resolveSlideSrc', () => {
  it('prefers data-full-src for lightbox', () => {
    setupDom(`<div id="projContent"></div>`);
    const img = document.createElement('img');
    img.src = '/assets/img/foo/bar-800.webp';
    img.setAttribute('data-full-src', '/assets/img/foo/bar.jpg');
    expect(resolveSlideSrc(img)).toBe('/assets/img/foo/bar.jpg');
  });
});

describe('buildSlideData', () => {
  it('builds slide data for all carousel figures', () => {
    setupDom(`
      <div id="projContent">
        <figure>
          <img src="/assets/img/test/one.jpg" data-full-src="/assets/img/test/one.jpg" alt="One" width="800" height="600">
          <figcaption>Caption one</figcaption>
        </figure>
      </div>
    `);
    const slides = buildSlideData();
    expect(slides).toHaveLength(1);
    expect(slides[0].src).toBe('/assets/img/test/one.jpg');
    expect(slides[0].caption).toBe('Caption one');
    expect(slides[0].width).toBe(800);
    expect(slides[0].height).toBe(600);
  });
});

describe('findSlideIndex', () => {
  it('finds index by figure element', () => {
    setupDom(`
      <div id="projContent">
        <figure id="f1"><img src="/a.jpg" alt="a"></figure>
        <figure id="f2"><img src="/b.jpg" alt="b"></figure>
      </div>
    `);
    const figures = collectCarouselFigures();
    const f2 = document.getElementById('f2')!;
    expect(findSlideIndex(figures, f2)).toBe(1);
  });

  it('finds index by figure id string', () => {
    setupDom(`
      <div id="projContent">
        <figure id="f1"><img src="/a.jpg" alt="a"></figure>
        <figure id="target"><img src="/b.jpg" alt="b"></figure>
      </div>
    `);
    const figures = collectCarouselFigures();
    expect(findSlideIndex(figures, 'target')).toBe(1);
  });

  it('returns -1 for unknown target', () => {
    setupDom(`
      <div id="projContent">
        <figure><img src="/a.jpg" alt="a"></figure>
      </div>
    `);
    const figures = collectCarouselFigures();
    expect(findSlideIndex(figures, 'missing')).toBe(-1);
  });
});

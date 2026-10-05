/** Non-main pages: audit expects description length 50–180. */
export function clampMetaDescription(text: string, max = 160, min = 50): string {
  let s = text.trim().replace(/\s+/g, ' ');
  if (s.length > max) {
    s = s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
  }
  if (s.length < min) {
    return s;
  }
  return s;
}

export function projectMetaDescription(
  name: string,
  projectType: string,
  body: string,
  locale: 'en' | 'de',
): string {
  const max = 160;
  const min = 50;
  let s = clampMetaDescription(body, max, min);
  if (s.length >= min) return s;

  const prefix =
    locale === 'de'
      ? `${name} (${projectType}) — Portfolio von Robert Michels. `
      : `${name} (${projectType}) — Robert Michels Portfolio. `;
  s = clampMetaDescription(`${prefix}${body}`, max, min);
  return s.length >= min ? s : `${prefix}${body}`.trim().slice(0, max);
}

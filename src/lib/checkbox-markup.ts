/** HTML for `.ui-checkbox` — keep in sync with `components/Checkbox.astro`. */
export function uiCheckboxMarkup(
  inputAttrs: string,
  labelHtml: string,
  extraClassNames = '',
): string {
  const classes = extraClassNames ? `ui-checkbox ${extraClassNames}` : 'ui-checkbox';
  return `<label class="${classes}">
    <input type="checkbox" class="ui-checkbox__input" ${inputAttrs} />
    <span class="ui-checkbox__box" aria-hidden="true"></span>
    <span class="ui-checkbox__text">${labelHtml}</span>
  </label>`;
}

// Bridge React-style inline style objects to Solid.
//
// Solid applies styles via `element.style.setProperty(key, value)` with the key
// AS-IS and never auto-adds units (see @solidjs/web style handling). React, by
// contrast, accepts camelCase keys and auto-`px`es numeric values. The app was
// written React-style (camelCase keys, bare numbers), so `s()` normalizes any
// such object(s) into what Solid's `style` prop needs: kebab-case keys and
// unit-suffixed string values. It also merges several objects left-to-right
// (replacing the old `{ ...base, ...override }` spreads), skipping nullish.

export type StyleValue = string | number | undefined | null | false;
export type StyleInput = Record<string, StyleValue> | undefined | null | false;

// CSS properties whose numeric values are unitless (must NOT get a `px`).
const UNITLESS = new Set([
  "animation-iteration-count",
  "aspect-ratio",
  "border-image-outset",
  "border-image-slice",
  "border-image-width",
  "column-count",
  "columns",
  "flex",
  "flex-grow",
  "flex-shrink",
  "font-weight",
  "grid-area",
  "grid-column",
  "grid-column-end",
  "grid-column-start",
  "grid-row",
  "grid-row-end",
  "grid-row-start",
  "line-clamp",
  "-webkit-line-clamp",
  "line-height",
  "opacity",
  "order",
  "orphans",
  "tab-size",
  "widows",
  "z-index",
  "zoom",
  "fill-opacity",
  "flood-opacity",
  "stop-opacity",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
]);

const toKebab = (key: string): string =>
  key.startsWith("--") ? key : key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

export function s(...inputs: StyleInput[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const input of inputs) {
    if (!input) continue;
    for (const rawKey in input) {
      const value = input[rawKey];
      if (value === undefined || value === null || value === false) continue;
      const key = toKebab(rawKey);
      out[key] =
        typeof value === "number" && !UNITLESS.has(key)
          ? `${value}px`
          : String(value);
    }
  }
  return out;
}

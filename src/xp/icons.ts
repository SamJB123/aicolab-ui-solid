// TODO(colab-os): icon set is a prime reskin candidate — swap assets, keep the lookup API.

// Eagerly resolve every bundled icon to its final asset URL at build time.
const iconModules = import.meta.glob<string>(
  "./assets/icons/**/*.{png,ico,webp}",
  { eager: true, import: "default", query: "?url" },
);

/** Relative path under icons/, e.g. "ie.png" or "toolbar/back.png". */
export type XpIconPath = string;

/**
 * Resolve an icon path to its bundled asset URL.
 *
 * Accepts bare paths ("ie.png", "dialog/error.png") as well as the legacy
 * public-path form the reference app used ("/xp/ie.png" or "xp/ie.png").
 * On a miss it warns and returns "" (SSR-safe; never throws).
 */
export function xpIconUrl(path: XpIconPath): string {
  // Normalize the legacy "/xp/" (or "xp/") public-path prefix.
  let normalized = path.replace(/^\/?xp\//, "");
  // Tolerate any other stray leading slash.
  normalized = normalized.replace(/^\/+/, "");

  const url = iconModules[`./assets/icons/${normalized}`];
  if (url === undefined) {
    console.warn(`[ui-solid/xp] unknown icon: ${path}`);
    return "";
  }
  return url;
}

# design-sync notes — @aicolab/ui-solid

## The big one: this is an OFF-SCRIPT Solid sync

- claude.ai/design's converter and design agent are React-native. The user
  explicitly directed (2026-07-14) that this SolidJS-v2 library sync anyway,
  with the design agent instructed to write Solid instead of React. That
  override lives in `.design-sync/conventions.md` (→ README header) and
  `guidelines/solid-cheatsheet.md`.
- The stock `package-build.mjs` is NOT used (esbuild can't compile Solid JSX).
  The converter is **`.ds-sync/solid-build.mjs`** (staged, gitignored — restage
  from this repo's git history? No: it lives in `.ds-sync/` which is gitignored;
  a fresh clone must re-create it. Its full source is small and self-contained;
  if lost, re-run /design-sync and point the agent at this file's description
  or restore from the uploaded project's provenance). Validation/capture use
  the STOCK `package-validate.mjs` / `package-capture.mjs` — the layout is
  byte-compatible (incl. `_ds_sync.json` via `lib/sync-hashes.mjs`, and
  `.stories-map.json` needs top-level `keyRecipe`).
- `resync.mjs` (the stock driver) will NOT work here — it invokes
  `package-build.mjs`. Re-sync = `node .ds-sync/solid-build.mjs` → validate →
  capture (grades carry) → upload per base skill §3/§5.

## Toolchain pins (converter deps in .ds-sync, npm --legacy-peer-deps)

- `@babel/core@7.29.7` + `@babel/preset-typescript@^7` + `babel-preset-solid@2.0.0-beta.17`.
  **Babel 8 breaks babel-preset-solid** (helper-plugin-utils mismatch → JSX
  parse fails with "Unexpected token"). preset-solid v2 defaults
  `moduleName: "@solidjs/web"` — correct, no options needed.
- `typescript@5.9.3` — validate's .d.ts parse check silently skips on
  typescript@7 (Go preview, no classic JS API).
- `tailwindcss@4.3.2` + `@tailwindcss/cli@4.3.2`; solid-js/@solidjs/web resolve
  from the package's own node_modules (2.0.0-beta.17, pnpm workspace catalog).
- Render check/capture: no playwright chromium download needed —
  `DS_CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`.

## Layout decisions

- Bundle exposes components flat + `Solid` (solid-js namespace) + `SolidWeb`
  (@solidjs/web) on `window.AicolabUiSolid`. Preview .tsx imports of
  `solid-js` / `@solidjs/web` / `@aicolab/ui-solid` are shimmed to those
  globals, so cards exercise the real uploaded bundle.
- The package ships NO palette by design (apps own values). Default theme
  curated into `.design-sync/theme/theme.css`: light = playground/template,
  dark = playground/audit-corpus (minus its app-specific severity ramp),
  selector `.theme-dark` / `[data-theme="dark"]`.
- Tailwind v4 compiles the package src classes + a curated `@source inline`
  safelist (layout vocabulary for the design agent, incl. every
  `{bg,text,ring,border,fill,stroke,divide,outline}-[var(--c-*)]`). Tailwind
  does NOT run at design render time — conventions.md tells the agent to stay
  inside the compiled vocabulary or use inline styles.
- src/styles.css's leading block comment is stripped in `_ds_bundle.css` — it
  contains a documentation `@import "@aicolab/ui-solid/styles.css"` line that
  validate's scanner flags as `[CSS_IMPORT_MISSING]`.
- `.d.ts` are Solid-flavoured and self-contained (no imports): props from the
  source first-param type text, `ParentProps<…>` unwrapped to members +
  `children?: JSXElement`, prelude aliases (ClassProp/StatusVisual/SegOption/
  JSXElement). `JSXElement` must always be in the prelude (declare-fn return).
- `cfg.runtimeFontPrefixes: ["Iowan Old Style", "Palatino"]` — dark-theme
  display stack names macOS SYSTEM fonts (graceful serif fallback elsewhere);
  nothing to ship, suppression is correct, user's palette choice.

## Known render warns (triaged legitimate)

- (none currently — 15/15 render clean, all cells graded good)

## Preview composition gotchas (fold into future previews)

- `Panel` children live in a flex column → inline children (Button) need
  `class="self-start"` or they stretch full width.
- `Waveform` uses `h-full` → needs an explicit-height parent (`h-10 w-48`).
- Floor cards with `{}` props render blank for Chip/Meter/Segmented (children/
  value/options required) — RENDER_BLANK warns are expected if a preview is
  ever removed.

## Re-sync risks

- **solid-build.mjs is gitignored state**: it must exist in `.ds-sync/` for any
  re-sync. If missing, restage skill scripts + recreate it (this file + the
  config describe everything it does).
- Solid 2 beta bumps (catalog: 2.0.0-beta.17): a version bump changes bundle
  bytes → styleSha/bundleSha move → re-upload; grades still carry (sourceKeys
  are preview+config only). babel-preset-solid must be bumped in lockstep.
- Theme values were COPIED from the two playground apps' styles.css on
  2026-07-14 — if those palettes evolve, `.design-sync/theme/theme.css` goes
  stale silently.
- The Solid cheatsheet was copied from
  `~/GitHub/reference-material/solid/packages/solid/CHEATSHEET.md` (branch
  `next`, beta.17) — re-copy on Solid version bumps.
- The design app's rendering of agent-written Solid code is UNVERIFIED from
  this side: preview cards render Solid correctly in chromium, but whether the
  claude.ai/design runtime executes agent-authored Solid JSX (its build
  pipeline may assume React JSX transform) could only be confirmed by using
  the design tool itself. The user believes the agent is Solid-literate;
  conventions.md + guidelines are written to maximise the odds. Check the
  first real design built in the app.

# ⚠ This design system is SolidJS v2 — do NOT write React

**Framework override (per the design-system owner):** every design built with
this library must be written in **SolidJS 2.0** (solid-js 2.0.0-beta.17), not
React. The components are real Solid components; React APIs (`useState`,
`useEffect`, `ReactDOM`, `className`, destructured props) do not exist here and
will break. **Before writing any component code, read
`guidelines/solid-cheatsheet.md`** — Solid 2 is different from both React AND
Solid 1.x, and it lists the exact corrections.

## Runtime and mounting

`_ds_bundle.js` puts everything on one global:

- `window.AicolabUiSolid.<Component>` — the 15 components (`Button`, `Panel`, `Chip`, …)
- `window.AicolabUiSolid.Solid` — the full `solid-js` API (`createSignal`, `createMemo`, `createEffect`, `createStore`, `Show`, `For`, `Switch`, `untrack`, `flush`, `onSettled`, …)
- `window.AicolabUiSolid.SolidWeb` — the full `@solidjs/web` API (`render`, `Portal`, `Dynamic`, …)

Mount with Solid's render, never ReactDOM:

```jsx
const { Panel, Chip, Button, Solid, SolidWeb } = window.AicolabUiSolid;
const { createSignal } = Solid;

function App() {
  const [open, setOpen] = createSignal(false);          // read via open(), NOT open
  return (
    <Panel title="Broadcast" kicker="channel two" glow
           action={() => <Chip tone="live">on air</Chip>}>
      <p style={{ margin: '0 0 16px', 'font-size': '0.875rem', color: 'var(--c-muted)' }}>
        Streaming to 312 listeners.
      </p>
      <div style={{ 'align-self': 'flex-start' }}>
        <Button variant="primary" onClick={() => setOpen(!open())}>
          Open studio view
        </Button>
      </div>
    </Panel>
  );
}
SolidWeb.render(() => <App />, document.getElementById('app'));
```

Solid-2 rules that most often trip codegen (details + more in the cheatsheet):
`class` not `className` (string, object `{active: cond()}`, or array mix — never
manual string concat); read props as `props.x`, never destructure; pass values
at call sites (`value={count()}`, not `count`); `createEffect(compute, apply)`
takes two functions; `onSettled` replaces `onMount`; `<Loading>`/`<Errored>`
replace `Suspense`/`ErrorBoundary`; `<For>` replaces `.map()`.

## Styling: token contract + semantic classes + inline styles (NO Tailwind)

There are **no utility classes** in this system (Tailwind was removed
2026-08-07). Classes like `flex`, `p-4`, `text-sm`, `bg-[var(--c-panel)]` do
not exist and will silently do nothing. Three styling surfaces exist:

1. **The components style themselves.** Every component carries its own
   semantic CSS (`.ui-*` classes in `_ds_bundle.css`) — spacing, typography,
   colours, variants (via props like `tone`/`variant`) are built in. Don't
   restyle their interiors.
2. **The token contract** for every colour/font you write yourself. Never
   hard-code colours or fonts. Defined by the canonical `src/styles.css`
   import graph as
   `light-dark()` pairs — dark mode via `class="theme-dark"` (or
   `data-theme="dark"`) on any ancestor:
   - surfaces `--color-base-100` through `--color-base-300`
   - text `--color-base-content`, plus its `-muted` / `-faint` roles
   - semantic families `--color-primary`, `--color-secondary`, `--color-accent`,
     `--color-neutral`, `--color-info`, `--color-success`, `--color-warning`,
     and `--color-error`, each paired with `--color-*-content`
   - hairlines `--color-border` / `--color-border-strong`
	- font roles `--font-display` / `--font-sans` / `--font-data`, plus
     optional `--font-label` for the micro-label voice (eyebrows, chips,
     panel kickers, field labels) — unset it falls back to `--font-data`
3. **Inline `style={{ ... }}` for layout glue and one-off text styling** —
   kebab-case keys (`'font-size'`, `'align-items'`, `'box-shadow'`), values
   referencing the tokens (`color: 'var(--color-base-content-muted)'`). Flex/grid wrappers,
   widths, gaps, ad-hoc labels: all inline. Components accept `class` but
   only for classes that actually exist — when a component needs one-off
   placement (e.g. keep a Button from stretching in Panel's flex column),
   wrap it: `<div style={{ 'align-self': 'flex-start' }}><Button …/></div>`.

## Where the truth lives

- `guidelines/solid-cheatsheet.md` — Solid 2 API + the 1.x/React footgun list. Read first.
- `components/<Group>/<Name>/<Name>.prompt.md` — verified Solid usage examples per component (each example rendered and reviewed).
- `src/styles.css` — the single complete styling surface: typed properties,
  canonical default theme, resolver and semantic component classes.
- Composition tips learned building the previews: `Panel` children are a flex
  column (wrap inline children in an `align-self: flex-start` div); `Waveform`
  needs an explicit-height parent (e.g. `style={{ height: '2.5rem', width:
  '12rem' }}`); `Counter`/`Sparkline`/`Meter` size from props or wrappers.

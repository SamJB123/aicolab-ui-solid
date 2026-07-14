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
      <p class="m-0 mb-4 text-sm text-[var(--c-muted)]">Streaming to 312 listeners.</p>
      <Button variant="primary" class="self-start" onClick={() => setOpen(!open())}>
        Open studio view
      </Button>
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

## Styling: token contract + compiled utility classes

Never hard-code colours or fonts. The palette is a CSS-variable contract
(defined in `tokens/theme.css`, light `:root` default, dark via
`class="theme-dark"` on any ancestor):

- surfaces `--c-ink` / `--c-ink-2` (page/recessed), `--c-panel` / `--c-panel-2` (raised)
- text `--c-paper` / `--c-muted` / `--c-faint`
- signals `--c-accent` / `--c-accent-soft` / `--c-live`
- hairlines `--c-line` / `--c-line-strong`
- font roles `--font-display` / `--font-sans` / `--font-data` (helper classes `.font-display`, `.font-data`)

Layout glue uses the **precompiled** Tailwind subset in `_ds_bundle.css` —
Tailwind does NOT run at render time, so only classes already in that file
exist. Available families: display/flex/grid (`flex`, `items-center`,
`justify-between`, `grid-cols-{1..6,12}`), `gap-*`/`p-*`/`m-*` (steps
0–12,16), `w-*`/`h-*`/`max-w-*`, `text-{xs..5xl}`, `font-{normal..bold}`,
`tracking-*`, `rounded-*`, `border`/`ring-{1,2}`, `shadow-*`, `opacity-*`,
positioning/overflow/z, `transition`/`duration-*`, and every
`{bg,text,ring,border,fill,stroke,divide,outline}-[var(--c-*)]` token colour.
For anything outside that vocabulary use inline `style={{ ... }}` (kebab-case
keys: `'font-size'`, `'box-shadow'`). Component-internal arbitrary classes
(e.g. `text-[10px]`) are compiled too and safe to reuse.

## Where the truth lives

- `guidelines/solid-cheatsheet.md` — Solid 2 API + the 1.x/React footgun list. Read first.
- `components/<Group>/<Name>/<Name>.prompt.md` — verified Solid usage examples per component (each example rendered and reviewed).
- `styles.css` → `tokens/theme.css` + `_ds_bundle.css` — the complete styling surface.
- Composition tips learned building the previews: `Panel` children are a flex
  column (give inline children `self-start`); `Waveform` needs an explicit-height
  parent (`h-10 w-48`); `Counter`/`Sparkline`/`Meter` size from props or wrappers.

# @aicolab/ui-solid

A Solid v2 component system written in plain, modern CSS — no Tailwind, no
CSS-in-JS, no build-time styling step. Components are authored for the
platform the web is converging on (typed `attr()`, `@property`, `@scope`,
cascade layers, container style queries, anchor positioning, popovers) with
custom properties as the compatibility layer, so today's browsers get the
full experience and the move to the frontier syntax is a mechanical deletion.

Two systems do most of the work, and both are open to your own components:
the **three-axis colour system** (one set of attributes turns any element
into a themed surface with a full, contrast-correct role palette) and the
**knob system** (typed, per-instance styling props that reach hover states,
pseudo-elements and generated content while staying overridable from CSS).

## Install

```sh
pnpm add @aicolab/ui-solid solid-js @solidjs/web
```

`solid-js` and `@solidjs/web` (Solid v2) are peers. Import the stylesheet
once; it includes the reset and every layer:

```tsx
import '@aicolab/ui-solid/styles.css'
import { Button, Panel, RichList } from '@aicolab/ui-solid'

<Button colorBase="success" variant="soft" radius="6px">Approve</Button>
```

Browser floor: the Baseline-2026 feature set (`@scope`, `@property`,
`color-mix`, relative colours, popovers, container queries). Frontier
features are gated behind `@supports` and are pure enhancements.

## Entry points

| Import | What it is |
|---|---|
| `@aicolab/ui-solid` | Atoms, molecules and organisms (`Button`, `Panel`, `WorkspaceShell`, `BottomNavigation`, `CommandPalette`, `MonthCalendar`, …) plus `colorTreatmentData`, `defineKnobs`, `mergeKnobStyle` for your own components |
| `./styles.css`, `./reset.css` | The full layered stylesheet; the reset alone |
| `./themes/crimson-legal.css` | An alternative theme root |
| `./depth-card` | The structured depth card |
| `./prosekit-solid`, `./prosekit-solid/presence`, `./prosekit-solid/block-identity`, `./prosekit-solid/styles.css` | ProseKit editor bindings with yjs presence |
| `./xp`, `./xp/styles.css` | The Windows XP-flavoured desktop kit |

Apps define the semantic `--color-*` family/content palette and font roles
on a theme root (see `src/styles.css` for the contract).

## The three-axis colour system

Every colour decision is up to three orthogonal choices, passed as props and
emitted as data attributes:

| Axis | Prop | Values |
|---|---|---|
| Family | `colorBase` | `primary` `secondary` `accent` `neutral` `info` `success` `warning` `error` |
| Strength | `colorLevel` | `50 100 200 … 900 950` (default `500`) |
| Presentation | `variant` | `solid` `soft` `outline` `ghost` `text` (default `solid`) |

A shared resolver stylesheet watches those attributes and computes ~30
**role variables** on the element: `--ui-surface`/`--ui-ink` (and their
hover and selected pairs), `--ui-color`/`--ui-content` (the strong pair),
`--ui-ink-muted`, `--ui-border`, `--ui-color-foreground`, `--ui-focus-ring`,
and so on. **Surfaces and inks travel as pairs** — whenever a rule paints a
role surface it paints the paired ink in the same breath, which is what makes
any family × level × variant combination readable without per-combination CSS.

Setting the base-colour attribute opts *any* element in, including plain
HTML; in Solid, `colorTreatmentData(props)` emits the attributes from the
same typed props the built-ins use. Consume roles, never the resolver's
private inputs — `pnpm check-boundaries` enforces this.

## The knob system

Knobs are typed, per-instance styling parameters. A component declares its
contract once with `defineKnobs('my-callout', { radius: '<length-percentage>' })`
and instances pass plain or reactive values. Every knob rides two wires: a
custom property (the Baseline path, consumed through `var(…, default)`
chains) and a data attribute (the frontier path, consumed via typed
`attr()` behind a support gate). Because the public wire is an ordinary
inheriting custom property, knobs are reachable from any ancestor's CSS
without props — how you restyle components you don't render. An explicit
knob prop beats an inherited default, which beats a mode preset, which
beats the component's token-live default.

Not everything is a knob: optional styling overrides are knobs; named modes
are data attributes (`size="sm"`); values supplied every render are direct,
`@property`-registered wires. `pnpm check-css-compatibility` parses every
sheet and fails on any drift between the two wires.

## Composition

Molecules drill the treatment axes into what they render and share them by
context with caller-authored children; slot content is yours to treat
(pass the family into your own atoms); containers may re-default their
items' public knob variables, and instances always override.

## Developing

A git submodule of the `aicolab-portal` monorepo (`packages/ui-solid`).

```sh
pnpm storybook                 # every component has a Playground story
pnpm check-types
pnpm check-boundaries          # Atomic Design import direction, private inputs
pnpm check-css-compatibility   # dual-wire pairing and fallbacks
```

Styles ship in cascade layers (`reset, ui.tokens, ui.resolver,
ui.foundations, ui.atoms, ui.molecules, ui.organisms, ui.enhancements`);
unlayered app CSS outranks all of it by default.

## Versioning and publishing

All `@aicolab/*` packages are versioned together. `pnpm publish` rewrites
`workspace:` and `catalog:` specifiers to concrete ranges in the published
manifest.

## License

Proprietary. Published to npm with restricted access; all rights reserved.

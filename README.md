# @aicolab/ui-solid

A SolidJS (v2) component system written in plain, modern CSS — no Tailwind, no
CSS-in-JS, no build-time styling step. Components are authored **for the
platform the web is converging on** (typed `attr()`, `@property`, `@scope`,
cascade layers, container style queries, anchor positioning, popovers) with
custom properties as the compatibility layer, so today's browsers get the full
experience and the migration to the frontier syntax is a mechanical deletion.

Two systems do most of the work, and both are open to your own components:

- the **three-axis colour system** — one set of attributes turns any element
  into a themed surface with a full, contrast-correct role palette;
- the **knob system** — typed, per-instance styling props that reach places
  inline styles never can (hover states, pseudo-elements, generated content),
  while staying overridable from CSS.

```tsx
import '@aicolab/ui-solid/styles.css' // includes the reset + all layers
import { Button, Panel, RichList } from '@aicolab/ui-solid'

<Button colorBase="success" variant="soft" radius="6px">Approve</Button>
```

---

## The three-axis colour system

Every colour decision is expressed as up to three orthogonal choices:

| Axis | Prop | Values |
|---|---|---|
| Family | `colorBase` | `primary` `secondary` `accent` `neutral` `info` `success` `warning` `error` |
| Strength | `colorLevel` | `50 100 200 … 900 950` (default `500`) |
| Presentation | `variant` | `solid` `soft` `outline` `ghost` `text` (default `solid`) |

Components accept these as props and emit them as data attributes:

```html
<button data-ui-color-base="success" data-ui-color-level="600" data-ui-color-variant="soft">
```

A shared **resolver** stylesheet (`resolver.css`) watches those attributes and
computes ~30 **role variables** on the element — the complete vocabulary a
treated surface needs:

| Role | Meaning |
|---|---|
| `--ui-surface` / `--ui-ink` | the resting surface and the ink paired to sit on it |
| `--ui-surface-hover` / `--ui-ink-hover` | the hover pair |
| `--ui-surface-selected` / `--ui-ink-selected` | the selected pair |
| `--ui-color` / `--ui-content` | the **strong statement pair**: the exact family colour, and content ink for on top of it |
| `--ui-ink-muted`, `--ui-ink-faint` | quieter voices of the paired ink |
| `--ui-border`, `--ui-border-hover`, `--ui-border-active` | the border family |
| `--ui-color-foreground` | the family as an *accent on the page* (lightness-clamped per scheme) |
| `--ui-focus-ring`, `--ui-track`, `--ui-surface-raised`, `--ui-surface-inset` | focus, tracks, elevation |

**The one rule that matters: surfaces and inks travel as pairs.** Whenever a
rule paints a role surface, it paints the paired ink in the same breath —
that is what makes any family × level × variant combination come out readable
without per-combination CSS. `contrast-color()` is a last-mile tool for
arbitrary runtime colours, never a substitute for the authored pairs.

### Bring your own components

The resolver doesn't know or care whether an element came from this package.
**Setting the base-colour attribute opts any element into the system** — that
attribute is the entire opt-in. Plain HTML + CSS:

```html
<div class="callout" data-ui-color-base="warning" data-ui-color-level="600" data-ui-color-variant="soft">
  <strong>Heads up</strong> — the venue changed.
  <a href="/detail">Details</a>
</div>

<style>
  .callout {
    /* Role variables are live on the element — just consume them in pairs. */
    background: var(--ui-surface);
    color: var(--ui-ink);
    border: 1px solid var(--ui-border);
  }
  .callout strong { color: var(--ui-color-foreground); } /* accent voice */
  .callout a      { color: var(--ui-ink); }
  .callout a:hover {
    background: var(--ui-surface-hover);   /* pair… */
    color: var(--ui-ink-hover);            /* …with pair */
  }
</style>
```

Flip `data-ui-color-base` to `error` — or `data-ui-color-variant` to `solid` —
and every role re-derives, hover pairs included. No callout-specific colour
code exists.

In Solid, the `colorTreatmentData` helper emits the attributes from the same
typed props the built-ins use:

```tsx
import { colorTreatmentData, type ColorTreatmentProps } from '@aicolab/ui-solid'

function Callout(props: { children?: JSX.Element } & ColorTreatmentProps) {
  return (
    <div class="callout" {...colorTreatmentData(props)}>
      {props.children}
    </div>
  )
}

<Callout colorBase="info" variant="outline">Rehearsal moved to Studio B.</Callout>
```

When your component paints the *full family colour* as a surface (a selected
row, a today ring, a header band), use the strong pair — `background:
var(--ui-color); color: var(--ui-content)` — and when a painted state can be a
strong surface, re-pair **every** text voice inside it (timestamps and captions
included), typically to `--ui-ink-muted` / `--ui-ink-faint`.

Only the resolver's *inputs* are private (`--ui-color-base`,
`--ui-color-level`, `--ui-color-variant`, `--ui-level-*`, `--ui-family-ink`) —
consume roles, never inputs. `pnpm check-boundaries` enforces this.

---

## The knob system

Knobs are **typed, per-instance styling parameters**. Each component declares
a contract once; instances pass plain (optionally reactive) values:

```tsx
<Button radius="var(--r-sm)" padInline="20px" hoverBorder="oklch(0.6 0.1 250)">
  Save draft
</Button>

<MonthCalendar colorBase="success" dayRadius="4px" selectedInk="white" … />
```

Under the hood every knob rides **two wires**:

1. a **custom property** — `--ui-btn-radius: var(--r-sm)` — the Baseline path,
   consumed via `var(…, default)` fallback chains, and
2. a **data attribute** — `data-ui-btn-radius="var(--r-sm)"` — the frontier
   path, consumed via typed `attr(… type(<length-percentage>), …)` behind a
   support gate. When typed `attr()` reaches the browser floor (it is in
   Interop 2026), the custom-property wire gets deleted and the components are
   already native.

Because the public wire is an ordinary inheriting custom property, knobs are
reachable **without props** from any ancestor — this is how you restyle
components you don't render (slot content, third-party wrappers):

```css
/* Every button inside the hero: pill → square, without touching JSX. */
.marketing-hero { --ui-btn-radius: 6px; }
```

An explicit knob prop on an instance always beats an inherited default, which
beats a mode/environment preset, which beats the component's token-live
default.

### Three lanes — not everything is a knob

| Kind of input | Mechanism | Example |
|---|---|---|
| Optional styling override | **knob** (dual wire, fallback default) | `radius`, `selectedInk` |
| Named mode | **data attribute + attribute selectors** | `spacing="separated"`, `size="sm"` |
| Value supplied every render | **direct wire** (always-emitted, `@property`-registered) | a meter's percentage, an identity colour |

### BYO knobs

`defineKnobs` gives your own components the same contract:

```tsx
import { defineKnobs, mergeKnobStyle, type KnobProps } from '@aicolab/ui-solid'

const knobs = defineKnobs('my-callout', {
  radius: '<length-percentage>',
  accent: '<color>',
})

function Callout(props: { children?: JSX.Element } & KnobProps<typeof knobs.spec>) {
  return (
    <div
      class="callout"
      {...knobs.attributes(props)}
      style={mergeKnobStyle(knobs.style(props), undefined)}
    >
      {props.children}
    </div>
  )
}
```

```css
/* Resolve each knob ONCE into a registered private adapter, then consume the
   adapter everywhere (states and pseudo-elements included). */
@property --_my-callout-radius {
  syntax: "<length-percentage>";
  inherits: false;
  initial-value: 8px; /* never visible — the sheet always assigns it */
}
.callout {
  --_my-callout-radius: var(--my-callout-radius, var(--r-md));
  border-radius: var(--_my-callout-radius);
}
/* Frontier twin: same default, read as a typed attribute. */
@supports (width: attr(data-ui-compat-probe type(<length>), 0px)) {
  .callout {
    --_my-callout-radius: attr(data-my-callout-radius type(<length-percentage>), var(--my-callout-radius, var(--r-md)));
  }
}
```

The two wires must never disagree: the frontier fallback chains through the
compat variable byte-for-byte. `pnpm check-css-compatibility` parses every
sheet and enforces the pairing, so drift fails CI rather than shipping.

---

## Composition patterns

- **Molecules drill.** A component that *renders* another passes the treatment
  axes down (`DatePicker` → its `IconButton`s), or shares them via context when
  the children are caller-authored (`Accordion` → your `AccordionItem`s,
  `RichList` → your rows). An explicit prop on the child always wins.
- **Slot content is yours.** A container cannot restyle JSX it didn't create —
  a hero's `actions`, a header's toolbar. Pass the family into your own atoms:
  `actions={() => <Button colorBase={base} …/>}`. For geometry, the inheriting
  public knob variables reach slotted components from any ancestor (see above).
- **Containers re-default, instances override.** A collection may set its
  items' *public* knob variables on its root (`Accordion` accepts every
  `AccordionItem` knob as a row default); modes re-default through carriers
  that sit *below* the knob in the fallback chain, so `radius` on one item
  still beats `spacing="separated"` on the collection.

---

## Layers, files, verification

- Styles ship in cascade layers (`reset, ui.tokens, ui.resolver,
  ui.foundations, ui.atoms, ui.molecules, ui.organisms, ui.enhancements`) —
  your unlayered app CSS outranks all of it by default.
- `pnpm check-css-compatibility` — dual-wire pairing, registration/assignment
  bookkeeping, byte-identical fallbacks.
- `pnpm check-boundaries` — Atomic Design import direction, dependency cycles,
  private-resolver-input protection.
- `pnpm storybook` — every component has a Playground story wiring the three
  axes and its full knob set to controls; treatment behaviour is verified
  against the real browser, not just the type-checker.

Browser floor: the Baseline-2026 feature set (`@scope`, `@property`,
`color-mix`, relative colours, popovers, container queries). Frontier blocks
(typed `attr()`, `if()`, `@function`, scroll-driven pseudo-elements) are
gated behind `@supports` and are pure enhancements.

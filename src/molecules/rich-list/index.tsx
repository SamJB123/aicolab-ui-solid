/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { children, createContext, Show, useContext, type Accessor } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). Adapters resolve on
 * each row (the treatment attrs always ride the rows, so role-based defaults
 * are always live); the collection accepts the same knob props as defaults
 * for every row via the inheriting public variables. */
const knobs = defineKnobs('ui-rl', {
	rowRadius: '<length-percentage>',
	rowPadBlock: '<length>',
	rowPadInline: '<length>',
	rowGap: '<length>',
	titleSize: '<length>',
	titleInk: '<color>',
	descriptionSize: '<length>',
	descriptionInk: '<color>',
	trailingInk: '<color>',
	leadingInk: '<color>',
	metadataPrimaryInk: '<color>',
	metadataSecondaryInk: '<color>',
	divider: '<color>',
})

/** Collection-level treatment; rows use it as their per-prop default. */
type RichListContextValue = { treatment: Accessor<ColorTreatmentProps> }
const RichListContext = createContext<RichListContextValue>({ treatment: () => ({}) })

export function RichList(
	props: {
		label?: string
		navigation?: boolean
		class?: ClassProp
		/** The root element: a `ul` (the default), or a `div` with the list role for a host
		 *  that must put layout-only elements between the list and its rows (an editor's
		 *  node views); a `ul` may hold nothing but its items. */
		as?: 'ul' | 'div'
		children?: JSX.Element
	} & ColorTreatmentProps &
		KnobProps<typeof knobs.spec>,
) {
	/* The family defaults to primary/500 — the classic rich-list look. */
	const treatment = (): ColorTreatmentProps => ({
		colorBase: props.colorBase ?? 'primary',
		colorLevel: props.colorLevel,
		variant: props.variant,
	})
	/* List-level roles feed the navigation mode's shared sliding surface (::before reads
	   --ui-color on the root). Row knob defaults ride the inheriting public variables — no
	   data attributes here, since attr() reads the matched element and these are consumed
	   on the rows. */
	const root = () => ({
		class: ['ui-rich-list', props.class],
		'aria-label': props.label,
		'data-navigation': props.navigation ? '' : undefined,
		...colorTreatmentData(treatment()),
		style: knobs.style(props),
	})
	return (
		<RichListContext value={{ treatment }}>
			<Show when={props.as === 'div'} fallback={<ul {...root()}>{props.children}</ul>}>
				<div role="list" {...root()}>
					{props.children}
				</div>
			</Show>
		</RichListContext>
	)
}

/** Compact provenance/timing anatomy for the trailing edge of rich rows. */
export function RichListMetadata(props: {
	primary: JSX.Element
	secondary?: JSX.Element
	actions?: JSX.Element
	class?: ClassProp
}) {
	// Single-eval slot resolution (children()) — element-JSX props are getters;
	// double evaluation breaks hydration claiming.
	const secondary = children(() => props.secondary)
	const actions = children(() => props.actions)
	return (
		<span class={['ui-rich-list-metadata', props.class]}>
			<span class="ui-rich-list-metadata-primary">{props.primary}</span>
			<Show when={secondary()}>
				<span class="ui-rich-list-metadata-secondary">{secondary()}</span>
			</Show>
			<Show when={actions()}>
				<span class="ui-rich-list-metadata-actions">{actions()}</span>
			</Show>
		</span>
	)
}

/** A compound information row. Supplying onSelect makes the whole row one
 * native action; omitting it produces the same anatomy as static content. */
export function RichListItem(
	props: {
		leading?: JSX.Element
		leadingWidth?: 'auto' | 'wide'
		title: JSX.Element
		description?: JSX.Element
		trailing?: JSX.Element
		onSelect?: () => void
		/** Pointer enters/leaves the row — for hosts that mirror row hover
		 * into another surface (a canvas highlight, a map pin, …). */
		onHoverChange?: (hovering: boolean) => void
		href?: string
		/** Persistent selection, distinct from the transient hover affordance. */
		selected?: boolean
		muted?: boolean
		label?: string
		class?: ClassProp
	} & ColorTreatmentProps &
		KnobProps<typeof knobs.spec>,
) {
	const list = useContext(RichListContext)
	/* The surrounding RichList's treatment is the per-prop default; the row's
	   own props win. `variant` means THE SELECTED LOOK (default solid) —
	   unselected rows always drop to the soft roles: that switch is selection
	   semantics, not styling. */
	const treatment = (): ColorTreatmentProps => ({
		colorBase: props.colorBase ?? list.treatment().colorBase ?? 'primary',
		colorLevel: props.colorLevel ?? list.treatment().colorLevel,
		variant: props.selected ? (props.variant ?? list.treatment().variant ?? 'solid') : 'soft',
	})

	// Single-eval slot resolution (children()) — element-JSX props are getters;
	// double evaluation breaks hydration claiming. Every slot is resolved here, in
	// document order: a slot read lazily inside the JSX (as `title` once was) is created
	// after the eagerly resolved ones on the client but in document order on the
	// server, and its hydration key lands on the wrong element (the review page's
	// resource rows: "expected <a> but found <span class=ui-rich-list-description>").
	const leading = children(() => props.leading)
	const title = children(() => props.title)
	const description = children(() => props.description)
	const trailing = children(() => props.trailing)
	const content = () => (
		<>
			<Show when={leading()}>
				<span class="ui-rich-list-leading" data-width={props.leadingWidth ?? 'auto'}>
					{leading()}
				</span>
			</Show>
			<span class="ui-rich-list-main">
				<span class="ui-rich-list-title">{title()}</span>
				<Show when={description()}>
					<span class="ui-rich-list-description">{description()}</span>
				</Show>
			</span>
			<Show when={trailing()}>
				<span class="ui-rich-list-trailing">{trailing()}</span>
			</Show>
		</>
	)

	/* `class` is deliberately NOT in this spread: a spread-only element whose
	   children are a call hole fails hydration claiming inside a Show fallback
	   (solid-js 2.0.0-rc.0 id-misalignment — minimal repro in
	   rich-list/probe.tsx M15; any static attribute before the spread flips
	   the compiler to the aligned template path). Each branch renders class
	   first, then spreads the rest. */
	const attributes = () => ({
		'data-selected': props.selected ? '' : undefined,
		'data-muted': props.muted ? '' : undefined,
		...colorTreatmentData(treatment()),
		...knobs.attributes(props),
		style: mergeKnobStyle(knobs.style(props), undefined),
		onPointerEnter: () => props.onHoverChange?.(true),
		onPointerLeave: () => props.onHoverChange?.(false),
	})
	const itemClass = () => ['ui-rich-list-item', props.class]

	return (
		<li class="ui-rich-list-entry">
			<Show
				when={props.href}
				fallback={
					<Show
						when={props.onSelect}
						fallback={
							<div class={itemClass()} {...attributes()}>
								{content()}
							</div>
						}
					>
						{(onSelect) => (
							<button
								type="button"
								class={itemClass()}
								{...attributes()}
								aria-label={props.label}
								aria-pressed={props.selected === undefined ? undefined : props.selected ? 'true' : 'false'}
								onClick={() => onSelect()()}
							>
								{content()}
							</button>
						)}
					</Show>
				}
			>
				{(href) => (
					<a
						class={itemClass()}
						{...attributes()}
						href={href()}
						aria-current={props.selected ? 'page' : undefined}
					>
						{content()}
					</a>
				)}
			</Show>
		</li>
	)
}

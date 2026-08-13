/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { createContext, Show, useContext, type Accessor } from 'solid-js'
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
	return (
		<RichListContext value={{ treatment }}>
			<ul
				class={['ui-rich-list', props.class]}
				aria-label={props.label}
				data-navigation={props.navigation ? '' : undefined}
				/* List-level roles feed the navigation mode's shared sliding
				   surface (::before reads --ui-color on this element). Row knob
				   defaults ride the inheriting public variables — no data
				   attributes here, since attr() reads the matched element and
				   these are consumed on the rows. */
				{...colorTreatmentData(treatment())}
				style={knobs.style(props)}
			>
				{props.children}
			</ul>
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
	return (
		<span class={['ui-rich-list-metadata', props.class]}>
			<span class="ui-rich-list-metadata-primary">{props.primary}</span>
			<Show when={props.secondary}>
				{(secondary) => <span class="ui-rich-list-metadata-secondary">{secondary()}</span>}
			</Show>
			<Show when={props.actions}>
				{(actions) => <span class="ui-rich-list-metadata-actions">{actions()}</span>}
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

	const content = () => (
		<>
			<Show when={props.leading}>
				{(leading) => (
					<span class="ui-rich-list-leading" data-width={props.leadingWidth ?? 'auto'}>
						{leading()}
					</span>
				)}
			</Show>
			<span class="ui-rich-list-main">
				<span class="ui-rich-list-title">{props.title}</span>
				<Show when={props.description}>
					{(description) => <span class="ui-rich-list-description">{description()}</span>}
				</Show>
			</span>
			<Show when={props.trailing}>
				{(trailing) => <span class="ui-rich-list-trailing">{trailing()}</span>}
			</Show>
		</>
	)

	const attributes = () => ({
		class: ['ui-rich-list-item', props.class],
		'data-selected': props.selected ? '' : undefined,
		'data-muted': props.muted ? '' : undefined,
		...colorTreatmentData(treatment()),
		...knobs.attributes(props),
		style: mergeKnobStyle(knobs.style(props), undefined),
	})

	return (
		<li class="ui-rich-list-entry">
			<Show
				when={props.href}
				fallback={
					<Show
						when={props.onSelect}
						fallback={<div {...attributes()}>{content()}</div>}
					>
						{(onSelect) => (
							<button
								type="button"
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
					<a {...attributes()} href={href()} aria-current={props.selected ? 'page' : undefined}>
						{content()}
					</a>
				)}
			</Show>
		</li>
	)
}

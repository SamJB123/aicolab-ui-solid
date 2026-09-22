/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { createMemo, For, omit, Show } from 'solid-js'
import {
	type ClassProp,
	type ColorTreatmentProps,
	colorTreatmentData,
} from '../../shared/color-treatment'
import { defineKnobs, type KnobProps, mergeKnobStyle } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-feed', {
	gap: '<length>',
	glyphSize: '<length>',
	maxHeight: '<length>',
})

/** One feed line. The component is DATA-shaped, not domain-shaped: apps map
 *  their events into lines; the feed owns rhythm, glyph bubbles and entry
 *  motion. `ink` tints the glyph bubble (an app colour, e.g. per-actor). */
export interface ActivityFeedItem {
	key: string
	glyph?: JSX.Element
	/** The line, or a lazy slot for it. A slot is invoked in the feed's own scope, under
	 *  its <For>: an element the caller pre-created in a `.map()` desyncs hydration keys
	 *  there (the same rule as Steps' icon), so a line with markup should be a slot. */
	line: JSX.Element | (() => JSX.Element)
	time?: JSX.Element
	ink?: string
}

const slot = (value: JSX.Element | (() => JSX.Element)): JSX.Element =>
	typeof value === 'function' ? value() : value

type ActivityFeedProps = Omit<JSX.HTMLAttributes<HTMLUListElement>, 'class' | 'children'> & {
	class?: ClassProp
	items: ActivityFeedItem[]
	/** Accessible name for the feed region. */
	label: string
	/** Empty-state slot (lazy). */
	empty?: () => JSX.Element
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

/**
 * A live activity feed: glyph bubble + line + time per item, newest first
 * (the caller orders), scrolling inside its own container. New rows enter
 * with an @starting-style slide — no JS animation.
 */
export function ActivityFeed(props: ActivityFeedProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'items',
		'label',
		'empty',
		'colorBase',
		'colorLevel',
		'variant',
		'gap',
		'glyphSize',
		'maxHeight',
	)
	const rootValues = () => ({
		gap: props.gap,
		glyphSize: props.glyphSize,
		maxHeight: props.maxHeight,
	})
	// Hoisted reads (Solid 2 STRICT): Show's lazy children/fallback thunks are
	// not tracking scopes — the item-count and empty-slot reads live in memos.
	const hasItems = createMemo(() => props.items.length > 0)
	const emptySlot = createMemo(() => props.empty ?? null)
	return (
		<Show when={hasItems()} fallback={<>{emptySlot()?.()}</>}>
			<ul
				{...attributes}
				{...colorTreatmentData(props)}
				{...knobs.attributes(rootValues())}
				class={['ui-activity-feed', props.class]}
				style={mergeKnobStyle(knobs.style(rootValues()), props.style)}
				aria-label={props.label}
			>
				<For each={props.items}>
					{(item) => (
						<li class="ui-activity-feed-item">
							<span
								class="ui-activity-feed-glyph"
								aria-hidden="true"
								style={item.ink ? { '--_ui-feed-item-ink': item.ink } : undefined}
							>
								{item.glyph}
							</span>
							<div class="ui-activity-feed-body">
								<p class="ui-activity-feed-line">{slot(item.line)}</p>
								<Show when={item.time}>
									<span class="ui-activity-feed-time">{item.time}</span>
								</Show>
							</div>
						</li>
					)}
				</For>
			</ul>
		</Show>
	)
}

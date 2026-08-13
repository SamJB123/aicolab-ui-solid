/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { createMemo, For, omit, Show } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** One step in a Breadcrumb trail. `href` renders a link, `onSelect` a
 *  button; with neither the crumb is inert text. The FINAL item is always
 *  rendered as the current location (`aria-current="page"`, non-interactive)
 *  regardless of handlers — a breadcrumb never links to where you already
 *  are. */
export interface BreadcrumbItem {
	label: string
	href?: string
	onSelect?: () => void
}

/** Per-instance styling contract (see shared/knobs.ts). The separator
 * CHARACTER is an always-emitted STRING custom property (mandatory wire):
 * the ::before that renders it sits on each <li>, and attr() reads only the
 * matched element's own attributes, so the value must arrive by
 * inheritance — which attributes can't do and variables can. */
const knobs = defineKnobs('ui-breadcrumb', {
	fontSize: '<length>',
	gap: '<length>',
	separatorInk: '<color>',
	linkInk: '<color>',
	focusRing: '<color>',
})

type BreadcrumbProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'class'> & {
	class?: ClassProp
	items: readonly BreadcrumbItem[]
	/** Accessible name for the nav landmark. Default "Breadcrumb". */
	label?: string
	/** Separator character between steps. Default "›". */
	separator?: string
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

/**
 * Wayfinding trail for nested locations (`<nav>` + `<ol>` semantics, chevron
 * separators from CSS). Ancestors are quiet until hovered/focused; the
 * current location carries the text ink. Apps that need a dismiss affordance
 * put it BESIDE the nav — the trail itself is pure location.
 */
export function Breadcrumb(props: BreadcrumbProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'items',
		'label',
		'separator',
		'colorBase',
		'colorLevel',
		'variant',
		'fontSize',
		'gap',
		'separatorInk',
		'linkInk',
		'focusRing',
	)
	const last = createMemo(() => props.items.length - 1)
	return (
		<nav
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			class={['ui-breadcrumb', props.class]}
			style={mergeKnobStyle(
				{
					...knobs.style(props),
					'--ui-breadcrumb-separator': `"${(props.separator ?? '›').replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`,
				},
				props.style,
			)}
			aria-label={props.label ?? 'Breadcrumb'}
		>
			<ol class="ui-breadcrumb-trail">
				<For each={props.items}>
					{(item, index) => (
						<li class="ui-breadcrumb-step">
							<Show
								when={index() < last() && (item.href || item.onSelect)}
								fallback={
									<span
										class="ui-breadcrumb-here"
										aria-current={index() === last() ? 'page' : undefined}
									>
										{item.label}
									</span>
								}
							>
								<Show
									when={item.href}
									fallback={
										<button
											type="button"
											class="ui-breadcrumb-link"
											onClick={() => item.onSelect?.()}
										>
											{item.label}
										</button>
									}
								>
									<a class="ui-breadcrumb-link" href={item.href}>
										{item.label}
									</a>
								</Show>
							</Show>
						</li>
					)}
				</For>
			</ol>
		</nav>
	)
}

/** @jsxImportSource @solidjs/web */
import { createMemo, For, Show } from 'solid-js'
import { colorTreatmentData, type ClassProp, type ColorTreatmentProps } from '../../shared/color-treatment'

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

/**
 * Wayfinding trail for nested locations (`<nav>` + `<ol>` semantics, chevron
 * separators from CSS). Ancestors are quiet until hovered/focused; the
 * current location carries the text ink. Apps that need a dismiss affordance
 * put it BESIDE the nav — the trail itself is pure location.
 */
export function Breadcrumb(props: {
	items: readonly BreadcrumbItem[]
	/** Accessible name for the nav landmark. Default "Breadcrumb". */
	label?: string
	class?: ClassProp
} & ColorTreatmentProps) {
	const last = createMemo(() => props.items.length - 1)
	return (
		<nav {...colorTreatmentData(props)} class={['ui-breadcrumb', props.class]} aria-label={props.label ?? 'Breadcrumb'}>
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

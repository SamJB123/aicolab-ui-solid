import type { JSX } from '@solidjs/web'
import { Show } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'
import { Eyebrow } from '../../atoms/eyebrow'

export function PageHero(props: {
	eyebrow?: string
	title: JSX.Element
	lede?: JSX.Element
	/** Render function (lazy slot) — hydration-safe, see Panel.action. */
	actions?: () => JSX.Element
	align?: 'center' | 'start'
	class?: ClassProp
}) {
	return (
		<div class={['ui-hero', props.class]} data-align={props.align ?? 'center'}>
			<Show when={props.eyebrow}>
				<Eyebrow class="ui-accent-ink">{props.eyebrow}</Eyebrow>
			</Show>
			<h1>{props.title}</h1>
			<Show when={props.lede}>
				<p class="ui-hero-lede">{props.lede}</p>
			</Show>
			<Show when={props.actions}>
				<div class="ui-hero-actions">{props.actions?.()}</div>
			</Show>
		</div>
	)
}

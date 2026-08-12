import type { JSX } from '@solidjs/web'
import { Show } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'
import { Eyebrow } from '../../atoms/eyebrow'

export function Section(props: {
	id?: string
	eyebrow?: string
	title?: JSX.Element
	lede?: JSX.Element
	wide?: boolean
	center?: boolean
	class?: ClassProp
	children?: JSX.Element
}) {
	return (
		<section
			id={props.id}
			class={['ui-section', props.class]}
			data-wide={props.wide ? '' : undefined}
		>
			<Show when={props.eyebrow || props.title || props.lede}>
				<header class="ui-section-head" data-center={props.center ? '' : undefined}>
					<Show when={props.eyebrow}>
						<Eyebrow colorBase="primary">{props.eyebrow}</Eyebrow>
					</Show>
					<Show when={props.title}>
						<h2>{props.title}</h2>
					</Show>
					<Show when={props.lede}>
						<p class="ui-section-lede">{props.lede}</p>
					</Show>
				</header>
			</Show>
			{props.children}
		</section>
	)
}

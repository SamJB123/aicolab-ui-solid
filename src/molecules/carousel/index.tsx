import { type ParentProps } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'

export function Carousel(props: ParentProps<{ class?: ClassProp; label?: string }>) {
	return (
		<section class={['ui-carousel', props.class]} aria-label={props.label ?? 'carousel'}>
			{props.children}
		</section>
	)
}

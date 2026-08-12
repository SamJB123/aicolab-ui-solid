/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import type { ClassProp } from '../../shared/color-treatment'

/** Content remains in the accessibility tree without occupying visual layout. */
export function VisuallyHidden(props: { class?: ClassProp; children?: JSX.Element }) {
	return <span class={['ui-visually-hidden', props.class]}>{props.children}</span>
}

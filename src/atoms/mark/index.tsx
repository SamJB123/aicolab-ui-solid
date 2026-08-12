import { type ParentProps } from 'solid-js'

export function Mark(props: ParentProps<{ tone?: 'underline' | 'highlight' }>) {
	const tone = () => props.tone ?? 'underline'
	return (
		<mark
			class={{
				'ui-mark': true,
				'ui-mark-underline': tone() === 'underline',
				'ui-mark-highlight': tone() === 'highlight',
			}}
		>
			{props.children}
		</mark>
	)
}

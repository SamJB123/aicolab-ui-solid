/** @jsxImportSource @solidjs/web */
import { For } from 'solid-js'
import { Button } from '../../atoms/button'
import type { ClassProp } from '../../shared/color-treatment'

export type ToggleOption<T extends string> = { id: T; label: string; disabled?: boolean }

/** An exclusive set of command modes. Unlike Segmented, these are pressed
 * buttons rather than tabs controlling document panels. */
export function ToggleGroup<T extends string>(props: {
	label: string
	options: readonly ToggleOption<T>[]
	value: T
	onChange: (value: T) => void
	class?: ClassProp
}) {
	return (
		<div class={['ui-toggle-group', props.class]} role="group" aria-label={props.label}>
			<For each={props.options}>
				{(option) => (
					<Button
						variant="soft"
						pressed={props.value === option.id}
						disabled={option.disabled}
						onClick={() => props.onChange(option.id)}
					>
						{option.label}
					</Button>
				)}
			</For>
		</div>
	)
}

/** @jsxImportSource @solidjs/web */
import { createMemo, For, Show } from 'solid-js'
import { Avatar } from '../../atoms/avatar'
import { colorTreatmentData, type ColorTreatmentProps } from '../../shared/color-treatment'

export function AvatarStack(props: {
	people: { name: string; color: string }[]
	max?: number
	size?: number
	ring?: string
} & ColorTreatmentProps) {
	const max = () => props.max ?? 5
	const size = () => props.size ?? 32
	/* Initials occupy roughly the central two-thirds of the face. Keep the
	 * overlap inside the outer eighth so the stack remains legible at every
	 * supported size, with a 2px minimum that still reads as an overlap. */
	const overlap = () => Math.max(2, Math.round(size() * 0.125))
	const shown = createMemo(() => props.people.slice(0, max()))
	const extra = createMemo(() => props.people.length - shown().length)
	return (
		<div {...colorTreatmentData(props)} class="ui-avatar-stack">
			<For each={shown()}>
				{(p, i) => (
					<span
						class="ui-avatar-stack-item"
						style={{
							'margin-left': i() === 0 ? '0' : `-${overlap()}px`,
							'box-shadow': props.colorBase
								? '0 0 0 2px var(--ui-surface-raised)'
								: `0 0 0 2px ${props.ring ?? 'var(--color-base-200)'}`,
							'z-index': String(shown().length - i()),
						}}
					>
						<Avatar
							name={p.name}
							faceColor={props.colorBase ? 'var(--ui-ink)' : p.color}
							size={size()}
							ring={props.colorBase ? 'var(--ui-surface-occluding)' : (props.ring ?? 'var(--color-base-200)')}
							colorBase={props.colorBase}
							colorLevel={props.colorLevel}
							variant={props.variant}
						/>
					</span>
				)}
			</For>
			<Show when={extra() > 0}>
				<span
					class="ui-avatar-stack-extra"
					style={{
						'margin-left': `-${overlap()}px`,
						width: `${size()}px`,
						height: `${size()}px`,
						'box-shadow': props.colorBase
							? '0 0 0 2px var(--ui-surface-raised), inset 0 0 0 1px var(--ui-border)'
							: `0 0 0 2px ${props.ring ?? 'var(--color-base-200)'}, inset 0 0 0 1px var(--color-border)`,
					}}
				>
					+{extra()}
				</span>
			</Show>
		</div>
	)
}

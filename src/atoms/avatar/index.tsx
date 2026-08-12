/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { Show } from 'solid-js'
import { StatusDot, type StatusVisual } from '../status-dot'
import { colorTreatmentData, type ColorTreatmentProps } from '../../shared/color-treatment'

const initials = (name: string) =>
	name
		.split(' ')
		.map((w) => w[0])
		.slice(0, 2)
		.join('')
		.toUpperCase()

export function Avatar(props: {
	name: string
	faceColor?: string
	image?: string | null
	referrerPolicy?: JSX.ImgHTMLAttributes<HTMLImageElement>['referrerpolicy']
	size?: number
	status?: StatusVisual
	ring?: string
} & ColorTreatmentProps) {
	const size = () => props.size ?? 36
	const color = () => props.colorBase ? 'var(--ui-ink)' : (props.faceColor ?? 'var(--color-primary)')
	const surface = () => props.colorBase ? 'var(--ui-surface-occluding)' : (props.ring ?? 'var(--color-base-100)')
	return (
		<span {...colorTreatmentData(props)} class="ui-avatar" style={{ width: `${size()}px`, height: `${size()}px` }}>
			<span
				class="ui-avatar-face"
				style={{
					'font-size': `${Math.round(size() * 0.34)}px`,
					color: color(),
					background: props.colorBase ? surface() : `color-mix(in oklab, ${color()} 20%, ${surface()})`,
					'box-shadow': props.colorBase
						? 'inset 0 0 0 1px var(--ui-border)'
						: `inset 0 0 0 1px color-mix(in oklab, ${color()} 55%, transparent)`,
				}}
			>
				<Show when={props.image} fallback={initials(props.name)}>
					{(source) => (
						<img
							class="ui-avatar-image"
							src={source()}
							alt=""
							referrerpolicy={props.referrerPolicy}
						/>
					)}
				</Show>
			</span>
			<Show when={props.status}>
				{(s) => (
					<span class="ui-avatar-badge" style={{ background: props.colorBase ? 'var(--ui-surface-raised)' : (props.ring ?? 'var(--color-base-100)') }}>
						<StatusDot status={s()} size={Math.max(7, Math.round(size() * 0.2))} />
					</span>
				)}
			</Show>
		</span>
	)
}

/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { createSignal, For } from 'solid-js'
import type { ColorFamily, ColorLevel, ColorVariant } from '../../src/primitives'

export const COLOR_FAMILIES = [
	'primary',
	'secondary',
	'accent',
	'neutral',
	'info',
	'success',
	'warning',
	'error',
] as const satisfies readonly ColorFamily[]

export const COLOR_LEVELS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const satisfies readonly ColorLevel[]

export const COLOR_VARIANTS = ['solid', 'soft', 'outline', 'ghost', 'text'] as const satisfies readonly ColorVariant[]

export type ColorAxesContext = {
	color: ColorFamily
	level: ColorLevel
	variant: ColorVariant
	/** The generated family × level colour, suitable for primitives exposing a
	 * direct `color` prop. */
	resolvedColor: string
	/** The surface behind the specimen after applying the usage axis. */
	surfaceColor: string
}

/** Shared interactive specimen matrix. The level rail changes one independent
 * axis while the grid keeps every family × usage combination visible. */
export function ColorAxesStory(props: {
	render: (context: ColorAxesContext) => JSX.Element
}) {
	const [level, setLevel] = createSignal<ColorLevel>(500)

	return (
		<div style={{ display: 'grid', gap: '18px', color: 'var(--color-base-content)' }}>
			<div style={{ display: 'flex', gap: '6px', 'align-items': 'center', 'flex-wrap': 'wrap' }}>
				<strong style={{ 'font-size': 'var(--t-xs)', 'margin-inline-end': '4px' }}>Level</strong>
				<For each={COLOR_LEVELS}>
					{(step) => (
						<button
							type="button"
							onClick={() => setLevel(step)}
							aria-pressed={level() === step}
							style={{
								border: '0',
								'border-radius': 'var(--r-pill)',
								padding: '5px 9px',
								background: level() === step ? 'var(--color-primary)' : 'var(--color-base-150)',
								color: level() === step ? 'var(--color-primary-content)' : 'var(--color-base-content-muted)',
								cursor: 'pointer',
								'font-size': 'var(--t-xs)',
							}}
						>
							{step}
						</button>
					)}
				</For>
			</div>

			<div style={{ overflow: 'auto', 'padding-block-end': '4px' }}>
				<div
					style={{
						display: 'grid',
						'grid-template-columns': '70px repeat(8, minmax(150px, 1fr))',
						gap: '8px',
						'min-width': '1320px',
						'align-items': 'stretch',
					}}
				>
					<span />
					<For each={COLOR_FAMILIES}>
						{(family) => <strong style={{ 'font-size': 'var(--t-xs)', padding: '0 4px' }}>{family}</strong>}
					</For>
					<For each={COLOR_VARIANTS}>
						{(variant) => (
							<>
								<strong style={{ 'font-size': 'var(--t-xs)', padding: '12px 4px' }}>{variant}</strong>
								<For each={COLOR_FAMILIES}>
									{(color) => (
										<div style={{ 'min-block-size': '76px', display: 'grid', 'place-items': 'center', padding: '8px' }}>
											{props.render({
												color,
												level: level(),
												variant,
												resolvedColor: 'var(--ui-resolved-color)',
												surfaceColor: 'var(--ui-primitive-surface)',
											})}
										</div>
									)}
								</For>
							</>
						)}
					</For>
				</div>
			</div>
		</div>
	)
}

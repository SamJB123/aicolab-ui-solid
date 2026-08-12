/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { createSignal, For } from 'solid-js'
import type { Appearance, ColorLevel, ColorBase } from '../../src/primitives'

export const COLOR_ROLES = [
	'primary',
	'secondary',
	'accent',
	'neutral',
	'info',
	'success',
	'warning',
	'error',
] as const satisfies readonly ColorBase[]

export const COLOR_LEVELS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const satisfies readonly ColorLevel[]

export const APPEARANCES = ['solid', 'soft', 'outline', 'ghost', 'text'] as const satisfies readonly Appearance[]

export type ColorTreatmentContext = {
	colorBase: ColorBase
	colorLevel: ColorLevel
	appearance: Appearance
	/** Canonical presentation mark for the selected base × level. */
	markColor: string
	/** Canonical appearance-resolved surface behind the specimen. */
	surfaceColor: string
}

/** Shared interactive specimen matrix. The level rail changes one independent
 * axis while the grid keeps every colour-base × appearance combination visible. */
export function ColorTreatmentStory(props: {
	render: (context: ColorTreatmentContext) => JSX.Element
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
							aria-pressed={level() === step ? 'true' : 'false'}
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
					<For each={COLOR_ROLES}>
						{(role) => <strong style={{ 'font-size': 'var(--t-xs)', padding: '0 4px' }}>{role}</strong>}
					</For>
					<For each={APPEARANCES}>
						{(appearance) => (
							<>
								<strong style={{ 'font-size': 'var(--t-xs)', padding: '12px 4px' }}>{appearance}</strong>
								<For each={COLOR_ROLES}>
									{(colorBase) => (
										<div style={{ 'min-block-size': '76px', display: 'grid', 'place-items': 'center', padding: '8px' }}>
											{props.render({
												colorBase,
												colorLevel: level(),
												appearance,
												markColor: 'var(--ui-mark)',
												surfaceColor: 'var(--ui-surface)',
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

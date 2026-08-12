import type { JSX } from '@solidjs/web'
import { For, Show } from 'solid-js'

export type Step = {
	title: string
	body: JSX.Element
	bullets?: string[]
	/** Lazy slot (invoked in Steps' scope — a pre-created element from the
	 *  caller's scope would desync hydration keys under <For>). Size the glyph
	 *  yourself (~48 for lg, ~28 for md, ~16 for sm nodes). Falls back to the
	 *  step number. */
	icon?: () => JSX.Element
	/** Per-step hue for the title + node. Defaults to the house accent. */
	accent?: string
}

export type StepNodeSize = 'sm' | 'md' | 'lg'

const NODE_SIZE: Record<StepNodeSize, string> = { sm: '2.75rem', md: '5rem', lg: '10rem' }

function StepNode(props: { step: Step; index: number; size: StepNodeSize }) {
	const accent = () => props.step.accent ?? 'var(--c-accent)'
	return (
		<div
			class="ui-step-disc"
			style={{ 'max-width': NODE_SIZE[props.size], '--step-accent': accent() }}
		>
			<Show when={props.size !== 'sm'}>
				<span class="ui-step-wash" aria-hidden="true" />
				<span class="ui-step-shimmer" aria-hidden="true" />
			</Show>
			<div class="ui-step-num" data-size={props.size} style={{ color: accent() }}>
				{props.step.icon ? props.step.icon() : props.index + 1}
			</div>
		</div>
	)
}

function StepText(props: { step: Step }) {
	return (
		<div class="ui-step-text">
			<h3 style={{ color: props.step.accent ?? 'var(--c-text)' }}>{props.step.title}</h3>
			<div class="ui-step-body">{props.step.body}</div>
			<Show when={props.step.bullets?.length}>
				<ul class="ui-step-bullets">
					<For each={props.step.bullets}>{(b) => <li>{b}</li>}</For>
				</ul>
			</Show>
		</div>
	)
}

export function Steps(props: {
	steps: Step[]
	/** 'zigzag' (default): central spine, alternating sides. 'rail': left rail. */
	variant?: 'zigzag' | 'rail'
	/** Node size; defaults to 'lg' for zigzag, 'sm' for rail. */
	node?: StepNodeSize
}) {
	const variant = () => props.variant ?? 'zigzag'
	const size = () => props.node ?? (variant() === 'zigzag' ? 'lg' : 'sm')
	return (
		<Show
			when={variant() === 'zigzag'}
			fallback={
				<ol class="ui-steps" data-variant="rail">
					<span
						class="ui-steps-line"
						style={{
							left: `calc(${NODE_SIZE[size()]} / 2)`,
							top: `calc(${NODE_SIZE[size()]} / 2)`,
							bottom: `calc(${NODE_SIZE[size()]} / 2)`,
						}}
						aria-hidden="true"
					/>
					<For each={props.steps}>
						{(step, i) => (
							<li
								class="ui-step ui-reveal"
								style={{ 'padding-left': `calc(${NODE_SIZE[size()]} + 1.25rem)` }}
							>
								<div class="ui-step-node-anchor" style={{ width: NODE_SIZE[size()] }}>
									<StepNode step={step} index={i()} size={size()} />
								</div>
								<StepText step={step} />
							</li>
						)}
					</For>
				</ol>
			}
		>
			<ol class="ui-steps" data-variant="zigzag">
				<span class="ui-steps-line" style={{ top: '2rem', bottom: '2rem' }} aria-hidden="true" />
				<For each={props.steps}>
					{(step, i) => {
						const flip = () => i() % 2 === 1
						return (
							<li class="ui-step ui-reveal" data-flip={flip() ? '' : undefined}>
								<Show when={!flip()}>
									<StepText step={step} />
								</Show>
								<div class="ui-step-node-cell">
									<StepNode step={step} index={i()} size={size()} />
								</div>
								<Show when={flip()}>
									<StepText step={step} />
								</Show>
							</li>
						)
					}}
				</For>
			</ol>
		</Show>
	)
}

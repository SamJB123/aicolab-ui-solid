/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { For, Show } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps, type UiColor } from '../../shared/knobs'

export type Step = {
	title: string
	body: JSX.Element
	bullets?: string[]
	/** Lazy slot (invoked in Steps' scope — a pre-created element from the
	 *  caller's scope would desync hydration keys under <For>). Size the glyph
	 *  yourself (~48 for lg, ~28 for md, ~16 for sm nodes). Falls back to the
	 *  step number. */
	icon?: () => JSX.Element
	/** Per-step hue for the title + node; defaults to the Steps-level accent
	 *  knob, then the house accent (family colour when treated). */
	accent?: UiColor
}

export type StepNodeSize = 'sm' | 'md' | 'lg'

/** Per-instance styling contract (see shared/knobs.ts). `accent` doubles as
 * the Steps-level default for per-step accents (inheriting public variable;
 * a step's own accent wins on its row). All node geometry derives in CSS
 * from the node-size adapter — the sm/md/lg mode attribute re-defaults it,
 * an explicit nodeSize knob outranks the mode. */
const knobs = defineKnobs('ui-step', {
	nodeSize: '<length>',
	gap: '<length>',
	lineInk: '<color>',
	accent: '<color>',
})

function StepNode(props: { step: Step; index: number; size: StepNodeSize }) {
	return (
		<div class="ui-step-disc">
			<Show when={props.size !== 'sm'}>
				<span class="ui-step-wash" aria-hidden="true" />
				<span class="ui-step-shimmer" aria-hidden="true" />
			</Show>
			<div class="ui-step-num" data-size={props.size}>
				{props.step.icon ? props.step.icon() : props.index + 1}
			</div>
		</div>
	)
}

function StepText(props: { step: Step }) {
	return (
		<div class="ui-step-text">
			<h3>{props.step.title}</h3>
			<div class="ui-step-body">{props.step.body}</div>
			<Show when={props.step.bullets?.length}>
				<ul class="ui-step-bullets">
					<For each={props.step.bullets}>{(b) => <li>{b}</li>}</For>
				</ul>
			</Show>
		</div>
	)
}

export function Steps(
	props: {
		steps: Step[]
		/** 'zigzag' (default): central spine, alternating sides. 'rail': left rail. */
		variant?: 'zigzag' | 'rail'
		/** Node size; defaults to 'lg' for zigzag, 'sm' for rail. */
		node?: StepNodeSize
		class?: ClassProp
	} /* `variant` here is the LAYOUT; the treatment's variant axis is omitted —
	     Steps' treatment is pure accent retargeting (line + discs). */ &
		Omit<ColorTreatmentProps, 'variant'> &
		KnobProps<typeof knobs.spec>,
) {
	const layout = () => props.variant ?? 'zigzag'
	const size = () => props.node ?? (layout() === 'zigzag' ? 'lg' : 'sm')
	const stepWires = (step: Step) => ({
		...knobs.attributes({ accent: step.accent }),
		style: knobs.style({ accent: step.accent }),
	})
	const rootWires = () => ({
		...colorTreatmentData({ colorBase: props.colorBase, colorLevel: props.colorLevel }),
		...knobs.attributes(props),
		style: mergeKnobStyle(knobs.style(props), undefined),
	})
	return (
		<Show
			when={layout() === 'zigzag'}
			fallback={
				<ol
					class={['ui-steps', props.class]}
					data-variant="rail"
					data-ui-steps-node={size()}
					{...rootWires()}
				>
					<span class="ui-steps-line" aria-hidden="true" />
					<For each={props.steps}>
						{(step, i) => (
							<li class="ui-step ui-reveal" {...stepWires(step)}>
								<div class="ui-step-node-anchor">
									<StepNode step={step} index={i()} size={size()} />
								</div>
								<StepText step={step} />
							</li>
						)}
					</For>
				</ol>
			}
		>
			<ol
				class={['ui-steps', props.class]}
				data-variant="zigzag"
				data-ui-steps-node={size()}
				{...rootWires()}
			>
				<span class="ui-steps-line" aria-hidden="true" />
				<For each={props.steps}>
					{(step, i) => {
						const flip = () => i() % 2 === 1
						return (
							<li class="ui-step ui-reveal" data-flip={flip() ? '' : undefined} {...stepWires(step)}>
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

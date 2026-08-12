import type { JSX } from '@solidjs/web'
import { For, Show } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'

export type Feature = {
	title: string
	body: JSX.Element
	icon?: JSX.Element
	accent?: string
}

/** Responsive card grid for feature/value/pillar sets. */
export function FeatureGrid(props: { items: Feature[]; columns?: 2 | 3; class?: ClassProp }) {
	return (
		<div
			class={['ui-feature-grid', props.class]}
			data-columns={String(props.columns ?? 3)}
		>
			<For each={props.items}>
				{(item) => (
					<article class="ui-feature-card ui-reveal">
						<Show when={item.icon}>
							<span
								class="ui-feature-icon"
								style={{
									background: `color-mix(in oklab, ${item.accent ?? 'var(--color-primary)'} 12%, transparent)`,
									color: item.accent ?? 'var(--color-primary)',
								}}
							>
								{item.icon}
							</span>
						</Show>
						<h3>{item.title}</h3>
						<div class="ui-feature-body">{item.body}</div>
					</article>
				)}
			</For>
		</div>
	)
}

import { For, Show } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'

export type LogoItem = { name: string; src?: string }

export function LogoCloud(props: { logos: LogoItem[]; class?: ClassProp }) {
	return (
		<ul class={['ui-logo-cloud', props.class]}>
			<For each={props.logos}>
				{(logo) => (
					<li class="ui-logo-item">
						<Show when={logo.src} fallback={<span class="ui-logo-name">{logo.name}</span>}>
							<img src={logo.src} alt={logo.name} loading="lazy" />
						</Show>
					</li>
				)}
			</For>
		</ul>
	)
}

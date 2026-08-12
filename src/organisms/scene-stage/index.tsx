/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { createEffect, createSignal, onSettled, Show } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'

export interface SceneStageMountContext<Command, Events> {
	canvas: HTMLCanvasElement
	host: HTMLDivElement
	command: Command | undefined
	events: Events
	onReady: () => void
	onError: (message: string) => void
}

export interface SceneStageController<Command> {
	updateCommand: (command: Command) => void
	dispose: () => void
}

/** Renderer-neutral bridge between reactive UI and an imperative visual
 * engine. The adapter owns rendering; SceneStage owns its canvas lifecycle,
 * accessible picture contract, status presentation and command delivery. */
export interface SceneStageAdapter<Command, Events> {
	mount: (context: SceneStageMountContext<Command, Events>) => SceneStageController<Command>
}

export function SceneStage<Command, Events>(props: {
	adapter: SceneStageAdapter<Command, Events>
	command?: Command
	events: Events
	label: string
	loadingLabel?: JSX.Element
	errorLabel?: (message: string) => JSX.Element
	class?: ClassProp
	canvasClass?: ClassProp
	children?: JSX.Element
}) {
	let canvas: HTMLCanvasElement | undefined
	let host: HTMLDivElement | undefined
	let controller: SceneStageController<Command> | undefined
	const [ready, setReady] = createSignal(false)
	const [error, setError] = createSignal<string | null>(null)

	createEffect(
		() => props.command,
		(command) => {
			if (command !== undefined) controller?.updateCommand(command)
		},
	)

	onSettled(() => {
		if (!canvas || !host) return
		controller = props.adapter.mount({
			canvas,
			host,
			command: props.command,
			events: props.events,
			onReady: () => setReady(true),
			onError: (message) => setError(message),
		})
		return () => {
			controller?.dispose()
			controller = undefined
		}
	})

	return (
		<div
			ref={(element) => {
				host = element
			}}
			class={['ui-scene-stage', props.class]}
			data-ready={ready() ? '' : undefined}
			data-error={error() ? '' : undefined}
		>
			<canvas
				ref={(element) => {
					canvas = element
				}}
				class={['ui-scene-stage-canvas', props.canvasClass]}
				role="img"
				aria-label={props.label}
			/>
			<Show when={!ready() && !error()}>
				<div class="ui-scene-stage-loading" role="status">
					{props.loadingLabel ?? 'Preparing scene…'}
				</div>
			</Show>
			<Show when={error()}>
				{(message) => (
					<div class="ui-scene-stage-error" role="alert">
						{props.errorLabel?.(message()) ?? message()}
					</div>
				)}
			</Show>
			{props.children}
		</div>
	)
}

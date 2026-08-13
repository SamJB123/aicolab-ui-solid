/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { createEffect, createSignal, onSettled, Show } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). SceneStage paints
 * no family surface (its picture IS the renderer's output; the error box
 * is semantically the error family already), so it carries knobs without
 * the treatment axes — the same exemption class as presence. */
const knobs = defineKnobs('ui-scene', {
	surface: '<color>',
	statusInk: '<color>',
})

export interface SceneStageMountContext<Events, Configuration> {
	canvas: HTMLCanvasElement
	host: HTMLDivElement
	configuration: Configuration
	/** Read callbacks at event time so replacements remain live without
	 * rebuilding the renderer. */
	events: () => Events
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
export interface SceneStageAdapter<Command, Events, Configuration = undefined> {
	mount: (context: SceneStageMountContext<Events, Configuration>) => SceneStageController<Command>
}

export function SceneStage<Command, Events, Configuration = undefined>(props: {
	adapter: SceneStageAdapter<Command, Events, Configuration>
	command?: Command
	events: Events
	/** Renderer construction inputs. Changing this value deliberately disposes
	 * and remounts the renderer; live commands and callbacks do not. */
	configuration: Configuration
	label: string
	loadingLabel?: JSX.Element
	errorLabel?: (message: string) => JSX.Element
	class?: ClassProp
	canvasClass?: ClassProp
	children?: JSX.Element
} & KnobProps<typeof knobs.spec>) {
	let canvas: HTMLCanvasElement | undefined
	let host: HTMLDivElement | undefined
	const [settled, setSettled] = createSignal(false)
	const [controller, setController] = createSignal<SceneStageController<Command> | undefined>()
	const [ready, setReady] = createSignal(false)
	const [error, setError] = createSignal<string | null>(null)

	onSettled(() => {
		setSettled(true)
	})

	createEffect(
		() =>
			settled() && canvas && host
				? {
						adapter: props.adapter,
						configuration: props.configuration,
						canvas,
						host,
					}
				: undefined,
		(mount) => {
			if (!mount) return
			setReady(false)
			setError(null)
			const nextController = mount.adapter.mount({
				canvas: mount.canvas,
				host: mount.host,
				configuration: mount.configuration,
				events: () => props.events,
				onReady: () => setReady(true),
				onError: (message) => setError(message),
			})
			setController(nextController)
			return () => {
				nextController.dispose()
				setController(undefined)
			}
		},
	)

	createEffect(
		() => ({ controller: controller(), command: props.command }),
		({ controller: activeController, command }) => {
			if (command !== undefined) activeController?.updateCommand(command)
		},
	)

	return (
		<div
			ref={(element) => {
				host = element
			}}
			class={['ui-scene-stage', props.class]}
			data-ready={ready() ? '' : undefined}
			data-error={error() ? '' : undefined}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), undefined)}
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

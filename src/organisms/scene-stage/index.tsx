/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { createEffect, createMemo, createSignal, onSettled, Show } from 'solid-js'
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
	/** A canvas of this mount's own: every mount is handed a new one, as a
	 * canvas holds one kind of graphics context for life and a disposed
	 * WebGL renderer loses its context for good. */
	canvas: HTMLCanvasElement
	host: HTMLDivElement
	configuration: Configuration
	/** Read callbacks at event time so replacements remain live without
	 * rebuilding the renderer. */
	events: () => Events
	onReady: () => void
	onError: (message: string) => void
	/** Put a new canvas in this one's place and resolve with it — for an
	 * engine that rebuilds its renderer on a context the old canvas cannot
	 * hold (a lost graphics device, a WebGPU canvas becoming WebGL). The old
	 * canvas leaves the page. */
	freshCanvas: () => Promise<HTMLCanvasElement>
}

export interface SceneStageController<Command> {
	updateCommand: (command: Command) => void
	dispose: () => void
}

/** One mount of the engine, on a canvas of its own: the canvas is made with
 * the mount and leaves with it, so no engine inherits a context another
 * left behind. `freshCanvas` puts a new canvas in the current one's place
 * for the same mount (a renderer rebuilt on another kind of context). */
function StageMount<Command, Events, Configuration>(props: {
	mount: { adapter: SceneStageAdapter<Command, Events, Configuration>; configuration: Configuration }
	host: HTMLDivElement | undefined
	label: string
	canvasClass?: ClassProp
	events: () => Events
	onMounting: () => void
	onReady: () => void
	onError: (message: string) => void
	onController: (controller: SceneStageController<Command> | undefined) => void
}) {
	const [generation, setGeneration] = createSignal(0)
	let canvas: HTMLCanvasElement | undefined
	let awaiting: ((canvas: HTMLCanvasElement) => void) | null = null
	const freshCanvas = (): Promise<HTMLCanvasElement> =>
		new Promise((resolve) => {
			awaiting = resolve
			setGeneration((n) => n + 1)
		})
	onSettled(() => {
		const host = props.host
		if (!canvas || !host) return
		props.onMounting()
		const controller = props.mount.adapter.mount({
			canvas,
			host,
			configuration: props.mount.configuration,
			events: props.events,
			onReady: props.onReady,
			onError: props.onError,
			freshCanvas,
		})
		props.onController(controller)
		return () => {
			controller.dispose()
			props.onController(undefined)
		}
	})
	return (
		<Show when={generation() + 1} keyed>
			{(_generation) => (
				<canvas
					ref={(element) => {
						canvas = element
						const resolve = awaiting
						awaiting = null
						resolve?.(element)
					}}
					class={['ui-scene-stage-canvas', props.canvasClass]}
					role="img"
					aria-label={props.label}
				/>
			)}
		</Show>
	)
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
	let host: HTMLDivElement | undefined
	const [settled, setSettled] = createSignal(false)
	const [controller, setController] = createSignal<SceneStageController<Command> | undefined>()
	const [ready, setReady] = createSignal(false)
	const [error, setError] = createSignal<string | null>(null)

	onSettled(() => {
		setSettled(true)
	})

	// What a mount is made of. A change of either disposes the mounted
	// engine and mounts a new one — on a canvas of its own (StageMount).
	const mount = createMemo(() =>
		settled() ? { adapter: props.adapter, configuration: props.configuration } : undefined,
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
			<Show when={mount()} keyed>
				{(current) => (
					<StageMount
						mount={current}
						host={host}
						label={props.label}
						canvasClass={props.canvasClass}
						events={() => props.events}
						onMounting={() => {
							setReady(false)
							setError(null)
						}}
						onReady={() => setReady(true)}
						onError={(message) => setError(message)}
						onController={setController}
					/>
				)}
			</Show>
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

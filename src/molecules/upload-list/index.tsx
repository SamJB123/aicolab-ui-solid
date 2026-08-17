/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { For, omit, Show } from 'solid-js'
import { IconButton } from '../../atoms/icon-button'
import { Meter } from '../../atoms/meter'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

export type UploadListStatus = 'uploading' | 'done' | 'error'

export interface UploadListItem {
	/** Stable identity across progress updates. */
	key: string
	name: string
	/** 0..1. Meaningful while `status` is 'uploading'. */
	progress: number
	status: UploadListStatus
	/** Secondary line (e.g. "12.4 MB · 3.1 MB/s"). */
	detail?: string
	/** Error text when status is 'error'. */
	error?: string
}

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-uploads', {
	gap: '<length>',
	radius: '<length-percentage>',
	pad: '<length>',
})

type UploadListProps = Omit<JSX.HTMLAttributes<HTMLUListElement>, 'class'> & {
	class?: ClassProp
	/** Accessible name for the list. */
	label: string
	items: UploadListItem[]
	/** Cancel an in-flight upload (row shows ✕ while uploading). */
	onCancel?: (key: string) => void
	/** Dismiss a finished/failed row. */
	onDismiss?: (key: string) => void
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

/**
 * The upload queue: one row per transfer with name, live Meter, and a
 * cancel/dismiss action. Controlled — the caller owns the items array and
 * mutates it from its transfer loop.
 */
export function UploadList(props: UploadListProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'label',
		'items',
		'onCancel',
		'onDismiss',
		'colorBase',
		'colorLevel',
		'variant',
		'gap',
		'radius',
		'pad',
	)
	// The gap knob is consumed on the list root; radius/pad are consumed on
	// each ROW, so their wires land per row (the Meter fill-element pattern).
	const rootValues = () => ({ gap: props.gap })
	const rowValues = () => ({ radius: props.radius, pad: props.pad })
	return (
		<ul
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(rootValues())}
			aria-label={props.label}
			class={['ui-uploads', props.class]}
			style={mergeKnobStyle(knobs.style(rootValues()), props.style)}
		>
			<For each={props.items}>
				{(item) => (
					<li
						class="ui-uploads-row"
						data-status={item.status}
						{...knobs.attributes(rowValues())}
						style={mergeKnobStyle(knobs.style(rowValues()), false)}
					>
						<div class="ui-uploads-main">
							<span class="ui-uploads-name">{item.name}</span>
							<Show when={item.status === 'uploading'}>
								<Meter
									class="ui-uploads-meter"
									value={Math.round(item.progress * 100)}
									max={100}
								/>
							</Show>
							<Show when={item.status === 'error' && item.error}>
								<span class="ui-uploads-error" role="alert">
									{item.error}
								</span>
							</Show>
							<Show when={item.detail}>
								<span class="ui-uploads-detail">{item.detail}</span>
							</Show>
						</div>
						<span class="ui-uploads-state" aria-hidden="true">
							{item.status === 'done' ? '✓' : item.status === 'error' ? '!' : `${Math.round(item.progress * 100)}%`}
						</span>
						<Show when={item.status === 'uploading' ? props.onCancel : props.onDismiss}>
							{(act) => (
								<IconButton
									class="ui-uploads-action"
									label={item.status === 'uploading' ? `Cancel ${item.name}` : `Dismiss ${item.name}`}
									size="sm"
									variant="ghost"
									colorBase={item.status === 'error' ? 'error' : 'neutral'}
									onClick={() => act()(item.key)}
								>
									✕
								</IconButton>
							)}
						</Show>
					</li>
				)}
			</For>
		</ul>
	)
}

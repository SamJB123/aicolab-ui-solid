/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { createSignal, omit } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-dropzone', {
	radius: '<length-percentage>',
	pad: '<length>',
	minHeight: '<length>',
	border: '<color>',
	activeBorder: '<color>',
	activeSurface: '<color>',
})

type DropzoneProps = Omit<JSX.LabelHTMLAttributes<HTMLLabelElement>, 'class' | 'onDrop'> & {
	class?: ClassProp
	/** Selected or dropped files — one callback for both entry paths. */
	onFiles: (files: File[]) => void
	/** Native file-input accept filter (e.g. "image/*,.pdf"). */
	accept?: string
	/** Allow multiple files (default true). */
	multiple?: boolean
	disabled?: boolean
	/** Invitation content ("Drop files or browse…"). */
	children?: JSX.Element
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

/**
 * A drag-and-drop file target wrapped around a REAL `<input type="file">`
 * (click/keyboard open the native picker; the label is the drop surface).
 * Drag-over state rides `data-drag-over` for the stylesheet.
 */
export function Dropzone(props: DropzoneProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'onFiles',
		'accept',
		'multiple',
		'disabled',
		'colorBase',
		'colorLevel',
		'variant',
		'radius',
		'pad',
		'minHeight',
		'border',
		'activeBorder',
		'activeSurface',
	)
	const [dragOver, setDragOver] = createSignal(false)
	const emit = (list: FileList | null | undefined): void => {
		if (props.disabled) return
		const files = [...(list ?? [])]
		if (files.length > 0) props.onFiles(props.multiple === false ? files.slice(0, 1) : files)
	}
	return (
		<label
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			class={['ui-dropzone', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
			data-drag-over={dragOver() && !props.disabled ? '' : undefined}
			data-disabled={props.disabled ? '' : undefined}
			onDragOver={(event) => {
				event.preventDefault()
				setDragOver(true)
			}}
			onDragLeave={() => setDragOver(false)}
			onDrop={(event) => {
				event.preventDefault()
				setDragOver(false)
				emit(event.dataTransfer?.files)
			}}
		>
			<input
				type="file"
				class="ui-dropzone-input"
				accept={props.accept}
				multiple={props.multiple !== false}
				disabled={props.disabled}
				onChange={(event) => {
					emit(event.currentTarget.files)
					// Same file re-picked later must fire change again.
					event.currentTarget.value = ''
				}}
			/>
			<span class="ui-dropzone-content">{props.children}</span>
		</label>
	)
}

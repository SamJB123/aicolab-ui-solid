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

/** A file with the path it had inside a dropped/picked folder ('' when loose). */
export interface DropEntry {
	file: File
	relativePath: string
}

/** Walk a dropped directory tree (webkitGetAsEntry) into files with paths. */
async function readEntries(items: DataTransferItemList): Promise<DropEntry[]> {
	const out: DropEntry[] = []
	const walk = (entry: FileSystemEntry, prefix: string): Promise<void> =>
		new Promise((resolve) => {
			if (entry.isFile) {
				;(entry as FileSystemFileEntry).file((file) => {
					out.push({ file, relativePath: prefix ? `${prefix}/${file.name}` : '' })
					resolve()
				}, () => resolve())
				return
			}
			const reader = (entry as FileSystemDirectoryEntry).createReader()
			const path = prefix ? `${prefix}/${entry.name}` : entry.name
			const batch = (): void =>
				reader.readEntries(async (entries) => {
					if (!entries.length) {
						resolve()
						return
					}
					for (const child of entries) await walk(child, path)
					batch()
				}, () => resolve())
			batch()
		})
	const roots = [...items].map((item) => item.webkitGetAsEntry?.() ?? null)
	for (const root of roots) if (root) await walk(root, '')
	return out
}

type DropzoneProps = Omit<JSX.LabelHTMLAttributes<HTMLLabelElement>, 'class' | 'onDrop'> & {
	class?: ClassProp
	/** Selected or dropped files — one callback for both entry paths. */
	onFiles: (files: File[]) => void
	/** When set, dropped FOLDERS are walked and every file arrives with its
	 *  relative path (also from a `directory` picker via webkitRelativePath);
	 *  `onFiles` still receives the flat list. */
	onEntries?: (entries: DropEntry[]) => void
	/** The picker chooses a folder instead of files (webkitdirectory). */
	directory?: boolean
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
		'onEntries',
		'directory',
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
	const emit = (list: FileList | File[] | null | undefined, entries?: DropEntry[]): void => {
		if (props.disabled) return
		const files = [...(list ?? [])]
		if (files.length === 0) return
		const chosen = props.multiple === false ? files.slice(0, 1) : files
		props.onFiles(chosen)
		props.onEntries?.(
			entries?.slice(0, chosen.length) ??
				chosen.map((file) => ({
					file,
					relativePath: (file as File & { webkitRelativePath?: string }).webkitRelativePath || '',
				})),
		)
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
				const items = event.dataTransfer?.items
				const walkable = props.onEntries && items && [...items].some((item) => item.webkitGetAsEntry?.()?.isDirectory)
				if (walkable) {
					void readEntries(items).then((entries) => emit(entries.map((e) => e.file), entries))
					return
				}
				emit(event.dataTransfer?.files)
			}}
		>
			<input
				type="file"
				class="ui-dropzone-input"
				accept={props.accept}
				webkitdirectory={props.directory ? '' : undefined}
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

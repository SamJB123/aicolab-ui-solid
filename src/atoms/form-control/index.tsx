/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'

type InputProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'class'> & { class?: ClassProp }
type TextAreaProps = Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, 'class'> & { class?: ClassProp }

export function TextInput(props: InputProps) {
	const attributes = omit(props, 'class')
	return <input {...attributes} class={['ui-text-input', props.class]} />
}

export function NumberInput(props: Omit<InputProps, 'type'>) {
	const attributes = omit(props, 'class')
	return <input {...attributes} type="number" class={['ui-number-input', props.class]} />
}

export function RangeInput(props: Omit<InputProps, 'type'>) {
	const attributes = omit(props, 'class')
	return <input {...attributes} type="range" class={['ui-range-input', props.class]} />
}

export function TextArea(props: TextAreaProps) {
	const attributes = omit(props, 'class')
	return <textarea {...attributes} class={['ui-text-area', props.class]} />
}

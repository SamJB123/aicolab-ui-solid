/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Field, SelectControl } from '../../src'
import { ColorTreatmentStory } from '../primitives/color-treatment-story'

function TreatmentSelect(props: {
	colorBase: Parameters<typeof SelectControl>[0]['colorBase']
	colorLevel: Parameters<typeof SelectControl>[0]['colorLevel']
	variant: Parameters<typeof SelectControl>[0]['variant']
}) {
	const [value, setValue] = createSignal('viewer')
	return (
		<SelectControl
			aria-label={`${props.colorBase} ${props.variant} role`}
			colorBase={props.colorBase}
			colorLevel={props.colorLevel}
			variant={props.variant}
			value={value()}
			onChange={(event) => setValue(event.currentTarget.value)}
		>
			<option value="viewer">Viewer</option>
			<option value="editor">Editor</option>
		</SelectControl>
	)
}

const meta = {
	title: 'Atoms/SelectControl',
	component: SelectControl,
	parameters: { layout: 'centered' },
	argTypes: {
		colorBase: { control: 'select', options: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'] },
		colorLevel: { control: 'select', options: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
		variant: { control: 'radio', options: ['solid', 'soft', 'outline', 'ghost', 'text'] },
	},
} satisfies Meta<typeof SelectControl>

export default meta
type Story = StoryObj<typeof meta>

export const Interactive: Story = {
	render: () => {
		const [role, setRole] = createSignal('viewer')
		return (
			<div style={{ display: 'grid', gap: '0.75rem', 'justify-items': 'start' }}>
				<SelectControl
					aria-label="Capability role"
					value={role()}
					onChange={(event) => setRole(event.currentTarget.value)}
				>
					<option value="viewer">Viewer</option>
					<option value="editor">Editor</option>
					<option value="owner">Owner</option>
				</SelectControl>
				<span role="status">Selected role: {role()}</span>
			</div>
		)
	},
}

export const IntrinsicSizing: Story = {
	render: () => (
		<div style={{ display: 'grid', gap: '0.75rem', 'justify-items': 'start' }}>
			<SelectControl aria-label="Compact choice" value="a">
				<option value="a">A</option>
				<option value="b">B</option>
			</SelectControl>
			<SelectControl aria-label="Room" value="commons">
				<option value="commons">Commons</option>
				<option value="studio">Collaborative design studio</option>
			</SelectControl>
		</div>
	),
}

export const FieldComposition: Story = {
	render: () => (
		<div style={{ width: '20rem', 'max-width': '80vw' }}>
			<Field label="Workspace">
				<SelectControl value="commons">
					<option value="commons">Commons</option>
					<option value="museum">Insight museum</option>
					<option value="studio">Spatial studio</option>
				</SelectControl>
			</Field>
		</div>
	),
}

export const ConstrainedLongContent: Story = {
	render: () => (
		<div style={{ width: '13rem' }}>
			<SelectControl aria-label="Long workspace name" value="long">
				<option value="short">Studio</option>
				<option value="long">Alliance-wide collaborative intelligence workspace</option>
			</SelectControl>
		</div>
	),
}

export const Disabled: Story = {
	render: () => (
		<SelectControl aria-label="Unavailable role" value="viewer" disabled>
			<option value="viewer">Viewer</option>
		</SelectControl>
	),
}

export const ColorTreatment: Story = {
	args: {
		'aria-label': 'Capability role',
		colorBase: 'primary',
		colorLevel: 500,
		variant: 'solid',
		value: 'viewer',
		children: (
			<>
				<option value="viewer">Viewer</option>
				<option value="editor">Editor</option>
			</>
		),
	},
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	render: () => (
		<ColorTreatmentStory
			render={({ colorBase, colorLevel, variant }) => (
				<TreatmentSelect
					colorBase={colorBase}
					colorLevel={colorLevel}
					variant={variant}
				/>
			)}
		/>
	),
}

/** @jsxImportSource @solidjs/web */
import { createSignal, For } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Dropzone } from '../../src/atoms/dropzone'
import { ColorTreatmentStory, treatmentArgTypes } from './color-treatment-story'

const meta = {
	title: 'Atoms/Dropzone',
	component: Dropzone,
	parameters: { layout: 'centered' },
	argTypes: {
		...treatmentArgTypes,
		accept: { control: 'text' },
		multiple: { control: 'boolean' },
		disabled: { control: 'boolean' },
		radius: { control: 'text', table: { category: 'knobs' } },
		pad: { control: 'text', table: { category: 'knobs' } },
		minHeight: { control: 'text', table: { category: 'knobs' } },
		border: { control: 'text', table: { category: 'knobs' } },
		activeBorder: { control: 'text', table: { category: 'knobs' } },
		activeSurface: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof Dropzone>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		children: 'Drop files here, or click to browse',
		onFiles: (files) => console.log('[dropzone story] files:', files.map((f) => f.name)),
		minHeight: '8rem',
	},
	render: (args) => <div style={{ width: '420px' }}><Dropzone {...args} /></div>,
}

export const WithFileLog: Story = {
	render: () => {
		const [names, setNames] = createSignal<string[]>([])
		return (
			<div style={{ width: '420px', display: 'grid', gap: '10px' }}>
				<Dropzone onFiles={(files) => setNames(files.map((f) => f.name))}>
					<strong>Drop files or browse</strong>
					<span>up to 5 GB per file</span>
				</Dropzone>
				<ul>
					<For each={names()}>{(name) => <li>{name}</li>}</For>
				</ul>
			</div>
		)
	},
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	render: () => (
		<ColorTreatmentStory
			render={({ colorBase, colorLevel, variant }) => (
				<Dropzone
					colorBase={colorBase}
					colorLevel={colorLevel}
					variant={variant}
					onFiles={() => {}}
					style={{ width: '260px' }}
				>
					Drop files
				</Dropzone>
			)}
		/>
	),
}

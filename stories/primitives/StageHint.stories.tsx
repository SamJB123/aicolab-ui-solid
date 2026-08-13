/** @jsxImportSource @solidjs/web */
import { treatmentArgTypes } from './color-treatment-story'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { StageHint } from '../../src'

const meta = {
	title: 'Atoms/StageHint',
	component: StageHint,
	argTypes: {
		...treatmentArgTypes,
		maxWidth: { control: 'text', table: { category: 'knobs' } },
		padBlock: { control: 'text', table: { category: 'knobs' } },
		padInline: { control: 'text', table: { category: 'knobs' } },
		radius: { control: 'text', table: { category: 'knobs' } },
		offset: { control: 'text', table: { category: 'knobs' } },
		surface: { control: 'text', table: { category: 'knobs' } },
		ink: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof StageHint>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		children: 'Drag to look around — scroll to zoom',
		radius: '999px',
		offset: '1rem',
		maxWidth: '36rem',
	},
	render: (args) => (
		<div
			style={{
				position: 'relative',
				width: 'min(40rem, 90vw)',
				height: '12rem',
				'border-radius': '12px',
				background: 'var(--color-base-300)',
			}}
		>
			<StageHint {...args} />
		</div>
	),
}

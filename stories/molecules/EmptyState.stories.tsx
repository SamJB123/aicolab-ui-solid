/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Button } from '../../src/atoms/button'
import { EmptyState } from '../../src/molecules/empty-state'
import { ColorTreatmentStory, treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Molecules/EmptyState',
	component: EmptyState,
	parameters: { layout: 'centered' },
	argTypes: {
		...treatmentArgTypes,
		pad: { control: 'text', table: { category: 'knobs' } },
		gap: { control: 'text', table: { category: 'knobs' } },
		glyphSize: { control: 'text', table: { category: 'knobs' } },
		glyphInk: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		title: 'No files yet',
		hint: 'Drop the first file here, or invite teammates so they can share theirs.',
		glyph: () => <>🗂️</>,
		action: () => <Button>Upload a file</Button>,
	},
	render: (args) => <div style={{ width: '460px' }}><EmptyState {...args} /></div>,
}

export const Bare: Story = {
	args: { title: 'Nothing here' },
	render: () => <EmptyState title="Nothing here" />,
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	args: { title: 'Empty' },
	render: () => (
		<ColorTreatmentStory
			render={({ colorBase, colorLevel, variant }) => (
				<EmptyState
					colorBase={colorBase}
					colorLevel={colorLevel}
					variant={variant}
					glyph={() => <>∅</>}
					title="Empty"
					hint="A treated empty state."
					pad="1.25rem"
					style={{ width: '220px' }}
				/>
			)}
		/>
	),
}

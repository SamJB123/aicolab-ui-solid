/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { PortalFolderCard } from '../../src/organisms/portal-folder-card'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Organisms/PortalFolderCard',
	component: PortalFolderCard,
	parameters: { layout: 'centered' },
	argTypes: {
		...treatmentArgTypes,
		radius: { control: 'text', table: { category: 'knobs' } },
		pad: { control: 'text', table: { category: 'knobs' } },
		minHeight: { control: 'text', table: { category: 'knobs' } },
		nameSize: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof PortalFolderCard>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		name: 'Research',
		meta: '12 items · active today',
		onOpen: () => console.log('[portal-folder story] open'),
	},
	render: (args) => (
		<div style={{ width: '16rem' }}>
			<PortalFolderCard {...args} />
		</div>
	),
}

export const DropTarget: Story = {
	args: {
		name: 'Assets',
		meta: '8 items',
		dropTarget: true,
		onOpen: () => console.log('[portal-folder story] open'),
	},
	render: (args) => (
		<div style={{ width: '16rem' }}>
			<PortalFolderCard {...args} />
		</div>
	),
}

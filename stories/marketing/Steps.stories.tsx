/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { type Step, Steps } from '../../src/marketing'

const STEPS: Step[] = [
	{
		title: 'See',
		body: 'Map what the community already knows — the practices, tools, and tensions in the room.',
		bullets: ['Listening sessions', 'Shared inventory'],
	},
	{
		title: 'Shape',
		body: 'Turn the map into a seasonal program the members vote on.',
		bullets: ['Open proposals', 'One member, one vote'],
		accent: '#5aa179',
	},
	{
		title: 'Ship',
		body: 'Run the season, document everything, and feed it back into the commons.',
		bullets: ['Working groups', 'Public notes'],
		accent: '#7286b8',
	},
]

const ICON_STEPS: Step[] = STEPS.map((s, i) => ({
	...s,
	icon: () => <span style={{ 'font-size': '48px' }}>{['👁️', '🧩', '🚀'][i]}</span>,
}))

const meta = {
	title: 'Molecules/Steps',
	component: Steps,
	parameters: { layout: 'fullscreen' },
	argTypes: {
		variant: { control: 'radio', options: ['zigzag', 'rail'] },
		node: { control: 'radio', options: ['sm', 'md', 'lg'] },
	},
} satisfies Meta<typeof Steps>

export default meta
type Story = StoryObj<typeof meta>

export const Zigzag: Story = {
	name: 'Zigzag (default, lg nodes)',
	args: { steps: STEPS },
}

export const ZigzagWithIcons: Story = {
	args: { steps: ICON_STEPS },
}

export const Rail: Story = {
	name: 'Rail (sm nodes)',
	args: { steps: STEPS, variant: 'rail' },
}

export const RailMediumNodes: Story = {
	name: 'Rail with md nodes',
	args: { steps: STEPS, variant: 'rail', node: 'md' },
}

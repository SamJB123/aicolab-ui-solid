/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DepthCard } from '../../src/depth-card'

const meta = {
	title: 'Organisms/DepthCard',
	component: DepthCard,
} satisfies Meta<typeof DepthCard>

export default meta
type Story = StoryObj<typeof meta>

export const Flippable: Story = {
	render: () => (
		<div style={{ width: 'min(24rem, 90vw)' }}>
			<DepthCard content={{ title: 'Collective sensemaking', description: 'Move the pointer to tilt; select the card to reveal the reverse.', icon: 'users-group', back: () => <p>Shared interpretation turns isolated observations into actionable knowledge.</p> }} />
		</div>
	),
}

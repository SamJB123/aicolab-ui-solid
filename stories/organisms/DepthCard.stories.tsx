/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DepthCard } from '../../src/depth-card'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Organisms/DepthCard',
	component: DepthCard,
	argTypes: {
		...treatmentArgTypes,
		radius: { control: 'text', table: { category: 'knobs' } },
		pad: { control: 'text', table: { category: 'knobs' } },
		surface: { control: 'text', table: { category: 'knobs' } },
		glow: { control: 'text', table: { category: 'knobs' } },
		bandSurface: { control: 'text', table: { category: 'knobs' } },
		mediaHeight: { control: 'text', table: { category: 'knobs' } },
		mediaRadius: { control: 'text', table: { category: 'knobs' } },
		schemePrimary: { control: 'text', table: { category: 'knobs' } },
		schemeSecondary: { control: 'text', table: { category: 'knobs' } },
		schemeAccent: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof DepthCard>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	render: (args) => (
		<div style={{ width: 'min(24rem, 90vw)' }}>
			<DepthCard
				{...args}
				content={{
					title: 'Collective sensemaking',
					description: 'Move the pointer to tilt; select the card to reveal the reverse.',
					icon: 'users-group',
					backgroundStyle: 'gradient',
					back: () => (
						<p>Shared interpretation turns isolated observations into actionable knowledge.</p>
					),
				}}
			/>
		</div>
	),
}

export const Flippable: Story = {
	render: () => (
		<div style={{ width: 'min(24rem, 90vw)' }}>
			<DepthCard content={{ title: 'Collective sensemaking', description: 'Move the pointer to tilt; select the card to reveal the reverse.', icon: 'users-group', back: () => <p>Shared interpretation turns isolated observations into actionable knowledge.</p> }} />
		</div>
	),
}

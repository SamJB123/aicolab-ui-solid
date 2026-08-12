/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { AvatarStack } from '../../src/primitives'
import { ColorTreatmentStory } from './color-treatment-story'

const PEOPLE = [
	{ name: 'Ada Lovelace', color: '#a06f1c' },
	{ name: 'Grace Hopper', color: '#5aa179' },
	{ name: 'Joan Clarke', color: '#b46a55' },
	{ name: 'Mary Jackson', color: '#7286b8' },
	{ name: 'Katherine Johnson', color: '#9a6fb8' },
	{ name: 'Dorothy Vaughan', color: '#5f8f8a' },
	{ name: 'Hedy Lamarr', color: '#b8867a' },
]

const meta = {
	title: 'Molecules/AvatarStack',
	component: AvatarStack,
} satisfies Meta<typeof AvatarStack>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	name: 'Overflow (+N)',
	args: { people: PEOPLE },
}

export const AllShown: Story = {
	args: { people: PEOPLE.slice(0, 4), max: 5 },
}

export const Compact: Story = {
	name: 'Compact (size 24, max 3)',
	args: { people: PEOPLE, max: 3, size: 24 },
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	args: { people: PEOPLE },
	render: () => <ColorTreatmentStory render={({ colorBase, colorLevel, variant }) => (
		<AvatarStack colorBase={colorBase} colorLevel={colorLevel} variant={variant} people={PEOPLE.slice(0, 4)} max={3} size={28} />
	)} />,
}

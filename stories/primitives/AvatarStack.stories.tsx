/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { AvatarStack, type AvatarStackPerson } from '../../src/primitives'
import { ColorTreatmentStory, treatmentArgTypes } from './color-treatment-story'

const PEOPLE: AvatarStackPerson[] = [
	{ name: 'Ada Lovelace', color: '#a06f1c' },
	{ name: 'Grace Hopper', color: '#5aa179' },
	{ name: 'Joan Clarke', color: '#b46a55' },
	{ name: 'Mary Jackson', color: '#7286b8' },
	{ name: 'Katherine Johnson', color: '#9a6fb8' },
	{ name: 'Dorothy Vaughan', color: '#5f8f8a' },
	{ name: 'Hedy Lamarr', color: '#b8867a' },
]

const portrait = (fill: string) =>
	`data:image/svg+xml,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${fill}"/><circle cx="16" cy="12" r="6" fill="white" opacity="0.85"/><ellipse cx="16" cy="28" rx="10" ry="8" fill="white" opacity="0.85"/></svg>`,
	)}`

const meta = {
	title: 'Molecules/AvatarStack',
	component: AvatarStack,
	argTypes: {
		...treatmentArgTypes,
		size: { control: 'text', table: { category: 'knobs' } },
		overlap: { control: 'text', table: { category: 'knobs' } },
		ring: { control: 'text', table: { category: 'knobs' } },
		ringWidth: { control: 'text', table: { category: 'knobs' } },
		extraSurface: { control: 'text', table: { category: 'knobs' } },
		extraInk: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof AvatarStack>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: { people: PEOPLE },
}

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

export const FacesAndStatus: Story = {
	name: 'Photos + status dots',
	args: {
		size: 40,
		people: [
			{ name: 'Ada Lovelace', image: portrait('#a06f1c'), status: { color: 'var(--color-success)', live: true } },
			{ name: 'Grace Hopper', color: '#5aa179', status: { color: 'var(--color-success)' } },
			{ name: 'Joan Clarke', image: portrait('#b46a55') },
			{ name: 'Mary Jackson' },
		],
	},
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	args: { people: PEOPLE },
	render: () => <ColorTreatmentStory render={({ colorBase, colorLevel, variant }) => (
		<AvatarStack colorBase={colorBase} colorLevel={colorLevel} variant={variant} people={PEOPLE.slice(0, 4)} max={3} size={28} />
	)} />,
}

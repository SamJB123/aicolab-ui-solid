/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { HexMark } from '../../src/atoms/hex-mark'
import { ColorTreatmentStory, treatmentArgTypes } from './color-treatment-story'

/** A line icon as marks carry them: a 24-unit box, strokes in the ink. */
const HiveIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path d="M12 3l7 4v8l-7 4-7-4V7z" />
		<path d="M12 8.5l3.5 2v4L12 16.5l-3.5-2v-4z" />
	</svg>
)

const meta = {
	title: 'Atoms/HexMark',
	component: HexMark,
	parameters: { layout: 'centered' },
	argTypes: {
		...treatmentArgTypes,
		orientation: { control: 'radio', options: ['flat', 'pointy'] },
		size: { control: 'text', table: { category: 'knobs' } },
		ink: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof HexMark>

export default meta
type Story = StoryObj<typeof meta>

/* The full anatomy: a plate with an icon on its face, inside the button a
   rail would put it in. */
export const Playground: Story = {
	args: {
		orientation: 'flat',
		size: '40px',
	},
	render: (args) => (
		<button
			type="button"
			aria-label="Hive"
			style={{ display: 'inline-flex', padding: '4px', border: 0, background: 'none', color: 'inherit' }}
		>
			<HexMark {...args}>
				<HiveIcon />
			</HexMark>
		</button>
	),
}

/* The two orientations, plain and lit in a family: a treated mark takes
   its family's surface and rim as every plate does. */
export const Orientations: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '24px', 'align-items': 'center' }}>
			<HexMark size="48px">
				<HiveIcon />
			</HexMark>
			<HexMark size="48px" orientation="pointy">
				<HiveIcon />
			</HexMark>
			<HexMark size="48px" colorBase="primary">
				<HiveIcon />
			</HexMark>
			<HexMark size="48px" orientation="pointy" colorBase="secondary">
				<HiveIcon />
			</HexMark>
		</div>
	),
}

/* Content other than an icon: a cell of a map carries a name on its face. */
export const Sizes: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '20px', 'align-items': 'center' }}>
			<HexMark size="22px">
				<HiveIcon />
			</HexMark>
			<HexMark>
				<HiveIcon />
			</HexMark>
			<HexMark size="64px">
				<HiveIcon />
			</HexMark>
			<HexMark size="128px" colorBase="primary">
				<span style={{ display: 'grid', 'justify-items': 'center', gap: '2px', font: '600 14px var(--font-display)' }}>
					<HiveIcon />
					Hive
				</span>
			</HexMark>
		</div>
	),
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	render: () => (
		<ColorTreatmentStory
			render={({ colorBase, colorLevel, variant }) => (
				<HexMark colorBase={colorBase} colorLevel={colorLevel} variant={variant} size="40px">
					<HiveIcon />
				</HexMark>
			)}
		/>
	),
}

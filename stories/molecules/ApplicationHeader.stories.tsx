/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Button } from '../../src/atoms/button'
import { StatusDot } from '../../src/primitives'
import { ApplicationHeader } from '../../src/molecules/application-header'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Molecules/ApplicationHeader',
	component: ApplicationHeader,
	parameters: { layout: 'fullscreen' },
	args: { title: 'Studio calendar' },
	argTypes: {
		...treatmentArgTypes,
		accent: { control: 'text', table: { category: 'knobs' } },
		borderWidth: { control: 'text', table: { category: 'knobs' } },
		surface: { control: 'text', table: { category: 'knobs' } },
		padBlock: { control: 'text', table: { category: 'knobs' } },
		padInline: { control: 'text', table: { category: 'knobs' } },
		titleInk: { control: 'text', table: { category: 'knobs' } },
		eyebrowInk: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof ApplicationHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	render: (args) => (
		<ApplicationHeader
			{...args}
			title="Studio calendar"
			eyebrow="AI CoLab"
			status={() => <StatusDot status={{ color: 'var(--color-success)', live: true }} />}
			actions={() => (
				<>
					{/* Slot content is caller-authored: the caller passes the family. */}
					<Button colorBase={args.colorBase} colorLevel={args.colorLevel} variant="ghost">Share</Button>
					<Button colorBase={args.colorBase} colorLevel={args.colorLevel} variant="solid">New event</Button>
				</>
			)}
		/>
	),
}

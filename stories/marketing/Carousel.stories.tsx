/** @jsxImportSource @solidjs/web */
import { For } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Carousel } from '../../src/marketing'
import { Chip, Panel } from '../../src/primitives'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const SLIDES = [
	{ title: 'Critique night', kicker: 'Thursdays · Commons', colorBase: 'success' },
	{ title: 'Intro to weaving', kicker: 'Six weeks · Studio A', colorBase: 'primary' },
	{ title: 'Open hardware lab', kicker: 'Saturdays · Workshop', colorBase: 'secondary' },
	{ title: 'Seasonal exhibition', kicker: 'Opens March · Gallery', colorBase: 'accent' },
] as const

const meta = {
	title: 'Molecules/Carousel',
	component: Carousel,
	parameters: { layout: 'fullscreen' },
	argTypes: {
		...treatmentArgTypes,
		itemWidth: { control: 'text', table: { category: 'knobs' } },
		gap: { control: 'text', table: { category: 'knobs' } },
		markerSize: { control: 'text', table: { category: 'knobs' } },
		markerInk: { control: 'text', table: { category: 'knobs' } },
		markerActiveInk: { control: 'text', table: { category: 'knobs' } },
		buttonSurface: { control: 'text', table: { category: 'knobs' } },
		buttonInk: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof Carousel>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	render: (args) => (
		<div style={{ padding: '24px' }}>
			<Carousel {...args} label="This season's programs">
				<For each={[...SLIDES]}>
					{(slide) => (
						<div style={{ 'min-width': '320px' }}>
							<Panel title={slide.title} kicker={slide.kicker}>
								<Chip colorBase={slide.colorBase} variant="soft">
									{slide.colorBase === 'success' ? 'running now' : 'enrolling'}
								</Chip>
							</Panel>
						</div>
					)}
				</For>
			</Carousel>
		</div>
	),
}

export const PanelSlides: Story = {
	name: 'Snap slides (native scroll buttons where supported)',
	render: () => (
		<div style={{ padding: '24px' }}>
			<Carousel label="This season's programs">
				<For each={[...SLIDES]}>
					{(slide) => (
						<div style={{ 'min-width': '320px' }}>
							<Panel title={slide.title} kicker={slide.kicker}>
								<Chip colorBase={slide.colorBase} variant="soft">
									{slide.colorBase === 'success' ? 'running now' : 'enrolling'}
								</Chip>
							</Panel>
						</div>
					)}
				</For>
			</Carousel>
		</div>
	),
}

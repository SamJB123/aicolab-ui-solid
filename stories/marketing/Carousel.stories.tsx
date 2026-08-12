/** @jsxImportSource @solidjs/web */
import { For } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Carousel } from '../../src/marketing'
import { Chip, Panel } from '../../src/primitives'

const SLIDES = [
	{ title: 'Critique night', kicker: 'Thursdays · Commons', tone: 'live' },
	{ title: 'Intro to weaving', kicker: 'Six weeks · Studio A', tone: 'accent' },
	{ title: 'Open hardware lab', kicker: 'Saturdays · Workshop', tone: 'plain' },
	{ title: 'Seasonal exhibition', kicker: 'Opens March · Gallery', tone: 'accent' },
] as const

const meta = {
	title: 'Molecules/Carousel',
	component: Carousel,
	parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Carousel>

export default meta
type Story = StoryObj<typeof meta>

export const PanelSlides: Story = {
	name: 'Snap slides (native scroll buttons where supported)',
	render: () => (
		<div style={{ padding: '24px' }}>
			<Carousel label="This season's programs">
				<For each={[...SLIDES]}>
					{(slide) => (
						<div style={{ 'min-width': '320px' }}>
							<Panel title={slide.title} kicker={slide.kicker}>
								<Chip tone={slide.tone}>{slide.tone === 'live' ? 'running now' : 'enrolling'}</Chip>
							</Panel>
						</div>
					)}
				</For>
			</Carousel>
		</div>
	),
}

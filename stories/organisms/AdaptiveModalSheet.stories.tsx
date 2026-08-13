/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { AdaptiveModalSheet, Button } from '../../src'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Organisms/AdaptiveModalSheet',
	component: AdaptiveModalSheet,
	args: { open: false, label: 'Insight note', title: 'Insight note', onDismiss: () => undefined },
	argTypes: {
		...treatmentArgTypes,
		headerSurface: { control: 'text', table: { category: 'knobs' } },
		headerInk: { control: 'text', table: { category: 'knobs' } },
		accent: { control: 'text', table: { category: 'knobs' } },
		surface: { control: 'text', table: { category: 'knobs' } },
		width: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof AdaptiveModalSheet>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	render: (args) => {
		const [open, setOpen] = createSignal(true)
		return (
			<div style={{ height: '34rem' }}>
				<Button onClick={() => setOpen(true)}>Open reader</Button>
				<AdaptiveModalSheet
					{...args}
					open={open()}
					label="Insight note"
					eyebrow="Field note"
					title="Shared language changes outcomes"
					actions={
						<>
							<button type="button">Pin</button>
							<a href="#share">Share</a>
						</>
					}
					onDismiss={() => setOpen(false)}
				>
					<article class="ui-prose" style={{ padding: '2rem' }}>
						<h2 id="finding">Finding</h2>
						<p>
							Teams coordinated more effectively when their working language was visible and
							revisable. The shared vocabulary acted as an interface between disciplines.
						</p>
						<h3 id="method">Method</h3>
						<p>Twelve working groups, one season, weekly retrospectives.</p>
					</article>
				</AdaptiveModalSheet>
			</div>
		)
	},
}

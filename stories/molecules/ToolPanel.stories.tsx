/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Button } from '../../src/atoms/button'
import {
	ToolPanel,
	ToolPanelActions,
	ToolPanelSection,
} from '../../src/molecules/tool-panel'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Molecules/ToolPanel',
	component: ToolPanel,
	parameters: { layout: 'centered' },
	args: { label: 'Scene tools', title: 'Scene' },
	argTypes: {
		...treatmentArgTypes,
		accent: { control: 'text', table: { category: 'knobs' } },
		borderWidth: { control: 'text', table: { category: 'knobs' } },
		width: { control: 'text', table: { category: 'knobs' } },
		pad: { control: 'text', table: { category: 'knobs' } },
		gap: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof ToolPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	render: (args) => (
		<div style={{ 'min-height': '24rem', display: 'grid', 'place-items': 'center' }}>
			<ToolPanel {...args} label="Scene tools" title="Scene">
				<ToolPanelSection title="Camera" meta="rig 2">
					<ToolPanelActions>
						<Button variant="soft">Orbit</Button>
						<Button variant="soft">Fly</Button>
					</ToolPanelActions>
				</ToolPanelSection>
				<ToolPanelSection title="Weather">
					<ToolPanelActions wrap>
						<Button variant="ghost">Clear</Button>
						<Button variant="ghost">Fog</Button>
						<Button variant="ghost">Storm</Button>
					</ToolPanelActions>
				</ToolPanelSection>
			</ToolPanel>
		</div>
	),
}

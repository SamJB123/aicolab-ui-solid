/** @jsxImportSource @solidjs/web */
import { createSignal, For } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import {
	ApplicationHeader, Button, Chip, Field, RichList, RichListItem, SelectControl,
	TextInput, ToggleGroup, ToolPanel, ToolPanelActions, ToolPanelList, ToolPanelSection,
} from '../../src'

const meta = {
	title: 'Molecules/Application patterns',
	component: ApplicationHeader,
	args: { title: 'Application header' },
} satisfies Meta<typeof ApplicationHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Header: Story = {
	render: () => (
		<ApplicationHeader
			eyebrow="Spatial workspace"
			title="Insight map"
			status={() => <Chip colorBase="success" variant="soft">3 online</Chip>}
			actions={() => <Button variant="soft">Share</Button>}
		/>
	),
}

export const RichNavigation: Story = {
	render: () => {
		const [selected, setSelected] = createSignal('commons')
		const items = ['commons', 'studio', 'workshop'] as const
		return <RichList navigation label="Spaces"><For each={items}>{(item) => <RichListItem title={item} description={`${item} activity`} selected={selected() === item} onSelect={() => setSelected(item)} />}</For></RichList>
	},
}

export const ExclusiveCommands: Story = {
	render: () => {
		const [mode, setMode] = createSignal<'map' | 'explore'>('map')
		return <ToggleGroup label="Mode" value={mode()} onChange={setMode} options={[{ id: 'map', label: 'Map' }, { id: 'explore', label: 'Explore' }]} />
	},
}

export const OverlayToolPanel: Story = {
	render: () => (
		<div style={{ position: 'relative', height: '30rem', padding: '1rem', background: 'linear-gradient(135deg, var(--color-secondary), var(--color-base-300))' }}>
			<ToolPanel label="Scene editor" title="Scene edit" action={() => <Button variant="text">Done</Button>}>
				<ToolPanelSection title="Object" meta="selected">
					<Field label="Name"><TextInput value="Commons table" /></Field>
					<Field label="Material"><SelectControl><option>Timber</option><option>Steel</option></SelectControl></Field>
				</ToolPanelSection>
				<ToolPanelSection title="Layers">
					<ToolPanelList><Button variant="soft">Furniture</Button><Button variant="soft">Lighting</Button></ToolPanelList>
				</ToolPanelSection>
				<ToolPanelActions><Button>Save</Button><Button variant="outline">Reset</Button></ToolPanelActions>
			</ToolPanel>
		</div>
	),
}

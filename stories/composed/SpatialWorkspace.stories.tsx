/** @jsxImportSource @solidjs/web */
import { createSignal, For, Show } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import {
	ApplicationHeader,
	Button,
	Field,
	HoldButton,
	Notice,
	RangeInput,
	Segmented,
	SelectControl,
	StageHint,
	TextInput,
	ToggleGroup,
	ToolPanel,
	ToolPanelActions,
	ToolPanelList,
	ToolPanelSection,
} from '../../src'
import './spatial-workspace.css'

const meta = {
	title: 'Composed/Spatial workspace',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const HeaderAndSceneTools: Story = {
	render: () => {
		const [face, setFace] = createSignal<'map' | 'world'>('world')
		const [editing, setEditing] = createSignal(true)
		const [mode, setMode] = createSignal<'translate' | 'rotate' | 'scale'>('translate')
		const [camera, setCamera] = createSignal<'orthographic' | 'perspective'>('orthographic')
		const [angle, setAngle] = createSignal(48)
		const [selectedPath, setSelectedPath] = createSignal('garden-loop')

		return (
			<div style={{ position: 'relative', height: '48rem', overflow: 'clip', background: 'var(--color-base-200)' }}>
				<ApplicationHeader
					eyebrow="One place · two native projections"
					title="Insights Island"
					actions={() => (
						<>
							<Segmented
								label="Spatial representation"
								options={[{ id: 'map', label: 'Map' }, { id: 'world', label: 'Explore' }]}
								value={face()}
								onChange={setFace}
							/>
							<Button variant="soft" pressed={editing()} onClick={() => setEditing((value) => !value)}>
								Edit
							</Button>
							<Button variant="soft">Join MP</Button>
						</>
					)}
				/>

				<StageHint class="spatial-story-hint">Select objects or paths · right-drag to pan</StageHint>
				<Show when={editing()}>
					<ToolPanel
						class="spatial-story-tools"
						label="Spatial scene editor"
						title="Scene edit"
						action={() => <Button variant="text" onClick={() => setEditing(false)}>Done</Button>}
					>
						<ToggleGroup
							label="Transform mode"
							options={[
								{ id: 'translate', label: 'Translate' },
								{ id: 'rotate', label: 'Rotate' },
								{ id: 'scale', label: 'Scale' },
							]}
							value={mode()}
							onChange={setMode}
						/>
						<ToolPanelSection title="Camera">
							<ToggleGroup
								label="Camera projection"
								options={[
									{ id: 'orthographic', label: 'Orthographic' },
									{ id: 'perspective', label: 'Perspective' },
								]}
								value={camera()}
								onChange={setCamera}
							/>
							<Field label={`Look-down angle · ${angle()}°`}>
								<RangeInput min="20" max="80" value={angle()} onInput={(event) => setAngle(event.currentTarget.valueAsNumber)} />
							</Field>
						</ToolPanelSection>
						<ToolPanelSection title="Asset library" meta="24 models">
							<Field label="Find a model"><TextInput type="search" placeholder="Building, tree, furniture…" /></Field>
							<Field label="Catalogue model">
								<SelectControl><option>Garden / pavilion.glb</option><option>Nature / oak.glb</option></SelectControl>
							</Field>
							<ToolPanelActions><Button variant="soft">Replace</Button><Button variant="soft">Add</Button></ToolPanelActions>
							<Notice colorBase="success" variant="soft">Pavilion is ready to place.</Notice>
						</ToolPanelSection>
						<ToolPanelSection title="Paths" meta={<Button variant="text">Add path</Button>}>
							<ToolPanelList>
								<For each={['garden-loop', 'museum-way', 'harbour-path']}>
									{(path) => <Button variant="soft" pressed={selectedPath() === path} onClick={() => setSelectedPath(path)}>{path}</Button>}
								</For>
							</ToolPanelList>
						</ToolPanelSection>
					</ToolPanel>
				</Show>
				<HoldButton class="spatial-story-jump" colorBase="error" onPressedChange={() => undefined}>Jump</HoldButton>
			</div>
		)
	},
}

/** @jsxImportSource @solidjs/web */
import { createSignal, For } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import {
	Button, InspectorHeader, RaisedSheet, ResponsiveInspector, WorkspaceNavigation,
	WorkspaceNavigationGroup, WorkspaceNavigationItem, WorkspaceShell, WorkspaceStage,
	WorkspaceStageTooltip,
} from '../../src'

const meta = {
	title: 'Organisms/Workspace',
	component: WorkspaceShell,
	parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof WorkspaceShell>

export default meta
type Story = StoryObj<typeof meta>

export const CompleteWorkspace: Story = {
	render: () => {
		const spaces = ['Commons', 'Studio', 'Workshop']
		const [selected, setSelected] = createSignal('Commons')
		const [sheet, setSheet] = createSignal(false)
		return (
			<div style={{ height: '42rem' }}>
				<WorkspaceShell
					navigation={
						<WorkspaceNavigation label="Workspace" brand={<strong>AI CoLab</strong>} footer={<Button variant="text">Settings</Button>}>
							<WorkspaceNavigationGroup id="spaces" label="Spaces">
								<For each={spaces}>{(space) => <WorkspaceNavigationItem label={space} current={selected() === space} onSelect={() => setSelected(space)} />}</For>
							</WorkspaceNavigationGroup>
						</WorkspaceNavigation>
					}
					stage={
						<WorkspaceStage label="Map stage">
							<div style={{ height: '100%', background: 'radial-gradient(circle at center, var(--color-primary-soft), var(--color-base-300))' }} />
							<WorkspaceStageTooltip label={selected()} detail="Selected space" />
							<div style={{ position: 'absolute', top: '1rem', left: '1rem' }}><Button onClick={() => { setSheet(true) }}>Open sheet</Button></div>
						</WorkspaceStage>
					}
					inspector={<ResponsiveInspector label="Inspector" activeKey={selected()}><InspectorHeader eyebrow="Selection" title={selected()}>Edit the selected space.</InspectorHeader></ResponsiveInspector>}
					hasRaisedSheet={sheet()}
				>
					{sheet() && <RaisedSheet title="All insight notes" onClose={() => setSheet(false)}><p>Reusable raised workspace content.</p></RaisedSheet>}
				</WorkspaceShell>
			</div>
		)
	},
}

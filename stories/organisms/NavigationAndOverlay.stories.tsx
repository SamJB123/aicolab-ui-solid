/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import {
	AdaptiveModalSheet, BottomNavigation, BottomNavigationCentreContent, Button, CommandPalette, CommandPaletteTrigger,
	RadialMenu,
} from '../../src'

const meta = {
	title: 'Organisms/Navigation and overlays',
	component: AdaptiveModalSheet,
	args: { open: false, label: 'Adaptive sheet', title: 'Adaptive sheet', onDismiss: () => undefined },
} satisfies Meta<typeof AdaptiveModalSheet>

export default meta
type Story = StoryObj<typeof meta>

export const AdaptiveReader: Story = {
	render: () => {
		const [open, setOpen] = createSignal(true)
		return (
			<div style={{ height: '34rem' }}>
				<Button onClick={() => setOpen(true)}>Open reader</Button>
				<AdaptiveModalSheet open={open()} label="Insight note" eyebrow="Field note" title="Shared language changes outcomes" onDismiss={() => setOpen(false)}>
					<article class="ui-prose" style={{ padding: '2rem' }}><h2 id="finding">Finding</h2><p>Teams coordinated more effectively when their working language was visible and revisable.</p></article>
				</AdaptiveModalSheet>
			</div>
		)
	},
}

export const MobileNavigation: Story = {
	parameters: { viewport: { defaultViewport: 'mobile1' } },
	render: () => {
		const [active, setActive] = createSignal<'home' | 'map' | 'people' | 'notes'>('map')
		const places = [
			{ id: 'hub', label: 'Hub', icon: '◈', onSelect: () => setActive('map') },
			{ id: 'north', label: 'North', icon: '△', onSelect: () => setActive('map') },
			{ id: 'south', label: 'South', icon: '▽', onSelect: () => setActive('map') },
		]
		return (
			<div style={{ position: 'relative', height: '18rem', background: 'var(--color-base-300)' }}>
				<BottomNavigation
					items={[
						{ id: 'home', label: 'Home', icon: () => '⌂' }, { id: 'map', label: 'Map', icon: () => '◇' },
						{ id: 'people', label: 'People', icon: () => '◎' }, { id: 'notes', label: 'Notes', icon: () => '≡' },
					]}
					activeId={active()}
					onSelect={setActive}
					centre={
						<RadialMenu id="storybook-mobile-places" label="Places" items={places}>
							<BottomNavigationCentreContent icon="◎" label="World" active={active() === 'map'} />
						</RadialMenu>
					}
				/>
			</div>
		)
	},
}

const COMMANDS = [
	{ id: 'new-note', label: 'New insight note', detail: 'Capture a finding', kind: 'Create' },
	{ id: 'open-map', label: 'Open spatial map', detail: 'Explore relationships', kind: 'Navigate' },
	{ id: 'invite', label: 'Invite collaborator', detail: 'Share this workspace', kind: 'Action' },
]

export const SearchableCommandPalette: Story = {
	render: () => {
		const [selected, setSelected] = createSignal('Nothing selected')
		return (
			<div style={{ display: 'grid', gap: '1rem', 'justify-items': 'start' }}>
				<CommandPaletteTrigger target="storybook-command-palette" label="Open command palette" shortcut="⌘K">Find a command</CommandPaletteTrigger>
				<span role="status">{selected()}</span>
				<CommandPalette id="storybook-command-palette" items={COMMANDS} recentIds={['open-map']} onSelect={(item) => setSelected(item.label)} />
			</div>
		)
	},
}

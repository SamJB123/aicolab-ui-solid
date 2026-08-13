/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { CommandPalette, CommandPaletteTrigger } from '../../src'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const COMMANDS = [
	{ id: 'go-harbour', label: 'Go to the harbour', detail: 'Ferry terminal and arrivals board', kind: 'Place' },
	{ id: 'go-library', label: 'Go to the library', detail: 'Insights gallery', kind: 'Place', keywords: ['insights'] },
	{ id: 'new-note', label: 'New field note', kind: 'Action' },
	{ id: 'invite', label: 'Invite a collaborator', detail: 'Share a join link', kind: 'Action' },
	{ id: 'toggle-grid', label: 'Toggle build grid', kind: 'Action' },
]

const meta = {
	title: 'Organisms/CommandPalette',
	component: CommandPalette,
	parameters: { layout: 'centered' },
	args: { id: 'sb-palette', items: COMMANDS, onSelect: () => undefined },
	argTypes: {
		...treatmentArgTypes,
		width: { control: 'text', table: { category: 'knobs' } },
		topOffset: { control: 'text', table: { category: 'knobs' } },
		radius: { control: 'text', table: { category: 'knobs' } },
		listMaxHeight: { control: 'text', table: { category: 'knobs' } },
		activeSurface: { control: 'text', table: { category: 'knobs' } },
		activeInk: { control: 'text', table: { category: 'knobs' } },
		kindInk: { control: 'text', table: { category: 'knobs' } },
		detailInk: { control: 'text', table: { category: 'knobs' } },
		focusSeam: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof CommandPalette>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	render: (args) => (
		<div style={{ 'min-height': '28rem', display: 'grid', 'place-items': 'center' }}>
			<CommandPaletteTrigger
				target="sb-palette"
				label="Open command palette"
				shortcut="⌘K"
				colorBase={args.colorBase}
				colorLevel={args.colorLevel}
				variant={args.variant}
			>
				Search commands…
			</CommandPaletteTrigger>
			<CommandPalette
				{...args}
				id="sb-palette"
				items={COMMANDS}
				recentIds={['new-note']}
				onSelect={() => undefined}
			/>
		</div>
	),
}

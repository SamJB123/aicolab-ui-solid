/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Button } from '../../src/atoms/button'
import { Menu, MenuItem, MenuSeparator } from '../../src/molecules/menu'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Molecules/Menu',
	component: Menu,
	parameters: { layout: 'centered' },
	argTypes: {
		...treatmentArgTypes,
		label: { control: 'text' },
		width: { control: 'text', table: { category: 'knobs' } },
		pad: { control: 'text', table: { category: 'knobs' } },
		itemPad: { control: 'text', table: { category: 'knobs' } },
		itemRadius: { control: 'text', table: { category: 'knobs' } },
		itemHoverSurface: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof Menu>

export default meta
type Story = StoryObj<typeof meta>

const items = () => (
	<>
		<MenuItem glyph={() => <>✏️</>} onSelect={() => console.log('rename')}>
			Rename
		</MenuItem>
		<MenuItem glyph={() => <>📁</>} onSelect={() => console.log('move')}>
			Move to folder…
		</MenuItem>
		<MenuItem glyph={() => <>🔗</>} onSelect={() => console.log('share')}>
			Copy share link
		</MenuItem>
		<MenuItem disabled>Download (preparing…)</MenuItem>
		<MenuSeparator />
		<MenuItem danger glyph={() => <>🗑️</>} onSelect={() => console.log('delete')}>
			Delete
		</MenuItem>
	</>
)

export const Playground: Story = {
	args: {
		label: 'File actions',
	},
	render: (args) => <Menu {...args}>{items()}</Menu>,
}

export const CustomTrigger: Story = {
	render: () => (
		<Menu
			label="Workspace actions"
			width="240px"
			trigger={(wiring) => (
				<Button popoverTarget={wiring.popoverTarget} style={wiring.style} variant="outline">
					Actions ▾
				</Button>
			)}
		>
			{items()}
		</Menu>
	),
}

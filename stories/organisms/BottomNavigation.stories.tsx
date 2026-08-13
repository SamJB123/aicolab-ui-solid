/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { BottomNavigation, BottomNavigationCentreContent } from '../../src'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const ITEMS = [
	{ id: 'home', label: 'Home', icon: '⌂' },
	{ id: 'search', label: 'Search', icon: '⌕' },
	{ id: 'events', label: 'Events', icon: '▤' },
	{ id: 'you', label: 'You', icon: '◉' },
] as const

const meta = {
	title: 'Organisms/BottomNavigation',
	component: BottomNavigation,
	parameters: { layout: 'fullscreen', viewport: { defaultViewport: 'mobile1' } },
	args: { items: ITEMS, onSelect: () => undefined, centre: null },
	argTypes: {
		...treatmentArgTypes,
		height: { control: 'text', table: { category: 'knobs' } },
		labelSize: { control: 'text', table: { category: 'knobs' } },
		chipSize: { control: 'text', table: { category: 'knobs' } },
		activeWash: { control: 'text', table: { category: 'knobs' } },
		activeInk: { control: 'text', table: { category: 'knobs' } },
		chipSurface: { control: 'text', table: { category: 'knobs' } },
		chipInk: { control: 'text', table: { category: 'knobs' } },
		chipActiveSurface: { control: 'text', table: { category: 'knobs' } },
		chipActiveInk: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof BottomNavigation>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	render: (args) => {
		const [active, setActive] = createSignal<string>('home')
		return (
			<div style={{ 'min-height': '20rem' }}>
				<BottomNavigation
					{...args}
					items={ITEMS}
					activeId={active()}
					onSelect={setActive}
					centre={
						<button type="button" class="ui-radial-trigger" onClick={() => setActive('map')}>
							<BottomNavigationCentreContent icon="◎" label="World" active={active() === 'map'} />
						</button>
					}
				/>
			</div>
		)
	},
}

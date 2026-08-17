/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { AvatarStack } from '../../src/molecules/avatar-stack'
import { ContentCard } from '../../src/organisms/content-card'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Organisms/ContentCard',
	component: ContentCard,
	parameters: { layout: 'centered' },
	argTypes: {
		...treatmentArgTypes,
		radius: { control: 'text', table: { category: 'knobs' } },
		pad: { control: 'text', table: { category: 'knobs' } },
		gap: { control: 'text', table: { category: 'knobs' } },
		mediaHeight: { control: 'text', table: { category: 'knobs' } },
		titleSize: { control: 'text', table: { category: 'knobs' } },
		previewSize: { control: 'text', table: { category: 'knobs' } },
		kind: { control: 'inline-radio', options: ['doc', 'file'] },
	},
} satisfies Meta<typeof ContentCard>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		kind: 'doc',
		pinned: true,
		title: 'Nectar flow — Q3',
		preview:
			'The nectar flow this season has been unusually strong on the eastern meadow — worth moving two supers before the weekend and checking the queen excluders while we are at it.',
		onOpen: () => console.log('[content-card story] open'),
	},
	render: (args) => (
		<div style={{ width: '18rem' }}>
			<ContentCard
				{...args}
				meta={<>Noor · edited 2m ago</>}
				presence={<AvatarStack people={[{ name: 'Noor' }, { name: 'Kenji' }]} size="20px" />}
			/>
		</div>
	),
}

export const FileWithMedia: Story = {
	args: {
		kind: 'file',
		title: 'hive-inspection.jpg',
		onOpen: () => console.log('[content-card story] open file'),
	},
	render: (args) => (
		<div style={{ width: '18rem' }}>
			<ContentCard {...args} media={<span aria-hidden="true">🖼️</span>} meta={<>2.1 MB · Alice</>} />
		</div>
	),
}

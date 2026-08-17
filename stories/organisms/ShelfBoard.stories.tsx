/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { AvatarStack } from '../../src/molecules/avatar-stack'
import { ContentCard } from '../../src/organisms/content-card'
import { PortalFolderCard } from '../../src/organisms/portal-folder-card'
import { ShelfBoard } from '../../src/organisms/shelf-board'

const meta = {
	title: 'Organisms/ShelfBoard',
	component: ShelfBoard,
	parameters: { layout: 'padded' },
	argTypes: {
		gap: { control: 'text', table: { category: 'knobs' } },
		minCell: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof ShelfBoard>

export default meta
type Story = StoryObj<typeof meta>

const PREVIEW =
	'The nectar flow this season has been unusually strong on the eastern meadow — worth moving two supers before the weekend and checking the queen excluders while we are at it.'

export const Playground: Story = {
	args: { label: 'Demo shelf' },
	render: (args) => (
		<div style={{ 'max-width': '64rem' }}>
			<ShelfBoard {...args}>
				<PortalFolderCard
					name="Research"
					meta="12 items · active today"
					onOpen={() => console.log('[shelf story] open folder')}
				/>
				<ContentCard
					kind="doc"
					pinned
					title="Nectar flow — Q3"
					preview={PREVIEW}
					meta={<>Noor · edited 2m ago</>}
					presence={<AvatarStack people={[{ name: 'Noor' }, { name: 'Kenji' }]} size="20px" />}
					onOpen={() => console.log('[shelf story] open doc')}
				/>
				<ContentCard
					kind="file"
					title="hive-inspection.jpg"
					media={<span aria-hidden="true">🖼️</span>}
					meta={<>2.1 MB · Alice · yesterday</>}
					onOpen={() => console.log('[shelf story] open file')}
				/>
				<ContentCard
					kind="doc"
					title="Winter prep checklist"
					preview="Insulation boards, mouse guards, fondant reserves…"
					meta={<>Sam · edited 3d ago</>}
					onOpen={() => console.log('[shelf story] open doc 2')}
				/>
				<PortalFolderCard
					name="Assets"
					meta="8 items"
					onOpen={() => console.log('[shelf story] open folder 2')}
				/>
				<ContentCard
					kind="file"
					title="survey-results.pdf"
					media={<span aria-hidden="true">📄</span>}
					meta={<>640 KB · Priya · last week</>}
					muted
					onOpen={() => console.log('[shelf story] open file 2')}
				/>
			</ShelfBoard>
		</div>
	),
}

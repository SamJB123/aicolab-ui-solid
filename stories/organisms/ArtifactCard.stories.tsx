/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { AvatarStack } from '../../src/molecules/avatar-stack'
import { Menu, MenuItem } from '../../src/molecules/menu'
import { ArtifactCard } from '../../src/organisms/artifact-card'

const meta = {
	title: 'Organisms/Artifact card',
	component: ArtifactCard,
	parameters: { layout: 'padded' },
	argTypes: {
		colorBase: {
			control: 'select',
			options: [undefined, 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error', 'neutral'],
			table: { category: 'treatment' },
		},
		variant: {
			control: 'select',
			options: [undefined, 'soft', 'solid', 'outline', 'text'],
			table: { category: 'treatment' },
		},
		pad: { control: 'text', table: { category: 'knobs' } },
		gap: { control: 'text', table: { category: 'knobs' } },
		radius: { control: 'text', table: { category: 'knobs' } },
		previewSize: { control: 'text', table: { category: 'knobs' } },
		pinned: { control: 'boolean' },
		live: { control: 'boolean' },
	},
} satisfies Meta<typeof ArtifactCard>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		eyebrow: 'Document',
		title: 'The Working Charter',
		pinned: true,
		live: true,
		label: 'Open The Working Charter',
	},
	render: (args) => (
		<div style={{ width: '300px' }}>
			<ArtifactCard
				{...args}
				onSelect={() => console.info('open')}
				preview={() => (
					<>We believe the network is strongest when every group can shape its own space —
					shared files, live documents, and a place that remembers what it has done together.</>
				)}
				meta={() => <>Noor · edited 2m ago</>}
				presence={() => <AvatarStack people={[{ name: 'Noor' }, { name: 'Sam' }]} size="22px" />}
				actions={() => (
					<Menu label="Card actions">
						<MenuItem onSelect={() => console.info('pin')}>Unpin</MenuItem>
						<MenuItem onSelect={() => console.info('details')}>Details</MenuItem>
					</Menu>
				)}
			/>
		</div>
	),
}

export const Grid: Story = {
	args: { label: 'Open' },
	render: () => (
		<div
			style={{
				display: 'grid',
				'grid-template-columns': 'repeat(auto-fill, minmax(240px, 1fr))',
				gap: '1rem',
				'max-width': '860px',
			}}
		>
			<ArtifactCard
				eyebrow="Document"
				title="Meeting minutes — August"
				label="Open minutes"
				onSelect={() => {}}
				preview={() => <>Attendees: the whole crew. Decisions: three. Follow-ups: many.</>}
				meta={() => <>Sam · yesterday</>}
			/>
			<ArtifactCard
				eyebrow="PDF · 2.1 MB"
				title="Grant brief (final)"
				label="Open grant brief"
				pinned
				onSelect={() => {}}
				meta={() => <>Ada · last week</>}
			/>
			<ArtifactCard
				eyebrow="Document"
				title="Roadmap draft"
				label="Open roadmap"
				live
				colorBase="accent"
				variant="soft"
				onSelect={() => {}}
				preview={() => <>Q4 priorities, in the open. Currently being edited.</>}
				meta={() => <>Kai · just now</>}
				presence={() => <AvatarStack people={[{ name: 'Kai' }]} size="22px" />}
			/>
		</div>
	),
}

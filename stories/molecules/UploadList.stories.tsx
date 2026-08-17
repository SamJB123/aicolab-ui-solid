/** @jsxImportSource @solidjs/web */
import { createSignal, onCleanup } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { UploadList, type UploadListItem } from '../../src/molecules/upload-list'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Molecules/UploadList',
	component: UploadList,
	parameters: { layout: 'centered' },
	argTypes: {
		...treatmentArgTypes,
		gap: { control: 'text', table: { category: 'knobs' } },
		radius: { control: 'text', table: { category: 'knobs' } },
		pad: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof UploadList>

export default meta
type Story = StoryObj<typeof meta>

const ITEMS: UploadListItem[] = [
	{
		key: 'a',
		name: 'alliance-briefing-deck.pdf',
		progress: 0.62,
		status: 'uploading',
		detail: '48.2 MB · 3.1 MB/s',
	},
	{ key: 'b', name: 'workshop-recording.mp4', progress: 1, status: 'done', detail: '1.2 GB' },
	{
		key: 'c',
		name: 'field-notes.docx',
		progress: 0.2,
		status: 'error',
		error: 'Connection lost — resume to continue.',
	},
]

export const Playground: Story = {
	args: {
		label: 'Uploads',
		items: ITEMS,
		onCancelItem: (key) => console.log('[upload-list story] cancel', key),
		onDismissItem: (key) => console.log('[upload-list story] dismiss', key),
	},
	render: (args) => <div style={{ width: '420px' }}><UploadList {...args} /></div>,
}

export const Live: Story = {
	render: () => {
		const [progress, setProgress] = createSignal(0)
		const timer = setInterval(() => setProgress((value) => (value >= 1 ? 0 : value + 0.02)), 120)
		onCleanup(() => clearInterval(timer))
		return (
			<div style={{ width: '420px' }}>
				<UploadList
					label="Uploads"
					items={[
						{
							key: 'live',
							name: 'quarterly-video.mp4',
							progress: progress(),
							status: 'uploading',
							detail: `${Math.round(progress() * 840)} MB of 840 MB`,
						},
					]}
					onCancelItem={() => setProgress(0)}
				/>
			</div>
		)
	},
}

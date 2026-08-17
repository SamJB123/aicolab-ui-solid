/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Button } from '../../src/atoms/button'
import { toast, ToastHost } from '../../src/organisms/toast'

const meta = {
	title: 'Organisms/Toast',
	component: ToastHost,
	parameters: { layout: 'centered' },
	argTypes: {
		inset: { control: 'text', table: { category: 'knobs' } },
		gap: { control: 'text', table: { category: 'knobs' } },
		width: { control: 'text', table: { category: 'knobs' } },
		radius: { control: 'text', table: { category: 'knobs' } },
		pad: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof ToastHost>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {},
	render: (args) => (
		<>
			<div style={{ display: 'flex', gap: '8px', 'flex-wrap': 'wrap' }}>
				<Button onClick={() => toast('Link copied to clipboard')}>Neutral</Button>
				<Button colorBase="success" onClick={() => toast.success('Invite sent to zach@example.org')}>
					Success
				</Button>
				<Button colorBase="info" onClick={() => toast.info('3 files still uploading', { detail: 'Keep this tab open.' })}>
					Info
				</Button>
				<Button colorBase="warning" onClick={() => toast.warning('Storage almost full', { detail: '18.7 GB of 20 GB used.' })}>
					Warning
				</Button>
				<Button
					colorBase="error"
					onClick={() => toast.error('Upload failed', { detail: 'slides.pdf — connection lost. Sticky until dismissed.' })}
				>
					Error (sticky)
				</Button>
			</div>
			<ToastHost {...args} />
		</>
	),
}

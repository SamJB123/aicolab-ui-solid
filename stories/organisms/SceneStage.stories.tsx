/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Button, SceneStage, type SceneStageAdapter } from '../../src'

type SceneCommand = { color: string }
type SceneEvents = { onSelect: (label: string) => void }

const adapter: SceneStageAdapter<SceneCommand, SceneEvents> = {
	mount: ({ canvas, host, events, onReady }) => {
		const context = canvas.getContext('2d')
		let current: SceneCommand = { color: '#fcb700' }
		const draw = (): void => {
			if (!context) return
			const ratio = window.devicePixelRatio
			canvas.width = Math.max(1, Math.round(host.clientWidth * ratio))
			canvas.height = Math.max(1, Math.round(host.clientHeight * ratio))
			context.setTransform(ratio, 0, 0, ratio, 0, 0)
			context.fillStyle = '#000512'
			context.fillRect(0, 0, host.clientWidth, host.clientHeight)
			context.fillStyle = current.color
			context.beginPath()
			context.arc(host.clientWidth / 2, host.clientHeight / 2, 72, 0, Math.PI * 2)
			context.fill()
		}
		const resize = new ResizeObserver(draw)
		resize.observe(host)
		const onClick = (): void => events().onSelect('Signal sphere')
		canvas.addEventListener('click', onClick)
		draw()
		onReady()
		return {
			updateCommand: (next) => {
				current = next
				draw()
			},
			dispose: () => {
				resize.disconnect()
				canvas.removeEventListener('click', onClick)
			},
		}
	},
}

const meta = {
	title: 'Organisms/SceneStage',
	parameters: { layout: 'centered' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const InteractiveAdapter: Story = {
	render: () => {
		const [color, setColor] = createSignal('#fcb700')
		const [selection, setSelection] = createSignal('Nothing selected')
		return (
			<div style={{ display: 'grid', gap: '0.75rem', width: 'min(42rem, 85vw)' }}>
				<div style={{ height: '24rem' }}>
					<SceneStage
						adapter={adapter}
						command={{ color: color() }}
						events={{ onSelect: setSelection }}
						configuration={undefined}
						label="Interactive signal sphere"
					/>
				</div>
				<div style={{ display: 'flex', gap: '0.5rem', 'align-items': 'center' }}>
					<Button onClick={() => setColor(color() === '#fcb700' ? '#b9c27a' : '#fcb700')}>
						Change scene command
					</Button>
					<span role="status">{selection()}</span>
				</div>
			</div>
		)
	},
}

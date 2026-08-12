/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import {
	AttributionMark, AttributionSwatch, ButtonLink, createAttributionColor, HoldButton,
	Notice, Presence, PresenceSwatch, StageHint, VisuallyHidden,
} from '../../src'

const meta = {
	title: 'Atoms/Utility atoms',
	component: Notice,
} satisfies Meta<typeof Notice>

export default meta
type Story = StoryObj<typeof meta>

export const NoticeTreatments: Story = {
	render: () => (
		<div style={{ display: 'grid', gap: '0.75rem', width: 'min(34rem, 90vw)' }}>
			<Notice colorBase="info" variant="soft">A new version of this note is available.</Notice>
			<Notice colorBase="warning" variant="outline">This session begins in ten minutes.</Notice>
			<Notice colorBase="error" role="alert">Connection lost.</Notice>
		</div>
	),
}

export const HoldInteraction: Story = {
	render: () => {
		const [pressed, setPressed] = createSignal(false)
		return (
			<div style={{ display: 'flex', gap: '1rem', 'align-items': 'center' }}>
				<HoldButton colorBase="warning" onPressedChange={setPressed}>Hold to speak</HoldButton>
				<span role="status">{pressed() ? 'Speaking…' : 'Idle'}</span>
			</div>
		)
	},
}

export const PresenceAndAttribution: Story = {
	render: () => {
		const colorFor = createAttributionColor()
		return (
			<div style={{ display: 'grid', gap: '1rem' }}>
				<Presence>
					<PresenceSwatch identity="Ada" /><PresenceSwatch identity="Lin" /><PresenceSwatch identity="Sam" />
				</Presence>
				<div style={{ display: 'flex', gap: '0.5rem', 'align-items': 'center' }}>
					<AttributionSwatch identity="Ada" colorFor={colorFor} />
					<AttributionMark identity="Ada" colorFor={colorFor}>Ada added this sentence.</AttributionMark>
				</div>
			</div>
		)
	},
}

export const StageGuidance: Story = {
	render: () => <div style={{ position: 'relative', height: '12rem', background: 'var(--color-base-300)' }}><StageHint>Select an object · drag to orbit</StageHint></div>,
}

export const NativeLinkAndHiddenText: Story = {
	render: () => <ButtonLink href="#destination" variant="outline">Read the guide<VisuallyHidden> about cooperative governance</VisuallyHidden></ButtonLink>,
}

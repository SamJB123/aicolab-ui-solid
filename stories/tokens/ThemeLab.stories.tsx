/** @jsxImportSource @solidjs/web */
// Theme Lab — the shared theme studio (src/theme-studio) over Storybook's
// theme, which is ui-solid's own defaults. The studio edits every anchor for
// light and dark side by side, the font roles, the type scale and the radius
// ladder; its catalogue renders the components in both schemes at once, so
// view this story in Auto, Light or Dark (Split mounts the studio twice).
//
// The draft is saved under its own key, separate from any app's, and taken
// with you across reloads of this Storybook.
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import '../../src/theme-studio/styles.css'
import { ThemeStudio } from '../../src/theme-studio'

const meta = {
	title: 'Foundations/Theme Lab',
	component: ThemeStudio,
	parameters: { layout: 'fullscreen' },
	args: { storageKey: 'ui-solid:storybook-theme-draft' },
} satisfies Meta<typeof ThemeStudio>

export default meta
type Story = StoryObj<typeof meta>

export const Lab: Story = {
	name: 'Theme Lab (all tokens live)',
}

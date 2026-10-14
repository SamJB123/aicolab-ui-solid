/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { NavLink, NavLinks } from '../../src/molecules/nav-links'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Molecules/NavLinks',
	component: NavLinks,
	parameters: { layout: 'centered' },
	argTypes: {
		...treatmentArgTypes,
		label: { control: 'text' },
		radius: { control: 'text', table: { category: 'knobs' } },
		padBlock: { control: 'text', table: { category: 'knobs' } },
		padInline: { control: 'text', table: { category: 'knobs' } },
		gap: { control: 'text', table: { category: 'knobs' } },
		fontSize: { control: 'text', table: { category: 'knobs' } },
		plateSurface: { control: 'text', table: { category: 'knobs' } },
		ink: { control: 'text', table: { category: 'knobs' } },
		currentInk: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof NavLinks>

export default meta
type Story = StoryObj<typeof meta>

const links = () => (
	<>
		<NavLink href="#" aria-current="page">
			Why we exist
		</NavLink>
		<NavLink href="#">Our model</NavLink>
		<NavLink href="#">Who we are</NavLink>
		<NavLink href="#">Events</NavLink>
	</>
)

/* The full anatomy: four links, one current, the plate behind it. Hover
   or tab across the links to see the plate glide. */
export const Playground: Story = {
	args: {
		label: 'Site',
		children: null,
	},
	render: (args) => <NavLinks {...args}>{links()}</NavLinks>,
}

/* No page is current (a home page whose link is not in the row): the
   plate stays hidden until a link is hovered or focused. */
export const NoCurrentPage: Story = {
	args: { label: 'Site', children: null },
	render: () => (
		<NavLinks label="Site">
			<NavLink href="#">Why we exist</NavLink>
			<NavLink href="#">Our model</NavLink>
			<NavLink href="#">Who we are</NavLink>
		</NavLinks>
	),
}

/* A treated row: the plate takes the family's selected surface and rim,
   the words its line colour. */
export const Treated: Story = {
	args: { label: 'Site', children: null },
	render: () => (
		<div style={{ display: 'grid', gap: '16px', 'justify-items': 'start' }}>
			<NavLinks label="Site" colorBase="primary">
				{links()}
			</NavLinks>
			<NavLinks label="Site" colorBase="info" radius="var(--r-md)">
				{links()}
			</NavLinks>
		</div>
	),
}

// Theme Lab preset swatches — curated starting points for the token contract.
//
// Light and dark presets are INDEPENDENT rails. Each preset authors only the
// four core theme anchors for one scheme: surface, content, primary and
// success. A preset may additionally pin semantic families when it represents
// a shipped theme; otherwise the browser derives/defaults those family roles.
// Most presets explore the bee/hive gold identity; a few wildcards roam
// further afield for contrast. All palettes are contrast-checked: content/base
// ≥ 12:1, success ≥ the canonical theme's own ratios. Light accents trade a
// little ink contrast for chroma (≥ 3.5:1) — darker yellows read as drab
// brown, so the golds here keep full saturation (amber/orange hues) and
// lean on weight/size where they're used as ink.
//
// MARIGOLD, the original stand-out of this rail, was PROMOTED to the
// canonical light scheme (2026-08-07) — it now lives in theme-defaults.css and
// appears as the canonical card at the head of the light rail rather than
// as an entry here.

export type SchemeValues = {
	base: string
	content: string
	primary: string
	success: string
	secondary?: string
	accent?: string
	neutral?: string
	info?: string
	warning?: string
	error?: string
}

export type ThemePreset = {
	name: string
	/** One-line mood description shown on the swatch card. */
	note: string
	values: SchemeValues
}

export const LIGHT_PRESETS: ThemePreset[] = [
	{
		name: 'Honey Pop',
		note: 'Warm white, saturated honey amber',
		values: {
			base: '#ffffff',
			content: '#221a0a',
			primary: '#c17000',
			success: '#2f9440',
		},
	},
	{
		name: 'Nectar Flame',
		note: 'Cream surfaces, blazing nectar orange',
		values: {
			base: '#ffffff',
			content: '#251b10',
			primary: '#cc4d00',
			success: '#3d9147',
		},
	},
	{
		name: 'Golden Hour',
		note: 'Pale gold wash, molten gold primary',
		values: {
			base: '#fffefa',
			content: '#201a0c',
			primary: '#b47500',
			success: '#3a9146',
		},
	},
	{
		name: 'Bee Sting',
		note: 'Crisp white, near-black ink, bold gold',
		values: {
			base: '#ffffff',
			content: '#111008',
			primary: '#c07300',
			success: '#2e9245',
		},
	},
	{
		name: 'Clover Honey',
		note: 'Green-tinged pasture, deep honey',
		values: {
			base: '#ffffff',
			content: '#1d2814',
			primary: '#bd6d00',
			success: '#2c9147',
		},
	},
	{
		name: 'Amber Glass',
		note: 'Warm ivory, amber leaning ember-red',
		values: {
			base: '#fffefb',
			content: '#271d0f',
			primary: '#cf5f10',
			success: '#45923c',
		},
	},
	{
		name: 'Insight Museum',
		note: 'Parchment galleries, deep evergreen controls',
		values: {
			base: '#fff4ce',
			content: '#172a25',
			primary: '#263b33',
			success: '#3f735a',
		},
	},
	{
		name: 'Harbour Day',
		note: 'Wildcard — cool harbour light, punchy cobalt',
		values: {
			base: '#ffffff',
			content: '#14202c',
			primary: '#1d63d8',
			success: '#2e9257',
		},
	},
	{
		name: 'Raspberry Fields',
		note: 'Wildcard — blush white, vivid raspberry',
		values: {
			base: '#ffffff',
			content: '#2a151b',
			primary: '#d61f5f',
			success: '#3b9150',
		},
	},
	{
		name: 'Violet Nectar',
		note: 'Wildcard — lilac white, electric violet',
		values: {
			base: '#ffffff',
			content: '#1e1930',
			primary: '#6d3ee0',
			success: '#3b9150',
		},
	},
]

export const DARK_PRESETS: ThemePreset[] = [
	{
		name: 'Midnight Hive',
		note: 'Near-black warmth, lantern gold',
		values: {
			base: '#201a0e',
			content: '#f2e8d2',
			primary: '#f0b43c',
			success: '#6cb083',
		},
	},
	{
		name: 'Lantern Glow',
		note: 'Warm brown dusk, orange-gold flame',
		values: {
			base: '#2a1e0c',
			content: '#f5e9cf',
			primary: '#ffc250',
			success: '#79b06a',
		},
	},
	{
		name: 'Smoked Cedar',
		note: 'Smoky neutral wood, muted gold',
		values: {
			base: '#242017',
			content: '#e8e0cf',
			primary: '#d9a94a',
			success: '#74a67c',
		},
	},
	{
		name: 'Nocturne Meadow',
		note: 'Moonlit green-black, fireflies',
		values: {
			base: '#1b241c',
			content: '#e3e9da',
			primary: '#e5b34f',
			success: '#7fc08a',
		},
	},
	{
		name: 'Amber Vault',
		note: 'Deep espresso, strong amber',
		values: {
			base: '#24180c',
			content: '#f0e2cc',
			primary: '#ffb340',
			success: '#6aa871',
		},
	},
	{
		name: 'Obsidian Comb',
		note: 'True near-black, pure gold, high contrast',
		values: {
			base: '#191815',
			content: '#efece2',
			primary: '#ecc043',
			success: '#72b088',
		},
	},
	{
		name: 'Propolis',
		note: 'Reddish resin brown, worked gold',
		values: {
			base: '#281a0e',
			content: '#f1e4d0',
			primary: '#e8a83e',
			success: '#7fae6e',
		},
	},
	{
		name: 'Harbour Night',
		note: 'Wildcard — navy slate, brass lantern',
		values: {
			base: '#1a222c',
			content: '#dfe6ec',
			primary: '#f0b83d',
			success: '#6fb392',
		},
	},
	{
		name: 'Velvet Plum',
		note: 'Wildcard — plum dark, rose primary',
		values: {
			base: '#241a26',
			content: '#ece2ea',
			primary: '#e88ca0',
			success: '#7bb389',
		},
	},
	{
		name: 'Kelp Tide',
		note: 'Wildcard — teal ink, warm sand',
		values: {
			base: '#152426',
			content: '#dce8e6',
			primary: '#e5c07b',
			success: '#79c197',
		},
	},
]

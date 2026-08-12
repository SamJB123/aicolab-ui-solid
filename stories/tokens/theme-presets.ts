// Theme Lab preset swatches — curated starting points for the token contract.
//
// Light and dark presets are INDEPENDENT rails: a preset carries the seven
// authored colour tokens for ONE scheme, so any light pick can be combined
// with any dark pick (derived tokens recompute from text/accent for free).
// Most presets explore the bee/hive gold identity; a few wildcards roam
// further afield for contrast. All palettes are contrast-checked: text/page
// ≥ 12:1, live ≥ the canonical theme's own ratios. Light accents trade a
// little ink contrast for chroma (≥ 3.5:1) — darker yellows read as drab
// brown, so the golds here keep full saturation (amber/orange hues) and
// lean on weight/size where they're used as ink.
//
// MARIGOLD, the original stand-out of this rail, was PROMOTED to the
// canonical light scheme (2026-08-07) — it now lives in theme.css and
// appears as the canonical card at the head of the light rail rather than
// as an entry here.

export type SchemeValues = {
	page: string
	page2: string
	panel: string
	panel2: string
	text: string
	accent: string
	live: string
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
			page: '#fffcf2',
			page2: '#f7eed4',
			panel: '#ffffff',
			panel2: '#fcf5df',
			text: '#221a0a',
			accent: '#c17000',
			live: '#2f9440',
		},
	},
	{
		name: 'Nectar Flame',
		note: 'Cream surfaces, blazing nectar orange',
		values: {
			page: '#fffaf3',
			page2: '#f7ecd9',
			panel: '#ffffff',
			panel2: '#fcf4e5',
			text: '#251b10',
			accent: '#cc4d00',
			live: '#3d9147',
		},
	},
	{
		name: 'Golden Hour',
		note: 'Pale gold wash, molten gold accent',
		values: {
			page: '#fdf7e7',
			page2: '#f2e8c8',
			panel: '#fffefa',
			panel2: '#f8f0d6',
			text: '#201a0c',
			accent: '#b47500',
			live: '#3a9146',
		},
	},
	{
		name: 'Bee Sting',
		note: 'Crisp white, near-black ink, bold gold',
		values: {
			page: '#fdfdf9',
			page2: '#f0eee2',
			panel: '#ffffff',
			panel2: '#f7f5ea',
			text: '#111008',
			accent: '#c07300',
			live: '#2e9245',
		},
	},
	{
		name: 'Clover Honey',
		note: 'Green-tinged pasture, deep honey',
		values: {
			page: '#f7faf0',
			page2: '#e7efd7',
			panel: '#ffffff',
			panel2: '#f0f5e2',
			text: '#1d2814',
			accent: '#bd6d00',
			live: '#2c9147',
		},
	},
	{
		name: 'Amber Glass',
		note: 'Warm ivory, amber leaning ember-red',
		values: {
			page: '#fdf9f0',
			page2: '#f4ead4',
			panel: '#fffefb',
			panel2: '#f9f1df',
			text: '#271d0f',
			accent: '#cf5f10',
			live: '#45923c',
		},
	},
	{
		name: 'Insight Museum',
		note: 'Parchment galleries, deep evergreen controls',
		values: {
			page: '#eee6c9',
			page2: '#d8ca9f',
			panel: '#fff4ce',
			panel2: '#e7dcc0',
			text: '#172a25',
			accent: '#263b33',
			live: '#3f735a',
		},
	},
	{
		name: 'Harbour Day',
		note: 'Wildcard — cool harbour light, punchy cobalt',
		values: {
			page: '#f6f9fc',
			page2: '#e5edf5',
			panel: '#ffffff',
			panel2: '#eef3f9',
			text: '#14202c',
			accent: '#1d63d8',
			live: '#2e9257',
		},
	},
	{
		name: 'Raspberry Fields',
		note: 'Wildcard — blush white, vivid raspberry',
		values: {
			page: '#fffafb',
			page2: '#f8eaee',
			panel: '#ffffff',
			panel2: '#fbf1f4',
			text: '#2a151b',
			accent: '#d61f5f',
			live: '#3b9150',
		},
	},
	{
		name: 'Violet Nectar',
		note: 'Wildcard — lilac white, electric violet',
		values: {
			page: '#faf8ff',
			page2: '#eee9f9',
			panel: '#ffffff',
			panel2: '#f4f0fb',
			text: '#1e1930',
			accent: '#6d3ee0',
			live: '#3b9150',
		},
	},
]

export const DARK_PRESETS: ThemePreset[] = [
	{
		name: 'Midnight Hive',
		note: 'Near-black warmth, lantern gold',
		values: {
			page: '#120f08',
			page2: '#1a150b',
			panel: '#201a0e',
			panel2: '#292112',
			text: '#f2e8d2',
			accent: '#f0b43c',
			live: '#6cb083',
		},
	},
	{
		name: 'Lantern Glow',
		note: 'Warm brown dusk, orange-gold flame',
		values: {
			page: '#191207',
			page2: '#221809',
			panel: '#2a1e0c',
			panel2: '#342610',
			text: '#f5e9cf',
			accent: '#ffc250',
			live: '#79b06a',
		},
	},
	{
		name: 'Smoked Cedar',
		note: 'Smoky neutral wood, muted gold',
		values: {
			page: '#16130e',
			page2: '#1d1913',
			panel: '#242017',
			panel2: '#2d281d',
			text: '#e8e0cf',
			accent: '#d9a94a',
			live: '#74a67c',
		},
	},
	{
		name: 'Nocturne Meadow',
		note: 'Moonlit green-black, fireflies',
		values: {
			page: '#0f1410',
			page2: '#151c16',
			panel: '#1b241c',
			panel2: '#232d24',
			text: '#e3e9da',
			accent: '#e5b34f',
			live: '#7fc08a',
		},
	},
	{
		name: 'Amber Vault',
		note: 'Deep espresso, strong amber',
		values: {
			page: '#140e08',
			page2: '#1c130a',
			panel: '#24180c',
			panel2: '#2e1f10',
			text: '#f0e2cc',
			accent: '#ffb340',
			live: '#6aa871',
		},
	},
	{
		name: 'Obsidian Comb',
		note: 'True near-black, pure gold, high contrast',
		values: {
			page: '#0c0b09',
			page2: '#131210',
			panel: '#191815',
			panel2: '#21201b',
			text: '#efece2',
			accent: '#ecc043',
			live: '#72b088',
		},
	},
	{
		name: 'Propolis',
		note: 'Reddish resin brown, worked gold',
		values: {
			page: '#171008',
			page2: '#20150b',
			panel: '#281a0e',
			panel2: '#322112',
			text: '#f1e4d0',
			accent: '#e8a83e',
			live: '#7fae6e',
		},
	},
	{
		name: 'Harbour Night',
		note: 'Wildcard — navy slate, brass lantern',
		values: {
			page: '#0e1319',
			page2: '#141b23',
			panel: '#1a222c',
			panel2: '#222c37',
			text: '#dfe6ec',
			accent: '#f0b83d',
			live: '#6fb392',
		},
	},
	{
		name: 'Velvet Plum',
		note: 'Wildcard — plum dark, rose accent',
		values: {
			page: '#150f16',
			page2: '#1d151e',
			panel: '#241a26',
			panel2: '#2e2130',
			text: '#ece2ea',
			accent: '#e88ca0',
			live: '#7bb389',
		},
	},
	{
		name: 'Kelp Tide',
		note: 'Wildcard — teal ink, warm sand',
		values: {
			page: '#0b1416',
			page2: '#101c1e',
			panel: '#152426',
			panel2: '#1c2e30',
			text: '#dce8e6',
			accent: '#e5c07b',
			live: '#79c197',
		},
	},
]

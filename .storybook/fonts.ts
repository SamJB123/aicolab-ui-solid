// Curated Google Fonts candidates for the package's font roles
// (--font-display / --font-sans / --font-data / --font-label), plus an
// on-demand loader.
//
// `spec` is the css2 API family value (axes must be alphabetical; ranges are
// each family's published variable axes — static families list fixed
// weights). `id: 'default'` means "whatever theme.css declares" — nothing is
// loaded and the token is left untouched. For the LABEL role, "default"
// means UNSET: the micro-label voice (eyebrows/chips/kickers/field labels)
// falls back to whatever --font-data resolves to.

export type FontRole = 'display' | 'sans' | 'data' | 'label'
export const FONT_ROLES: FontRole[] = ['display', 'sans', 'data', 'label']

export type FontOption = {
	id: string
	label: string
	/** Google Fonts css2 family spec — absent for the theme default. */
	spec?: string
	/** The value written to the --font-* token — absent for the theme default. */
	stack?: string
}

export const FONT_OPTIONS: Record<FontRole, FontOption[]> = {
	display: [
		{ id: 'default', label: 'Theme default' },
		{
			id: 'fraunces',
			label: 'Fraunces',
			spec: 'Fraunces:opsz,wght@9..144,100..900',
			stack: '"Fraunces", Georgia, serif',
		},
		{
			id: 'playfair',
			label: 'Playfair Display',
			spec: 'Playfair Display:wght@400..900',
			stack: '"Playfair Display", Georgia, serif',
		},
		{
			id: 'dm-serif',
			label: 'DM Serif Display',
			spec: 'DM Serif Display',
			stack: '"DM Serif Display", Georgia, serif',
		},
		{
			id: 'newsreader',
			label: 'Newsreader',
			spec: 'Newsreader:opsz,wght@6..72,200..800',
			stack: '"Newsreader", Georgia, serif',
		},
		{
			id: 'space-grotesk',
			label: 'Space Grotesk',
			spec: 'Space Grotesk:wght@300..700',
			stack: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
		},
		{
			id: 'bricolage',
			label: 'Bricolage Grotesque',
			spec: 'Bricolage Grotesque:opsz,wght@12..96,200..800',
			stack: '"Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif',
		},
		{
			id: 'sora',
			label: 'Sora',
			spec: 'Sora:wght@100..800',
			stack: '"Sora", ui-sans-serif, system-ui, sans-serif',
		},
		// ── 2025-26 emerging picks (probed live against the css2 API) ──
		{
			id: 'instrument-serif',
			label: 'Instrument Serif',
			spec: 'Instrument Serif:ital@0;1',
			stack: '"Instrument Serif", Georgia, serif',
		},
		{
			id: 'young-serif',
			label: 'Young Serif',
			spec: 'Young Serif',
			stack: '"Young Serif", Georgia, serif',
		},
		{
			id: 'epunda-slab',
			label: 'Epunda Slab',
			spec: 'Epunda Slab:wght@300..900',
			stack: '"Epunda Slab", Georgia, serif',
		},
		{
			id: 'funnel-display',
			label: 'Funnel Display',
			spec: 'Funnel Display:wght@300..800',
			stack: '"Funnel Display", ui-sans-serif, system-ui, sans-serif',
		},
		{
			id: 'bacasime',
			label: 'Bacasime Antique',
			spec: 'Bacasime Antique',
			stack: '"Bacasime Antique", Georgia, serif',
		},
	],
	sans: [
		{ id: 'default', label: 'Theme default' },
		{
			id: 'inter',
			label: 'Inter',
			spec: 'Inter:opsz,wght@14..32,100..900',
			stack: '"Inter", ui-sans-serif, system-ui, sans-serif',
		},
		{
			id: 'dm-sans',
			label: 'DM Sans',
			spec: 'DM Sans:opsz,wght@9..40,100..1000',
			stack: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
		},
		{
			id: 'source-sans',
			label: 'Source Sans 3',
			spec: 'Source Sans 3:wght@200..900',
			stack: '"Source Sans 3", ui-sans-serif, system-ui, sans-serif',
		},
		{
			id: 'public-sans',
			label: 'Public Sans',
			spec: 'Public Sans:wght@100..900',
			stack: '"Public Sans", ui-sans-serif, system-ui, sans-serif',
		},
		{
			id: 'manrope',
			label: 'Manrope',
			spec: 'Manrope:wght@200..800',
			stack: '"Manrope", ui-sans-serif, system-ui, sans-serif',
		},
		{
			id: 'instrument',
			label: 'Instrument Sans',
			spec: 'Instrument Sans:wght@400..700',
			stack: '"Instrument Sans", ui-sans-serif, system-ui, sans-serif',
		},
		{
			id: 'plex-sans',
			label: 'IBM Plex Sans',
			spec: 'IBM Plex Sans:wght@400;500;600;700',
			stack: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
		},
		{
			id: 'atkinson',
			label: 'Atkinson Hyperlegible',
			spec: 'Atkinson Hyperlegible:wght@400;700',
			stack: '"Atkinson Hyperlegible", ui-sans-serif, system-ui, sans-serif',
		},
		// ── 2025-26 emerging picks (probed live against the css2 API) ──
		{
			id: 'zalando',
			label: 'Zalando Sans',
			spec: 'Zalando Sans:ital,wght@0,200..900;1,200..900',
			stack: '"Zalando Sans", ui-sans-serif, system-ui, sans-serif',
		},
		{
			id: 'onest',
			label: 'Onest',
			spec: 'Onest:wght@100..900',
			stack: '"Onest", ui-sans-serif, system-ui, sans-serif',
		},
		{
			id: 'hanken',
			label: 'Hanken Grotesk',
			spec: 'Hanken Grotesk:wght@100..900',
			stack: '"Hanken Grotesk", ui-sans-serif, system-ui, sans-serif',
		},
		{
			id: 'familjen',
			label: 'Familjen Grotesk',
			spec: 'Familjen Grotesk:wght@400..700',
			stack: '"Familjen Grotesk", ui-sans-serif, system-ui, sans-serif',
		},
		{
			id: 'schibsted',
			label: 'Schibsted Grotesk',
			spec: 'Schibsted Grotesk:wght@400..900',
			stack: '"Schibsted Grotesk", ui-sans-serif, system-ui, sans-serif',
		},
	],
	data: [
		{ id: 'default', label: 'Theme default' },
		{
			id: 'jetbrains',
			label: 'JetBrains Mono',
			spec: 'JetBrains Mono:wght@100..800',
			stack: '"JetBrains Mono", ui-monospace, "SFMono-Regular", monospace',
		},
		{
			id: 'plex-mono',
			label: 'IBM Plex Mono',
			spec: 'IBM Plex Mono:wght@400;500;600;700',
			stack: '"IBM Plex Mono", ui-monospace, "SFMono-Regular", monospace',
		},
		{
			id: 'fira-code',
			label: 'Fira Code',
			spec: 'Fira Code:wght@300..700',
			stack: '"Fira Code", ui-monospace, "SFMono-Regular", monospace',
		},
		{
			id: 'space-mono',
			label: 'Space Mono',
			spec: 'Space Mono:wght@400;700',
			stack: '"Space Mono", ui-monospace, "SFMono-Regular", monospace',
		},
		{
			id: 'source-code',
			label: 'Source Code Pro',
			spec: 'Source Code Pro:wght@200..900',
			stack: '"Source Code Pro", ui-monospace, "SFMono-Regular", monospace',
		},
		{
			id: 'spline-mono',
			label: 'Spline Sans Mono',
			spec: 'Spline Sans Mono:wght@300..700',
			stack: '"Spline Sans Mono", ui-monospace, "SFMono-Regular", monospace',
		},
		// ── 2025-26 emerging picks (probed live against the css2 API) ──
		{
			id: 'suse-mono',
			label: 'SUSE Mono',
			spec: 'SUSE Mono:wght@100..800',
			stack: '"SUSE Mono", ui-monospace, "SFMono-Regular", monospace',
		},
		{
			id: 'atkinson-mono',
			label: 'Atkinson Hyperlegible Mono',
			spec: 'Atkinson Hyperlegible Mono:wght@200..800',
			stack: '"Atkinson Hyperlegible Mono", ui-monospace, "SFMono-Regular", monospace',
		},
		{
			id: 'gsans-code',
			label: 'Google Sans Code',
			spec: 'Google Sans Code:wght@300..800',
			stack: '"Google Sans Code", ui-monospace, "SFMono-Regular", monospace',
		},
		{
			id: 'martian',
			label: 'Martian Mono',
			spec: 'Martian Mono:wght@100..800',
			stack: '"Martian Mono", ui-monospace, "SFMono-Regular", monospace',
		},
		{
			id: 'sono',
			label: 'Sono',
			spec: 'Sono:wght@200..800',
			stack: '"Sono", ui-monospace, "SFMono-Regular", monospace',
		},
	],
	// Micro-label voice (--font-label). Candidates reuse specs already
	// verified for the other roles: sans voices for a softer label look,
	// mono voices to keep the classic treatment but swap the family.
	label: [
		{ id: 'default', label: 'Theme default (follows Data)' },
		{
			id: 'space-grotesk',
			label: 'Space Grotesk',
			spec: 'Space Grotesk:wght@300..700',
			stack: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
		},
		{
			id: 'inter',
			label: 'Inter',
			spec: 'Inter:opsz,wght@14..32,100..900',
			stack: '"Inter", ui-sans-serif, system-ui, sans-serif',
		},
		{
			id: 'dm-sans',
			label: 'DM Sans',
			spec: 'DM Sans:opsz,wght@9..40,100..1000',
			stack: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
		},
		{
			id: 'manrope',
			label: 'Manrope',
			spec: 'Manrope:wght@200..800',
			stack: '"Manrope", ui-sans-serif, system-ui, sans-serif',
		},
		{
			id: 'plex-sans',
			label: 'IBM Plex Sans',
			spec: 'IBM Plex Sans:wght@400;500;600;700',
			stack: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
		},
		{
			id: 'jetbrains',
			label: 'JetBrains Mono',
			spec: 'JetBrains Mono:wght@100..800',
			stack: '"JetBrains Mono", ui-monospace, "SFMono-Regular", monospace',
		},
		{
			id: 'space-mono',
			label: 'Space Mono',
			spec: 'Space Mono:wght@400;700',
			stack: '"Space Mono", ui-monospace, "SFMono-Regular", monospace',
		},
		{
			id: 'plex-mono',
			label: 'IBM Plex Mono',
			spec: 'IBM Plex Mono:wght@400;500;600;700',
			stack: '"IBM Plex Mono", ui-monospace, "SFMono-Regular", monospace',
		},
		// ── 2025-26 emerging picks (probed live against the css2 API) ──
		{
			id: 'zalando',
			label: 'Zalando Sans',
			spec: 'Zalando Sans:ital,wght@0,200..900;1,200..900',
			stack: '"Zalando Sans", ui-sans-serif, system-ui, sans-serif',
		},
		{
			id: 'hanken',
			label: 'Hanken Grotesk',
			spec: 'Hanken Grotesk:wght@100..900',
			stack: '"Hanken Grotesk", ui-sans-serif, system-ui, sans-serif',
		},
		{
			id: 'sono',
			label: 'Sono',
			spec: 'Sono:wght@200..800',
			stack: '"Sono", ui-monospace, "SFMono-Regular", monospace',
		},
		{
			id: 'martian',
			label: 'Martian Mono',
			spec: 'Martian Mono:wght@100..800',
			stack: '"Martian Mono", ui-monospace, "SFMono-Regular", monospace',
		},
	],
}

export const fontOption = (role: FontRole, id: unknown): FontOption | undefined =>
	FONT_OPTIONS[role].find((o) => o.id === id)

/** Inject the Google Fonts css2 stylesheet for an option, once per family. */
export const ensureGoogleFontLoaded = (option: FontOption): void => {
	if (option.spec === undefined) return
	const linkId = `gf-${option.id}`
	if (document.getElementById(linkId)) return
	if (!document.getElementById('gf-preconnect')) {
		const pre = document.createElement('link')
		pre.id = 'gf-preconnect'
		pre.rel = 'preconnect'
		pre.href = 'https://fonts.gstatic.com'
		pre.crossOrigin = 'anonymous'
		document.head.append(pre)
	}
	const link = document.createElement('link')
	link.id = linkId
	link.rel = 'stylesheet'
	link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(option.spec).replaceAll('%3A', ':').replaceAll('%2C', ',').replaceAll('%3B', ';').replaceAll('%40', '@')}&display=swap`
	document.head.append(link)
}

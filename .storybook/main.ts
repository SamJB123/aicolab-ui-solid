// Storybook for @aicolab/ui-solid — Solid 2 (rc) via storybook-solidjs-vite.
//
// The framework preset (storybook-solidjs-vite@10.6) detects the installed
// solid-js major (2.0.0-rc.0 here) and mounts stories through its
// `solid-next` renderer (`render` from @solidjs/web, reactive globals/args
// stores). It also applies vite-plugin-solid automatically when the config
// has none — the workspace pins vite-plugin-solid@3.0.0-next.27, the old
// name's final release and a re-export shim over @solidjs/vite-plugin, whose
// babel-preset-solid (2.0.0-rc.0) compiles JSX against `@solidjs/web`.
//
// addon-docs + component docgen power autodocs and the MCP component
// manifest; addon-mcp serves it at /mcp in dev.
import { defineMain } from 'storybook-solidjs-vite'
import { mergeConfig } from 'vite'

export default defineMain({
	framework: 'storybook-solidjs-vite',
	stories: ['../stories/**/*.stories.tsx'],
	addons: ['@storybook/addon-docs', '@storybook/addon-mcp'],
	viteFinal: async (config) =>
		mergeConfig(config, {
			// Ship light-dark() (and the rest of the modern-CSS token contract)
			// natively instead of letting Lightning CSS downlevel it for vite's
			// default targets: the downlevel rewrites every token into a
			// --lightningcss-light/dark flag pair resolved at :root, which
			// breaks the preview's split-mode per-pane re-resolution (and this
			// package's stylesheet already requires @scope/@property-era
			// browsers anyway).
			build: { cssTarget: 'chrome130' },
		}),
})

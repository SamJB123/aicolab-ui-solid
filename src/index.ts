/**
 * @aicolab/ui-solid — shared Solid v2 UI primitives + token contract.
 *
 * Extracted from solid-playground's COMMONS dashboard. Apps define the
 * nine-colour / three-font token set on a theme root (see styles.css for
 * the contract) and import the structural stylesheet:
 *
 *   @import "@aicolab/ui-solid/styles.css";
 *   @source "<relative path to>/packages/ui-solid/src";
 */

export {
	Avatar,
	AvatarStack,
	Button,
	Chip,
	type ClassProp,
	Counter,
	Eyebrow,
	Meter,
	Panel,
	Rule,
	Sparkline,
	StatusDot,
	type StatusVisual,
	Waveform,
} from './primitives'

export { dismissOnOutside, Field, IconButton, Segmented, type SegOption } from './controls'

export {
	AccordionItem,
	Carousel,
	DocsShell,
	type DocsNavItem,
	type Feature,
	FeatureGrid,
	type LogoItem,
	LogoCloud,
	Mark,
	PageHero,
	Section,
	type Step,
	Steps,
} from './marketing'

export { type FacetItem, Facets, type FacetTabStyle } from './facets'

export { withScopedViewTransition, withViewTransition } from './vt'

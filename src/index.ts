/**
 * @aicolab/ui-solid — shared Solid v2 UI primitives + token contract.
 *
 * Extracted from solid-playground's COMMONS dashboard. Apps define the
 * semantic --color-* family/content palette and font roles on a theme root
 * (see styles.css for the contract) and import the structural stylesheet:
 *
 *   @import "@aicolab/ui-solid/styles.css";
 *   @source "<relative path to>/packages/ui-solid/src";
 */

export {
	addMonths,
	daysInMonth,
	firstWeekday,
	fmtRange,
	fmtTime,
	longWeekday,
	MONTHS,
	MonthCalendar,
	monthCells,
	monthIndex,
	sameDay,
	todayYMD,
	WEEKDAYS,
	weekdayOf,
	type YM,
	type YMD,
} from './calendar'
export { dismissOnOutside, Field, IconButton, Segmented, type SegOption } from './controls'
export { type FacetItem, Facets, type FacetTabStyle } from './facets'
export {
	AccordionItem,
	Accordion,
	type AccordionDensity,
	type AccordionSpacing,
	Carousel,
	type DocsNavItem,
	DocsShell,
	type Feature,
	FeatureGrid,
	LogoCloud,
	type LogoItem,
	Mark,
	PageHero,
	Section,
	type Step,
	Steps,
} from './marketing'
export { DatePicker, TimePicker } from './pickers'
export {
	Avatar,
	AvatarStack,
	Breadcrumb,
	type BreadcrumbItem,
	Button,
	Chip,
	type ClassProp,
	type Appearance,
	type ColorLevel,
	type ColorBase,
	type ColorTreatmentProps,
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
export { RadialMenu, type RadialMenuItem } from './radial-menu'

export { withScopedViewTransition, withViewTransition } from './vt'

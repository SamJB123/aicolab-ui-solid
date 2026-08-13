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
export { RichList, RichListItem, RichListMetadata } from './molecules/rich-list'
export { DatePicker, TimePicker } from './pickers'
export {
	Avatar,
	AvatarStack,
	AttributionMark,
	AttributionSwatch,
	attributionColor,
	Breadcrumb,
	type BreadcrumbItem,
	Button,
	ButtonLink,
	Chip,
	Counter,
	Eyebrow,
	HoldButton,
	Meter,
	Notice,
	NumberInput,
	Panel,
	Presence,
	PresenceSwatch,
	createAttributionColor,
	createResolvedAttributionColor,
	presenceColor,
	presenceSelectionColor,
	resolvePresenceColor,
	resolvePresenceRole,
	RangeInput,
	Rule,
	SelectControl,
	Sparkline,
	StageHint,
	StatusDot,
	TextArea,
	TextInput,
	type StatusVisual,
	Waveform,
	VisuallyHidden,
} from './primitives'
export {
	colorTreatmentData,
	type ClassProp,
	type ColorBase,
	type ColorLevel,
	type ColorTreatmentProps,
	type Variant,
} from './shared/color-treatment'
export {
	defineKnobs,
	mergeKnobStyle,
	type KnobProps,
	type KnobSpec,
	type KnobSyntax,
	type UiColor,
	type UiLength,
	type UiLengthPercentage,
} from './shared/knobs'
export {
	ApplicationHeader,
	ThemeToggle,
	type ThemeMode,
	Combobox,
	ToggleGroup,
	type ToggleOption,
	ToolPanel,
	ToolPanelActions,
	ToolPanelList,
	ToolPanelSection,
} from './molecules'
export {
	AdaptiveModalSheet,
	CommandPalette,
	CommandPaletteTrigger,
	type CommandPaletteItem,
	BottomNavigation,
	BottomNavigationCentreContent,
	type BottomNavigationItem,
	InspectorHeader,
	RaisedSheet,
	RadialMenu,
	type RadialMenuItem,
	SceneStage,
	type SceneStageAdapter,
	type SceneStageController,
	type SceneStageMountContext,
	ResponsiveInspector,
	type InspectorDetent,
	WorkspaceNavigation,
	WorkspaceNavigationGroup,
	WorkspaceNavigationItem,
	WorkspaceNavigationList,
	WorkspaceShell,
	WorkspaceStage,
	WorkspaceStageTooltip,
} from './organisms'

export { withScopedViewTransition, withViewTransition } from './vt'

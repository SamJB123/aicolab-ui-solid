// Theme studio compartment of @aicolab/ui-solid: the theme contract as data,
// a reader for a document's own theme, the stored-draft boot script, and the
// ThemeStudio editor itself. Import its stylesheet where the studio mounts:
//   @import "@aicolab/ui-solid/theme-studio/styles.css";

export { type ColorAnchor, COLOR_ANCHORS, FONT_TOKENS, type Scheme, SCHEMES, SIZE_LADDERS, type SizeLadder } from './contract'
export {
	applyDraft,
	applyDraftFonts,
	DRAFT_BOOT_ATTRIBUTE,
	DRAFT_FONTS_LINK_ID,
	readStoredDraft,
	type ThemeDraft,
	themeDraftBootScript,
	writeStoredDraft,
} from './draft'
export {
	ensureAllCandidatesLoaded,
	ensureGoogleFontLoaded,
	FONT_OPTIONS,
	FONT_ROLE_NAMES,
	FONT_ROLES,
	type FontOption,
	type FontRole,
	fontOption,
	fontOptionForStack,
	fontToken,
	googleFontsHref,
	leadingFamily,
} from './fonts'
export { type PreviewPage } from './frames'
export { DARK_PRESETS, LIGHT_PRESETS, type SchemeValues, type ThemeFinish, type ThemePreset } from './presets'
export {
	joinLightDark,
	type RegisteredToken,
	readRegisteredTokens,
	readThemeSource,
	specificity,
	splitLightDark,
	type ThemeSource,
} from './read-theme'
export { ThemeStudio, type ThemeStudioProps } from './studio'

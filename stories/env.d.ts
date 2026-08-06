// Side-effect CSS imports (theme.css / styles.css / preview.css) for the
// Storybook entry files — vite resolves them; this keeps `tsc` honest under
// `noUncheckedSideEffectImports`.
declare module '*.css'

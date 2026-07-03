// Presentational start-menu item. The reference coupled items to its Convex
// process kinds; here an item is pure data + an optional onSelect, and the
// host decides what selecting it does (launch an app, open a link, ...).
// `separatorBefore` replaces the reference's hard-coded separator indexes so
// a registry-driven menu controls its own grouping.
export interface StartMenuItemData {
  icon: string;
  label: string;
  subtitle?: string;
  expanded?: boolean;
  // Renders with a not-allowed cursor; host may still receive the click to
  // surface an error/toast (the reference's "does nothing right now").
  disabled?: boolean;
  separatorBefore?: boolean;
  onSelect?: () => void;
}

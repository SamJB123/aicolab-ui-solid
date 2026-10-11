// A theme draft: the tokens a person has changed, as the values to write on a
// theme root (`--color-primary` → `light-dark(#c4471d, #ff6a3d)`). Applied as
// inline custom properties on <html>, a draft outranks every stylesheet, so
// the site's own theme shows through wherever the draft is silent.
//
// Persisted per origin in localStorage, so every page of the site picks it up:
// the host renders themeDraftBootScript() in its document <head>, which
// applies the stored draft before first paint and follows later saves from
// other tabs (the `storage` event).

export type ThemeDraft = Readonly<Record<string, string>>

type StoredDraft = {
	version: 1
	properties: ThemeDraft
	/** One Google Fonts stylesheet for the draft's font picks, if any. */
	fontsHref?: string
}

/** The id of the <link> that loads a draft's fonts, in any document. */
export const DRAFT_FONTS_LINK_ID = 'ui-theme-draft-fonts'

/** Set on <html> by the boot script, naming the key it applies — how the
 *  studio knows every page of the host applies a saved draft. */
export const DRAFT_BOOT_ATTRIBUTE = 'data-ui-theme-draft'

const isRecordOfStrings = (value: unknown): value is Record<string, string> =>
	typeof value === 'object' &&
	value !== null &&
	!Array.isArray(value) &&
	Object.values(value).every((v) => typeof v === 'string')

/** The stored draft, or an empty one when nothing (valid) is stored. */
export function readStoredDraft(storageKey: string): ThemeDraft {
	try {
		const raw = localStorage.getItem(storageKey)
		if (raw === null) return {}
		const parsed: unknown = JSON.parse(raw)
		if (typeof parsed !== 'object' || parsed === null || !('version' in parsed) || parsed.version !== 1) return {}
		const properties = 'properties' in parsed ? parsed.properties : undefined
		return isRecordOfStrings(properties) ? properties : {}
	} catch {
		return {}
	}
}

/** Store a draft (an empty draft removes the entry). Best-effort, like every
 *  localStorage write: a refusal leaves the current document unchanged. */
export function writeStoredDraft(storageKey: string, properties: ThemeDraft, fontsHref: string | undefined): void {
	try {
		if (Object.keys(properties).length === 0) {
			localStorage.removeItem(storageKey)
			return
		}
		const stored: StoredDraft = { version: 1, properties, ...(fontsHref ? { fontsHref } : {}) }
		localStorage.setItem(storageKey, JSON.stringify(stored))
	} catch {
		/* Storage refused (private mode, quota): the draft lives for this page only. */
	}
}

/** Write `next` onto an element's inline style, removing what `previous` set
 *  that `next` no longer does. */
export function applyDraft(el: HTMLElement, next: ThemeDraft, previous: ThemeDraft): void {
	for (const token of Object.keys(previous)) {
		if (!(token in next)) el.style.removeProperty(token)
	}
	for (const [token, value] of Object.entries(next)) el.style.setProperty(token, value)
}

/** Point a document's draft-fonts <link> at `href`, or remove it. */
export function applyDraftFonts(doc: Document, href: string | undefined): void {
	let link = doc.getElementById(DRAFT_FONTS_LINK_ID)
	if (!href) {
		link?.remove()
		return
	}
	if (!(link instanceof (doc.defaultView ?? window).HTMLLinkElement)) {
		link?.remove()
		const created = doc.createElement('link')
		created.id = DRAFT_FONTS_LINK_ID
		created.rel = 'stylesheet'
		doc.head.appendChild(created)
		link = created
	}
	if (link.getAttribute('href') !== href) link.setAttribute('href', href)
}

/**
 * Inline script for a document <head>: applies the stored draft to <html>
 * before first paint, loads its fonts, and re-applies whenever another tab
 * (or a same-origin frame's host) saves a new draft. Render it as
 * `<script innerHTML={themeDraftBootScript(key)} />`. It holds no theme
 * logic — it writes whatever properties the studio stored.
 */
export const themeDraftBootScript = (storageKey: string): string =>
	`(function(){var k=${JSON.stringify(storageKey)},r=document.documentElement,a=[];r.setAttribute(${JSON.stringify(DRAFT_BOOT_ATTRIBUTE)},k);function f(h){var l=document.getElementById(${JSON.stringify(DRAFT_FONTS_LINK_ID)});if(!h){if(l)l.remove();return}if(!l){l=document.createElement("link");l.id=${JSON.stringify(DRAFT_FONTS_LINK_ID)};l.rel="stylesheet";document.head.appendChild(l)}if(l.getAttribute("href")!==h)l.setAttribute("href",h)}function p(s){var d=null;try{d=s?JSON.parse(s):null}catch(e){}for(var i=0;i<a.length;i++)r.style.removeProperty(a[i]);a=[];if(!d||d.version!==1||!d.properties){f("");return}for(var n in d.properties){r.style.setProperty(n,d.properties[n]);a.push(n)}f(d.fontsHref||"")}try{p(localStorage.getItem(k))}catch(e){}addEventListener("storage",function(e){if(e.key===k)p(e.newValue)})})()`

#!/usr/bin/env python3
"""Regenerates xp.vendor.css / xp.tokens.css / xp.glyphs.css from upstream
xp.css. Deterministic — the generated files should never be hand-edited.

Usage (from this scripts/ directory):
  1. cp <somewhere>/node_modules/xp.css/dist/XP.css XP.min.css   # pristine v0.2.6
  2. npx prettier@3 --parser css XP.min.css > XP.pretty.css
  3. python3 tokenise-xp-css.py
"""
import re
from collections import Counter

SRC = "XP.pretty.css"
PKG = "../src/xp"

css = open(SRC).read()
# strip sourcemap comment
css = re.sub(r"/\*# sourceMappingURL=.*?\*/\s*$", "", css)

tokens: dict[str, str] = {}   # name -> default value (insertion order preserved)
counts: Counter = Counter()

def deftok(name: str, value: str) -> str:
    if name in tokens and tokens[name] != value:
        raise SystemExit(f"token {name} redefined: {tokens[name]!r} vs {value!r}")
    tokens[name] = value
    return f"var(--{name})"

# ---------- pass 1: whole-gradient tokens (match on whitespace-normalised value)
GRADIENT_MAP = [
    ("#0997ff", "xp-titlebar-gradient"),
    ("#cdcac3", "xp-button-active-gradient"),
    ("#d8d0c4", "xp-button-face-gradient"),
    ("#fafaf9", "xp-tab-button-gradient"),
    ("#fcfcfe", "xp-tabpanel-gradient"),
    ("135deg, #dcdcd7, #fff", "xp-control-bevel-gradient"),
    ("135deg, #b0b0a7, #e3e1d2", "xp-control-bevel-active-gradient"),
    ("#4cda50", "xp-progress-gradient"),
    # progress segment masks (white/transparent stripes over the green fill)
    ("#fff 2px", "xp-progress-segments"),
    ("transparent 8px", "xp-progress-mask"),
]

def norm(v: str) -> str:
    return re.sub(r"\s+", " ", v).strip()

def replace_decl(m: re.Match) -> str:
    prop, value, term = m.group(1), m.group(2), m.group(3)
    p = prop.strip().lower()
    v = norm(value)
    if "data:image" in v:
        return m.group(0)  # SVG data-URIs stay literal (see header comment)

    # gradients: tokenise the full gradient function
    if "linear-gradient(" in v:
        def grad_sub(gm: re.Match) -> str:
            g = norm(gm.group(0))
            for needle, name in GRADIENT_MAP:
                if needle in g:
                    counts[name] += 1
                    return deftok(name, g)
            return gm.group(0)
        v2 = re.sub(r"(?:repeating-)?linear-gradient\((?:[^()]|\([^()]*\))*\)", grad_sub, v)
        if v2 != v:
            return f"{prop.rstrip()}: {v2}{term}"
        v = v2

    color_maps = {
        "box-shadow": {"#fff": "xp-bevel-light", "#a9a9a9": "xp-bevel-dark",
                       "#9d9c99": "xp-bevel-mid", "#dfdfdf": "xp-bevel-soft",
                       "#0a0a0a": "xp-bevel-darkest", "#686868": "xp-bevel-frame",
                       "#808080": "xp-bevel-dark2", "#ece9d8": "xp-face"},
        "background": {"#ece9d8": "xp-face", "#fff": "xp-surface", "#dfdfdf": "xp-bevel-soft"},
        "background-color": {"#ece9d8": "xp-face", "#fff": "xp-surface", "#dfdfdf": "xp-bevel-soft"},
        "color": {"#fff": "xp-text-inverse", "#222": "xp-text", "#000": "xp-text-strong"},
        "border": {"#7f9db9": "xp-field-border", "#686868": "xp-bevel-frame",
                   "#fff": "xp-bevel-light", "#222": "xp-text"},
        "border-color": {"#7f9db9": "xp-field-border", "#686868": "xp-bevel-frame"},
        "outline": {"#000": "xp-focus-outline", "#222": "xp-focus-outline-soft"},
        "text-shadow": {"#fff": "xp-disabled-emboss"},
    }
    for alias in ("-webkit-box-shadow", "-moz-box-shadow"):
        color_maps[alias] = color_maps["box-shadow"]
    for b in ("border-top", "border-right", "border-bottom", "border-left"):
        color_maps[b] = color_maps["border"]

    cmap = color_maps.get(p)
    changed = False
    if cmap:
        for hexv, name in cmap.items():
            pat = re.compile(re.escape(hexv) + r"\b")
            if pat.search(v):
                v = pat.sub(deftok(name, hexv), v)
                counts[name] += 1
                changed = True

    # globally-unique hexes → semantic tokens (safe property-agnostic replace;
    # runs after gradient tokenisation so gradient internals are already var()s)
    GLOBAL_MAP = {
        # window frame (the six blue bevel stops of .window) + title bar
        "#00138c": "xp-frame-outer-dark", "#0831d9": "xp-frame-outer-bright",
        "#001ea0": "xp-frame-mid-dark", "#166aee": "xp-frame-mid-bright",
        "#003bda": "xp-frame-inner-dark", "#0855dd": "xp-frame-inner-bright",
        "#0f1089": "xp-titlebar-text-shadow", "#0050ee": "xp-titlebar-control-bg",
        # selection / links / legend
        "#2267cb": "xp-selection", "#00f": "xp-link", "#0046d5": "xp-legend-text",
        # buttons & controls
        "#003c74": "xp-button-border", "#1d5281": "xp-control-border",
        "#cac8bb": "xp-control-border-disabled", "#d0d0bf": "xp-groupbox-border",
        # focus / hover glows
        "#cee7ff": "xp-focus-glow-1", "#98b8ea": "xp-focus-glow-2", "#bcd4f6": "xp-focus-glow-3",
        "#89ade4": "xp-focus-glow-4",
        "#fff0cf": "xp-hover-glow-1", "#fdd889": "xp-hover-glow-2",
        "#fbc761": "xp-hover-glow-3", "#e5a01a": "xp-hover-glow-4",
        "#ffc73c": "xp-tab-hover-accent", "#e68b2c": "xp-tab-hover-border",
        "#f8b636": "xp-control-hover-glow-dark", "#fedf9c": "xp-control-hover-glow-light",
        # tabs
        "#919b9c": "xp-tab-border", "#91a7b4": "xp-tab-border-muted", "#fcfcfe": "xp-tab-face",
        # scrollbar thumb (arrows/track are data-URI SVGs — see header TODO)
        "#c8d6fb": "xp-scrollbar-thumb", "#bad1fc": "xp-scrollbar-thumb-shade1",
        "#b7caf5": "xp-scrollbar-thumb-shade2",
        # misc surfaces
        "#f3f2ea": "xp-separator", "#ecebe4": "xp-track",
    }
    for hexv, name in GLOBAL_MAP.items():
        pat = re.compile(re.escape(hexv) + r"\b")
        if pat.search(v):
            v = pat.sub(deftok(name, hexv), v)
            counts[name] += 1
            changed = True

    # fonts (outside @font-face — those declarations never contain Arial/Trebuchet)
    if p == "font-family":
        if "Pixelated MS Sans Serif" in v and "Arial" in v:
            v, changed = deftok("xp-font-ui", v), True
            counts["xp-font-ui"] += 1
        elif "Trebuchet" in v:
            v, changed = deftok("xp-font-titlebar", v), True
            counts["xp-font-titlebar"] += 1

    if changed or norm(value) != value.strip():
        # single-line the value when we touched it or it was multiline
        return f"{prop.rstrip()}: {v}{term}"
    return m.group(0)

out = re.sub(r"([-a-zA-Z \t]+):((?:[^;{}]|\([^{}]*?\))+?)(;)", replace_decl, css, flags=re.S)

# font asset urls -> package-local fonts dir
out = re.sub(r"url\((ms_sans_serif[^)\s]*|PerfectDOSVGA437Win[^)\s]*)\)", r"url(./fonts/\1)", out)

# ---------- selector-scoped one-offs: three '#000 background' roles the
# property maps can't disambiguate (terminal, titlebar fallback, range track)
SURGERIES = [
    (r"(\npre \{[^{}]*?background-color: )#000\b", "xp-terminal-bg", "#000"),
    (r"(\n\.title-bar \{[^{}]*?background: )#000\b", "xp-titlebar-fallback", "#000"),
    (r'(input\[type="range"\]::(?:-webkit-slider-runnable|-moz-range)-track \{[^{}]*?background: )#000\b',
     "xp-range-track-line", "#000"),
]
for pat, name, default in SURGERIES:
    out, n = re.subn(pat, r"\1" + deftok(name, default), out)
    if n == 0:
        raise SystemExit(f"surgery matched nothing: {name}")
    counts[name] += n

# ---------- dead-declaration removal: xp.css layers a base stylesheet + the
# XP theme in one file, so identical selectors re-declare `background`, and
# only the LAST wins at equal specificity. Remove the dead earlier
# declarations (only in selector groups where a data-URI glyph is involved)
# so every glyph token corresponds to something that actually renders.
def split_decls(body: str) -> list[str]:
    # split on ';' only at paren/quote depth 0 — data-URIs contain ';'
    parts, cur, depth, inq = [], "", 0, None
    for ch in body:
        if inq:
            cur += ch
            if ch == inq:
                inq = None
            continue
        if ch in "\"'":
            inq = ch
            cur += ch
            continue
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        if ch == ";" and depth == 0:
            parts.append(cur)
            cur = ""
        else:
            cur += ch
    parts.append(cur)
    return parts

def strip_dead_backgrounds(css: str) -> str:
    rules = list(re.finditer(r"([^{}]+)\{([^{}]+)\}", css))
    by_sel: dict[str, list[int]] = {}
    for i, m in enumerate(rules):
        sel = re.sub(r"\s+", " ", m.group(1).strip().split("\n")[-1].strip())
        by_sel.setdefault(sel, []).append(i)
    dead: dict[int, set[int]] = {}
    removed = 0
    for sel, idxs in by_sel.items():
        if len(idxs) < 2:
            continue
        # every background/background-image declaration in this selector
        # group, in document order, grouped BY PROPERTY (deleting an earlier
        # same-property declaration on an identical selector is always
        # behaviour-preserving; cross-property cascade is left untouched)
        by_prop: dict[str, list] = {}
        for i in idxs:
            for j, decl in enumerate(split_decls(rules[i].group(2))):
                pm = re.match(r"\s*(background(?:-image)?)\s*:", decl)
                if pm:
                    if "!important" in decl:
                        raise SystemExit(f"!important background in {sel}")
                    by_prop.setdefault(pm.group(1), []).append((i, j, "data:image" in decl))
        for bgs in by_prop.values():
            if len(bgs) < 2 or not any(u for *_, u in bgs):
                continue
            for i, j, _ in bgs[:-1]:
                dead.setdefault(i, set()).add(j)
                removed += 1
    if removed < 16:
        raise SystemExit(f"dead-decl pass removed only {removed} — expected 17")
    parts, last = [], 0
    for i, m in enumerate(rules):
        parts.append(css[last : m.start()])
        if i in dead:
            decls = split_decls(m.group(2))
            parts.append(m.group(1) + "{" + ";".join(d for j, d in enumerate(decls) if j not in dead[i]) + "}")
        else:
            parts.append(m.group(0))
        last = m.end()
    parts.append(css[last:])
    print(f"dead background declarations removed: {removed}")
    return "".join(parts)

out = strip_dead_backgrounds(out)

# ---------- glyph pass: every embedded SVG data-URI becomes a whole-image
# token (--xp-glyph-*). var() cannot recolor inside a data-URI, but a theme
# CAN swap the entire image by overriding the token. Identical URIs dedupe to
# one token. Recolor-via-mask-image stays the post-v1 per-glyph alternative.
GLYPH_NAMES = [
    ('button[aria-label="Minimize"]:not(:disabled):active', "titlebar-minimize-active"),
    ('button[aria-label="Minimize"]:hover', "titlebar-minimize-hover"),
    ('button[aria-label="Minimize"]', "titlebar-minimize"),
    ('button[aria-label="Maximize"]:not(:disabled):active', "titlebar-maximize-active"),
    ('button[aria-label="Maximize"]:hover', "titlebar-maximize-hover"),
    ('button[aria-label="Maximize"]', "titlebar-maximize"),
    ('button[aria-label="Restore"]:not(:disabled):active', "titlebar-restore-active"),
    ('button[aria-label="Restore"]:hover', "titlebar-restore-hover"),
    ('button[aria-label="Restore"]', "titlebar-restore"),
    ('button[aria-label="Help"]:not(:disabled):active', "titlebar-help-active"),
    ('button[aria-label="Help"]:hover', "titlebar-help-hover"),
    ('button[aria-label="Help"]', "titlebar-help"),
    ('button[aria-label="Close"]:not(:disabled):active', "titlebar-close-active"),
    ('button[aria-label="Close"]:hover', "titlebar-close-hover"),
    ('button[aria-label="Close"]', "titlebar-close"),
    ("::-webkit-scrollbar-track:vertical", "scrollbar-track-v"),
    ("::-webkit-scrollbar-track:horizontal", "scrollbar-track-h"),
    ("::-webkit-scrollbar-track", "scrollbar-track"),
    ("::-webkit-scrollbar-thumb:vertical", "scrollbar-thumb-ribs-v"),
    ("::-webkit-scrollbar-thumb:horizontal", "scrollbar-thumb-ribs-h"),
    ("::-webkit-scrollbar-button:vertical:start", "scrollbar-up"),
    ("::-webkit-scrollbar-button:vertical:end", "scrollbar-down"),
    ("::-webkit-scrollbar-button:horizontal:start", "scrollbar-left"),
    ("::-webkit-scrollbar-button:horizontal:end", "scrollbar-right"),
    ('input[type="radio"][disabled]:checked + label:after', "radio-dot-disabled"),
    ('input[type="radio"]:checked + label:after', "radio-dot"),
    ('input[type="radio"][disabled] + label:before', "radio-disabled"),
    ('input[type="radio"]:active + label:before', "radio-active"),
    ('input[type="radio"] + label:before', "radio"),
    ('input[type="checkbox"][disabled]:checked + label:after', "checkbox-check-disabled"),
    ('input[type="checkbox"]:checked + label:after', "checkbox-check"),
    ('.has-box-indicator::-webkit-slider-thumb', "range-thumb-box"),
    ('.has-box-indicator::-moz-range-thumb', "range-thumb-box"),
    ('input[type="range"]::-webkit-slider-thumb', "range-thumb"),
    ('input[type="range"]::-moz-range-thumb', "range-thumb"),
    ("select:active", "select-arrow-active"),
    ("select:hover", "select-arrow-hover"),
    ("select", "select-arrow"),
    ("fieldset", "groupbox-border"),
]

def slugify(sel: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", sel.lower()).strip("-")
    return s[:48] or "glyph"

glyphs: dict[str, str] = {}       # token name -> uri value
uri_to_name: dict[str, str] = {}  # dedupe
glyph_comments: dict[str, str] = {}

def glyph_rule(m: re.Match) -> str:
    sel, body = m.group(1), m.group(2)
    if "data:image" not in body:
        return m.group(0)
    sel_line = sel.strip().split("\n")[-1].strip()
    def uri_sub(um: re.Match) -> str:
        uri = um.group(0)
        if uri in uri_to_name:
            return f"var(--xp-glyph-{uri_to_name[uri]})"
        name = next((n for needle, n in GLYPH_NAMES if needle in sel_line), None) or slugify(sel_line)
        base, i = name, 2
        while name in glyphs and glyphs[name] != uri:
            name, i = f"{base}-{i}", i + 1
        glyphs[name] = uri
        uri_to_name[uri] = name
        glyph_comments.setdefault(name, sel_line)
        return f"var(--xp-glyph-{name})"
    return sel + "{" + re.sub(r'url\("data:image/svg\+xml[^"]*"\)', uri_sub, body) + "}"

out = re.sub(r"([^{}]+)\{([^{}]+)\}", glyph_rule, out)

glyph_lines = [
    "/*",
    " * XP glyphs as whole-image tokens. Every embedded SVG data-URI from",
    " * xp.css lives here so xp.vendor.css contains no literal imagery.",
    " * TODO(colab-os): a theme reskins a glyph by overriding its token with",
    " * another image. For recolor-by-token instead, convert that glyph's rule",
    " * to mask-image + background-color: var(...) (works for monochrome",
    " * glyphs; the titlebar-button faces are multi-color composites and would",
    " * need redrawing).",
    " *",
    " * Upstream xp.css layers a base stylesheet + the XP theme in one file,",
    " * re-declaring some glyphs on identical selectors (later wins). The dead",
    " * base-layer declarations are removed at vendoring time, so every token",
    " * here is one that actually renders.",
    " */",
    ":root,",
    ".xp-theme {",
]
for name, uri in glyphs.items():
    glyph_lines.append(f"  /* {glyph_comments[name]} */")
    glyph_lines.append(f"  --xp-glyph-{name}: {uri};")
glyph_lines.append("}")
open(f"{PKG}/xp.glyphs.css", "w").write("\n".join(glyph_lines) + "\n")

HEADER = """/*
 * Vendored from xp.css v0.2.6 (MIT) — https://github.com/botoxparty/XP.css
 * Copyright (c) botoxparty and contributors. See LICENSE in the upstream repo.
 *
 * aicolab modifications:
 *  - prettified from dist/XP.css and TOKENISED: high-value literal colors,
 *    gradients and fonts are replaced with var(--xp-*) custom properties whose
 *    authentic-XP defaults live in ./xp.tokens.css. Long-tail one-off literals
 *    are intentionally left in place.
 *  - font urls rebased to ./fonts/.
 *  - TODO(colab-os): the embedded SVG data-URIs (titlebar glyphs, checkbox/
 *    radio, scrollbars) keep literal colors — var() cannot reach inside a
 *    data-URI. Reskin path: convert to mask-image + background-color: var().
 */
"""
open(f"{PKG}/xp.vendor.css", "w").write(HEADER + out)

# tokens file
groups = {
    "Title bar": ["xp-titlebar-gradient", "xp-titlebar-fallback", "xp-font-titlebar"],
    "Control faces & surfaces": ["xp-face", "xp-surface", "xp-button-face-gradient",
        "xp-button-active-gradient", "xp-tab-button-gradient", "xp-tabpanel-gradient",
        "xp-control-bevel-gradient", "xp-control-bevel-active-gradient"],
    "Bevels (box-shadow 3D borders)": ["xp-bevel-light", "xp-bevel-soft", "xp-bevel-mid",
        "xp-bevel-dark", "xp-bevel-dark2", "xp-bevel-frame", "xp-bevel-darkest"],
    "Text": ["xp-text", "xp-text-strong", "xp-text-inverse", "xp-disabled-emboss"],
    "Fields & focus": ["xp-field-border", "xp-focus-outline", "xp-focus-outline-soft"],
    "Progress": ["xp-progress-gradient", "xp-progress-segments", "xp-progress-mask"],
    "Fonts": ["xp-font-ui"],
    "Window frame (six-stop blue bevel of .window) + title bar": [
        "xp-frame-outer-dark", "xp-frame-outer-bright", "xp-frame-mid-dark",
        "xp-frame-mid-bright", "xp-frame-inner-dark", "xp-frame-inner-bright",
        "xp-titlebar-text-shadow", "xp-titlebar-control-bg"],
    "Selection, links, legend": ["xp-selection", "xp-link", "xp-legend-text"],
    "Control borders": ["xp-button-border", "xp-control-border",
        "xp-control-border-disabled", "xp-groupbox-border"],
    "Focus / hover glows": ["xp-focus-glow-1", "xp-focus-glow-2", "xp-focus-glow-3", "xp-focus-glow-4",
        "xp-hover-glow-1", "xp-hover-glow-2", "xp-hover-glow-3", "xp-hover-glow-4",
        "xp-tab-hover-accent", "xp-tab-hover-border",
        "xp-control-hover-glow-dark", "xp-control-hover-glow-light"],
    "Tabs": ["xp-tab-border", "xp-tab-border-muted", "xp-tab-face"],
    "Scrollbar thumb": ["xp-scrollbar-thumb", "xp-scrollbar-thumb-shade1", "xp-scrollbar-thumb-shade2"],
    "Misc": ["xp-separator", "xp-track", "xp-range-track-line", "xp-terminal-bg"],
}
lines = ["/*",
 " * Authentic Windows XP defaults for the --xp-* token contract read by",
 " * xp.vendor.css (and by XP components via inline styles).",
 " * TODO(colab-os): this file IS the reskin surface — a Colab OS theme is a",
 " * second file (or subtree class) overriding these values.",
 " */",
 ":root,", ".xp-theme {"]
emitted = set()
for group, names in groups.items():
    lines.append(f"  /* {group} */")
    for n in names:
        if n in tokens:
            lines.append(f"  --{n}: {tokens[n]};")
            emitted.add(n)
lines.append("}")
missing = [n for n in tokens if n not in emitted]
if missing:
    raise SystemExit(f"tokens not in groups: {missing}")

COMPONENT_TOKENS = """
/*
 * Taskbar, start menu & tray — defaults lifted from the reference app's
 * inline component styles (these surfaces are NOT covered by xp.css).
 * TODO(colab-os): this whole block is the primary reskin surface.
 */
:root,
.xp-theme {
  /* Taskbar */
  --xp-taskbar-gradient: linear-gradient(0deg, #042b8e 0%, #0551f6 6%, #0453ff 51%, #0551f6 63%, #0551f6 81%, #3a8be8 99%, #0453ff 100%);
  --xp-taskbar-button-active: linear-gradient(0deg, #0a5bc6 0%, #1198e9 100%);
  --xp-taskbar-button-active-hover: linear-gradient(0deg, #1a6bd6 0%, #20a8f9 100%);
  --xp-taskbar-button-idle: linear-gradient(0deg, #1943b8 0%, #3370d3 100%);
  --xp-taskbar-button-idle-hover: linear-gradient(0deg, #2953c8 0%, #4380e3 100%);
  /* System tray */
  --xp-tray-gradient: linear-gradient(0deg, #0a5bc6 0%, #1198e9 6%, #1198e9 51%, #1198e9 63%, #1198e9 77%, #19b9f3 95%, #1198e9 97%);
  --xp-tray-glow: #20e2fc;
  --xp-tray-border-top: #075dca;
  --xp-tray-border-bottom: #0a5bc6;
  /* Start button */
  --xp-start-button-gradient: linear-gradient(0deg, #0c450c 0%, #308f2f 6%, #308f2f 51%, #308f2f 63%, #308f2f 77%, #97c597 95%, #97c597 99%, #308f2f 97%);
  --xp-start-button-pressed-gradient: linear-gradient(0deg, #2f892f 0%, #4eb64e 6%, #4eb64e 51%, #4eb64e 63%, #4eb64e 77%, #c4ffc4 85%, #c4ffc4 93%, #2f892f 97%);
  /* Start menu */
  --xp-startmenu-bg: #245edc;
  --xp-startmenu-hover: #316ac5;
  --xp-startmenu-header-gradient: linear-gradient(to right, #5a8dee 0%, #4577dc 50%, #245edc 100%);
  --xp-startmenu-accent-gradient: linear-gradient(to right, #ff9500 0%, #ff7a00 100%);
  --xp-startmenu-accent-border: #d4640a;
  --xp-startmenu-footer-gradient: linear-gradient(to bottom, #588bf9 0%, #1354e1 30%, #2e5bdc 100%);
  --xp-startmenu-right-gradient: linear-gradient(to bottom, #e8f4fd 0%, #d6ebfa 100%);
  --xp-startmenu-right-separator: #9cbee8;
  --xp-startmenu-left-separator: #c5c5c5;
  --xp-startmenu-column-border: #bfbfbf;
}
"""
open(f"{PKG}/xp.tokens.css", "w").write("\n".join(lines) + "\n" + COMPONENT_TOKENS)

print("== replacements ==")
for k, v in counts.most_common():
    print(f"{v:4} {k}")
print("== leftover raw hexes (excl. data-URIs) ==")
left = Counter()
for decl in re.findall(r"[-a-zA-Z]+:\s*(?:[^;{}]|\([^{}]*?\))+?;", out, flags=re.S):
    if "data:image" in decl:
        continue
    for h in re.findall(r"#[0-9a-fA-F]{3,8}\b", decl):
        left[h.lower()] += 1
for h, n in left.most_common():
    print(f"{n:4} {h}")

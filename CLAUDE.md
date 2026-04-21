# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tilawa Tour** is a French-language PWA (Progressive Web App) for following a personalized Quran reading schedule — "Cheminer avec le Coran, mois après mois." It is a fully static app with no build system, no bundler, and no server-side code.

## Build System

All themed files are **generated** — never edit `*_bloom.html` or `*_serenity.html` directly.

```bash
npm run build      # generate all themed output files (both themes, all pages)
npm run watch      # same, rebuilding on every src/ change
npm run extract    # one-time migration: re-extract src/pages/ from existing bloom files
```

No dependencies to install — build uses only Node.js built-ins (requires Node ≥ 18).

### Workflow

1. Edit the single-source template in `src/pages/<page>.html`
2. Run `npm run build` → generates `<page>_bloom.html` + `<page>_serenity.html` in project root
3. To change theme colors/fonts, edit `src/themes/bloom.json` or `src/themes/serenity.json`

### Template tokens

| Token | Example output |
|-------|---------------|
| `{{THEME}}` | `bloom` / `serenity` |
| `{{THEME_TITLE}}` | `Bloom` / `Serenity` |
| `{{TAILWIND_COLORS}}` | full JSON color object |
| `{{BODY_FONT_NAME}}` | `Plus Jakarta Sans` / `Manrope` |
| `{{BODY_FONT_CSS}}` | `'Plus Jakarta Sans', sans-serif` |
| `{{GOOGLE_FONTS_BODY}}` | Google Fonts URL segment for body font |
| `{{THEME_BG}}` | `#fcf9f5` / `#f8faf8` |
| `{{ICON_WEIGHT}}` | `300` / `400` |

### Running the app

Serve the project root as static files — no server needed, `index.html` is the entry point:

```bash
npx serve .
# or
python -m http.server 8080
```

## Architecture

### Theme Duplication Pattern

Every page is generated in two variants: `*_bloom.html` and `*_serenity.html`. The single source template lives in `src/pages/<page>.html`. Theme-specific values (colors, fonts, icon weight) are injected via `{{TOKEN}}` placeholders — see the Build System section above.

- **Bloom**: warm terracotta/gold (`primary: #6a5b53`, body font: Plus Jakarta Sans)
- **Serenity**: emerald/cream (`primary: #00917c`, body font: Manrope)

Full palettes are in `src/themes/bloom.json` and `src/themes/serenity.json`.

### Page Flow

```
index.html           ← theme selection; auto-redirects if theme already saved
  └─► plan_*.html    ← first-time program setup (pace, start date, translation)
  └─► dashboard_*_v4.html  ← main hub (daily target, progress, navigation)
        ├─► lecteur_*.html       ← Quran reader (Arabic text, translation, audio)
        ├─► calendrier_*.html    ← monthly calendar of completed days
        ├─► bilan_*.html         ← yearly progress summary + Ramadan goal
        ├─► profil_*.html        ← avatar, language, translation preference
        └─► lexique_*.html       ← Tajwid color-coded glossary
celebration_*.html   ← shown after completing a full khatm (604 pages)
```

### State — localStorage Keys

All user state lives in `localStorage`. No backend, no accounts.

| Key | Type | Description |
|-----|------|-------------|
| `tilawa_programme` | JSON object | Theme, translation preference, pace config |
| `tilawa_last_page` | integer string | Current mushaf page (1–604) |
| `tilawa_done_days` | JSON object | Map of `"YYYY-MM-DD"` → pages read |
| `tilawa_khatmates_annee` | integer string | Full Quran completions this year |
| `tilawa_meditated` | JSON array | Pages where tadabbur (reflection) was toggled |
| `tilawa_bookmark` | integer string | Bookmarked page |
| `tilawa_objectif_ramadan` | JSON object | Selected Ramadan reading goal |
| `tilawa_langue` | string | UI language preference |

### Quran Data Sources

- **Arabic text** (`window._arabicData`): Uthmani script, embedded inline as a large JS object in each `lecteur_*.html` — keyed by `{surah: {ayah: text}}`.
- **Maach translation** (`window._maachData`): French translation by Chouraqui/Maach, also embedded inline.
- **Hamidullah translation**: Fetched live from `https://api.alquran.cloud/v1/surah/{n}/fr.hamidullah`.
- **Page→Ayah mapping** (`PAGE_TO_AYAHS`): Inline JS object mapping mushaf page numbers to `{s: surahNum, a: ayahNum}`.
- **Audio**: Fetched per-ayah from `everyayah.com`.

Source data files in `Fichiers API/` (CSV, XML, JSON) were used to generate the embedded data — they are reference material, not loaded at runtime.

### Stack

- **Tailwind CSS** (CDN, with `forms` and `container-queries` plugins) — config inlined per page
- **Google Fonts**: Noto Serif (headlines), Plus Jakarta Sans or Manrope (body), Amiri (Arabic)
- **Material Symbols Outlined** (Google icons, CDN)
- **Vanilla JavaScript** — no framework, no modules
- **PWA**: `manifest.json` + `apple-mobile-web-app-*` meta tags; logo at `Images/logo_ok.svg`

## Key Conventions

- The bottom navigation bar (`<nav class="fixed bottom-0">`) appears identically in dashboard, lecteur, calendrier, plan, and profil templates — update all five `src/pages/*.html` files when changing nav items.
- Safe-area insets for iOS notch: `padding-bottom: max(1.25rem, env(safe-area-inset-bottom))` on the bottom nav.
- Arabic text always uses `font-family: Amiri` and is displayed right-to-left with `dir="rtl"`.
- Tajwid color coding follows the guide in `Fichiers API/Guide des Couleurs du Tajwid Détaillé.xlsx`.

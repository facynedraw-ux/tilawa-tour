/**
 * Tilawa Tour build script
 *
 * Reads templates from src/pages/*.html, applies theme tokens
 * from src/themes/*.json, and writes themed output files to the project root.
 *
 * Usage:
 *   node build.js           — build once
 *   node build.js --watch   — rebuild on src/ changes
 */

'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;

// ── Theme configs ─────────────────────────────────────────────────────────────

const THEMES = ['bloom', 'serenity'].map(name => {
  const p = path.join(ROOT, 'src', 'themes', `${name}.json`);
  if (!fs.existsSync(p)) throw new Error(`Missing theme file: src/themes/${name}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
});

// ── Page manifest ─────────────────────────────────────────────────────────────
// tpl: filename under src/pages/ (without .html)
// out: output filename pattern; {{THEME}} is replaced with the theme name

const PAGES = [
  { tpl: 'dashboard-bloom',    out: 'dashboard_bloom_v4.html',    themes: ['bloom']    },
  { tpl: 'dashboard-serenity', out: 'dashboard_serenity_v4.html', themes: ['serenity'] },
  { tpl: 'plan',        out: 'plan_{{THEME}}.html'         },
  { tpl: 'lecteur',     out: 'lecteur_{{THEME}}.html'      },
  { tpl: 'calendrier',  out: 'calendrier_{{THEME}}.html'   },
  { tpl: 'bilan',       out: 'bilan_{{THEME}}.html'        },
  { tpl: 'profil',      out: 'profil_{{THEME}}.html'       },
  { tpl: 'lexique',     out: 'lexique_{{THEME}}.html'      },
  { tpl: 'celebration', out: 'celebration_{{THEME}}.html'  },
];

// ── Token replacement ─────────────────────────────────────────────────────────

function colorsJson(colors) {
  // Compact single-line JSON — valid as a Tailwind config JS object literal
  return JSON.stringify(colors);
}

function applyTheme(template, theme) {
  return template
    .replaceAll('{{THEME}}',              theme.name)
    .replaceAll('{{THEME_TITLE}}',        theme.title)
    .replaceAll('{{GOOGLE_FONTS_BODY}}',  theme.googleFontsBody)
    .replaceAll('{{TAILWIND_COLORS}}',    colorsJson(theme.colors))
    .replaceAll('{{BODY_FONT_NAME}}',     theme.bodyFontName)
    .replaceAll('{{BODY_FONT_CSS}}',      theme.bodyFontCss)
    .replaceAll('{{THEME_BG}}',           theme.bg)
    .replaceAll('{{ICON_WEIGHT}}',        theme.iconWeight)
    // Genre / identity tokens
    .replaceAll('{{GENRE_SALUTATION}}',   theme.genreSalutation)
    .replaceAll('{{GENRE_NOM_DEFAUT}}',   theme.genreNomDefaut)
    .replaceAll('{{THEME_BADGE_FR}}',     theme.themeBadgeFr)
    .replaceAll('{{THEME_BADGE_EN}}',     theme.themeBadgeEn)
    .replaceAll('{{THEME_BADGE_AR}}',     theme.themeBadgeAr)
    .replaceAll('{{AVATAR_CONST}}',       theme.avatarConst)
    .replaceAll('{{READING_BREAK_HIDDEN}}', theme.readingBreakHidden)
    .replaceAll('{{PAUSE_ACTIVE_DEFAULT}}', theme.pauseActiveDefault)
    .replaceAll('{{AVATAR_FILE}}',          theme.avatarFile)
    .replaceAll('{{LOGO_FILE}}',            theme.logoFile)
    .replaceAll('{{PRIMARY_COLOR}}',        theme.colors.primary);
}

// ── Build ─────────────────────────────────────────────────────────────────────

function build() {
  const t0 = Date.now();
  let built = 0, skipped = 0;

  for (const page of PAGES) {
    const tplPath = path.join(ROOT, 'src', 'pages', `${page.tpl}.html`);
    if (!fs.existsSync(tplPath)) {
      console.warn(`  [skip] src/pages/${page.tpl}.html not found — run: npm run extract`);
      skipped++;
      continue;
    }

    const template = fs.readFileSync(tplPath, 'utf8');

    const targets = page.themes
      ? THEMES.filter(t => page.themes.includes(t.name))
      : THEMES;
    for (const theme of targets) {
      const outName = page.out.replaceAll('{{THEME}}', theme.name);
      const outPath = path.join(ROOT, outName);
      fs.writeFileSync(outPath, applyTheme(template, theme));
      built++;
    }
  }

  const ms = Date.now() - t0;
  const summary = `${built} file${built !== 1 ? 's' : ''} built`;
  const warn    = skipped ? `, ${skipped} template${skipped !== 1 ? 's' : ''} missing` : '';
  console.log(`[${new Date().toLocaleTimeString()}] ${summary}${warn} (${ms}ms)`);
}

// ── Entry point ───────────────────────────────────────────────────────────────

build();

if (process.argv.includes('--watch')) {
  const watchDir = path.join(ROOT, 'src');
  console.log(`Watching ${watchDir} …`);

  fs.watch(watchDir, { recursive: true }, (_event, filename) => {
    if (!filename) return;
    if (!filename.endsWith('.html') && !filename.endsWith('.json')) return;
    console.log(`  changed: ${filename}`);
    try { build(); } catch (e) { console.error('Build error:', e.message); }
  });
}

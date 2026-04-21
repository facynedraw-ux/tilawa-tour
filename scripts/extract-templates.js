/**
 * One-time migration script.
 * Reads each *_bloom.html source file, replaces theme-specific values
 * with {{TOKEN}} placeholders, and writes templates to src/pages/.
 *
 * Run once: npm run extract
 * After this, edit src/pages/*.html and run: npm run build
 */

'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT    = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'src', 'pages');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const PAGES = [
  { src: 'dashboard_bloom_v4.html', tpl: 'dashboard.html' },
  { src: 'plan_bloom.html',         tpl: 'plan.html'       },
  { src: 'lecteur_bloom.html',      tpl: 'lecteur.html'    },
  { src: 'calendrier_bloom.html',   tpl: 'calendrier.html' },
  { src: 'bilan_bloom.html',        tpl: 'bilan.html'      },
  { src: 'profil_bloom.html',       tpl: 'profil.html'     },
  { src: 'lexique_bloom.html',      tpl: 'lexique.html'    },
  { src: 'celebration_bloom.html',  tpl: 'celebration.html'},
];

// Matches the flat colors:{...} block in a Tailwind config.
// All color values are hex strings — no nested {} — so indexOf('}') is safe.
function replaceColorsBlock(html) {
  const marker = 'colors:';
  const pos    = html.indexOf(marker);
  if (pos === -1) return html;

  const braceStart = html.indexOf('{', pos);
  if (braceStart === -1) return html;

  const braceEnd = html.indexOf('}', braceStart);
  if (braceEnd === -1) return html;

  return html.slice(0, pos) + 'colors: {{TAILWIND_COLORS}}' + html.slice(braceEnd + 1);
}

function extractTemplate(html) {
  // 1. Colors block → token (do first so later steps don't see hex values from config)
  html = replaceColorsBlock(html);

  // 2. Tailwind fontFamily body/label entries
  html = html.replace(
    /"(body|label)"\s*:\s*\["(?:Plus Jakarta Sans|Manrope|Noto Serif)"\]/g,
    (_, key) => `"${key}": ["{{BODY_FONT_NAME}}"]`
  );

  // 3. Google Fonts URL — body font segment
  html = html.replace(
    /(family=)(Plus\+Jakarta\+Sans:wght@[^&"]+|Manrope:wght@[^&"]+)/g,
    '$1{{GOOGLE_FONTS_BODY}}'
  );

  // 4. Inline body CSS: font-family declaration
  html = html.replace(
    /font-family\s*:\s*'(?:Plus Jakarta Sans|Manrope)',\s*sans-serif/g,
    'font-family:{{BODY_FONT_CSS}}'
  );

  // 5. Surface background color (safe after step 1 removed config occurrences)
  html = html.replace(/#fcf9f5/g, '{{THEME_BG}}');

  // 6. Material Symbols icon weight in CSS
  html = html.replace(
    /font-variation-settings\s*:\s*'FILL' 0,\s*'wght' \d+,\s*'GRAD' 0,\s*'opsz' 24/g,
    "font-variation-settings: 'FILL' 0, 'wght' {{ICON_WEIGHT}}, 'GRAD' 0, 'opsz' 24"
  );

  // 7. "Bloom" in <title> tag
  html = html.replace(/(<title>[^<]*)\s+Bloom(<\/title>)/g, '$1 {{THEME_TITLE}}$2');

  // 8. Internal links and JS location strings (_bloom → _{{THEME}})
  html = html.replace(/_bloom(_v4)?\.html/g, '_{{THEME}}$1.html');

  // 9. Normalize inconsistent font-jakarta → font-label
  html = html.replace(/font-jakarta/g, 'font-label');

  return html;
}

let ok = 0, skip = 0;

for (const { src, tpl } of PAGES) {
  const srcPath = path.join(ROOT, src);
  if (!fs.existsSync(srcPath)) {
    console.warn(`  [skip] not found: ${src}`);
    skip++;
    continue;
  }

  process.stdout.write(`Extracting ${src} … `);
  const html     = fs.readFileSync(srcPath, 'utf8');
  const template = extractTemplate(html);
  const outPath  = path.join(OUT_DIR, tpl);
  fs.writeFileSync(outPath, template);
  const kb = Math.round(Buffer.byteLength(template) / 1024);
  console.log(`→ src/pages/${tpl} (${kb} KB)`);
  ok++;
}

console.log(`\nDone: ${ok} templates created, ${skip} skipped.`);
console.log('Edit src/pages/*.html and run: npm run build');

# Tilawa Tour — État du projet

## Déploiement
- Plateforme : Netlify (static, PWA)
- Auth + sync : Supabase (`user_data` table, clé dans `supabase-client.js`)
- **IMPORTANT : chaque push Netlify consomme des crédits → grouper tous les fichiers, pousser une seule fois par session**
- Flux build : modifier `src/pages/<page>.html` → `npm run build` → commit les fichiers générés `*_bloom.html` + `*_serenity.html`

## Phase actuelle
Application en **phase de test** (Avril 2026).

## Architecture technique
- Pas de framework JS, pas de bundler
- Tailwind CDN, Material Symbols CDN, Google Fonts CDN
- Données Coran embarquées inline dans chaque page (arabicData, maachData)
- Toutes les données utilisateur dans localStorage, synchronisées avec Supabase via `syncFromCloud()` / `saveToCloud()`

## Pages
| Fichier source | Généré | Rôle |
|---|---|---|
| index.html (statique) | — | Choix du thème (homme/femme), auto-redirect si déjà connecté |
| login.html (statique) | — | Auth Supabase |
| src/pages/dashboard.html | dashboard_bloom_v4.html + dashboard_serenity_v4.html | Hub principal |
| src/pages/lecteur.html | lecteur_bloom.html + lecteur_serenity.html | Lecteur Coran |
| src/pages/calendrier.html | calendrier_bloom.html + calendrier_serenity.html | Calendrier mensuel |
| src/pages/plan.html | plan_bloom.html + plan_serenity.html | Config programme |
| src/pages/profil.html | profil_bloom.html + profil_serenity.html | Profil & réglages |
| src/pages/bilan.html | bilan_bloom.html + bilan_serenity.html | Bilan annuel |
| src/pages/lexique.html | lexique_bloom.html + lexique_serenity.html | Lexique Tajwid |
| src/pages/celebration.html | celebration_bloom.html + celebration_serenity.html | Khatma accomplie |

## Thèmes
- **Serenity** = Homme, vert émeraude #00917c, font Manrope
- **Bloom** = Femme, terracotta #6a5b53, font Plus Jakarta Sans

## Flux utilisateur (ordre obligatoire)

### Première configuration
1. `login.html` → OTP Supabase → `index.html`
2. `index.html` → choix Homme/Femme → `plan_*.html`
3. `plan_*.html` → configuration programme → `dashboard_*.html`
4. Depuis dashboard → `profil_*.html` : saisir prénom + kunya + confirmer thème → bouton **Sauvegarder** → verrou + redirect `plan_*.html` si pas encore configuré

### Retour utilisateur (déjà configuré)
- `index.html` → si `tilawa_programme.hizbs_jour` ET `.theme` présents → dashboard directement
- Profil : prénom/kunya grisés, thème verrouillé, bouton Sauvegarder masqué

### Reset
- Bouton Reset dans profil → efface localStorage + cloud → **recharge la page profil** (pas de redirect index.html pour éviter le re-check session Supabase)
- Page profil rechargée : tout déverrouillé, bouton Sauvegarder visible → même flux que première configuration

## État des fonctionnalités (Avril 2026)

### ✅ Fait et fonctionnel
- Choix thème initial (index.html) — redirect dashboard seulement si `hizbs_jour` ET `theme` présents
- Configuration programme (plan_*.html)
- Dashboard principal (bilan, jauge, programme semaine)
- Lecteur Coran avec audio (cdn.islamic.network + fallback everyayah.com)
- Calendrier mensuel
- Profil : sélection langue, traduction, récitant
- Profil : nom/kunya grisés une fois saisis (unlock uniquement via reset)
- Profil : boutons Homme/Femme verrouillés une fois sélectionnés (unlock uniquement via reset)
- Profil : bouton Sauvegarder positionné **après** le choix du thème, masqué si déjà enregistré
- Profil : Sauvegarder valide que le thème est choisi avant d'accepter
- Sync cloud Supabase (toutes les clés dans SYNC_KEYS)
- Bouton reset dans profil (réinitialise localStorage + cloud + recharge profil)

### ⚠️ Bugs connus / en cours
- *(vide — à remplir au fil des corrections)*

## Clés localStorage
| Clé | Type | Description |
|---|---|---|
| tilawa_programme | JSON | {theme, pages_jour, hizbs_jour, date_debut, langue, traduction, recitant} |
| tilawa_last_page | string (int) | Prochaine page à lire (1–604) |
| tilawa_done_days | JSON | {"YYYY-MM-DD": true} |
| tilawa_khatmates_annee | string (int) | Khatmas complètes cette année |
| tilawa_meditated | JSON array | Pages méditées |
| tilawa_bookmark | string (int) | Page en signet |
| tilawa_objectif_ramadan | JSON | Objectif Ramadan |
| tilawa_langue | string | "fr" / "en" / "ar" |
| tilawa_prenom | string | Prénom utilisateur |
| tilawa_kunya | string | Kunya utilisateur |

## Règles critiques
- **Jamais modifier `*_bloom.html` ou `*_serenity.html` directement** → toujours `src/pages/` puis `npm run build`
- Jamais `toISOString()` pour les dates → `getFullYear/getMonth/getDate`
- Jamais `prompt()` → toujours inputs inline
- `tilawa_last_page` = prochaine page À LIRE (pas la dernière lue)
- `window._arabicData` et `window._maachData` doivent être en tête du HTML (script 1)
- **`setTheme(t, true)`** ne redirige jamais — c'est le bouton Sauvegarder qui gère la redirection
- **`setTheme(t, false)`** = affichage visuel uniquement, n'écrit pas dans localStorage
- **index.html** ne redirige vers le dashboard que si `tilawa_programme.hizbs_jour` ET `.theme` sont définis
- **Reset** → `window.location.reload()` sur la page profil (pas `index.html`) pour éviter le re-check session Supabase qui peut expirer et renvoyer vers OTP

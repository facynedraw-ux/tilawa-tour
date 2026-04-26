# Tilawa Tour — État du projet

## Déploiement
- Plateforme actuelle : Netlify (Personal plan, 1000 crédits, 75 crédits/build, 20 crédits/GB bande passante)
- Auth + sync : Supabase (`user_data` table, clé dans `supabase-client.js`)
- **IMPORTANT : chaque push Netlify consomme des crédits → grouper tous les fichiers, pousser une seule fois par session**
- Flux build : modifier `src/pages/<page>.html` → `npm run build` → commit les fichiers générés `*_bloom.html` + `*_serenity.html`
- **À FAIRE après validation complète : migrer vers Cloudflare Pages** (gratuit, bande passante illimitée, builds illimités — indispensable si beaucoup d'utilisateurs)

## Phase actuelle
Application en **phase de test** (Avril 2026).

---

## Session du 26 Avril 2026 — ce qui a été fait

### ✅ Corrigé et buildé (pas encore pushé sur Netlify)

#### Notifications (dashboard bloom + serenity + profil)
- **Option A — bannière in-app** : si lecture du jour non faite → `#banniere-rappel` visible au chargement du dashboard avec bouton "Lire" vers le lecteur
- **Option B — notifications locales via SW** : `sw-tilawa.js` créé à la racine (periodicSync `check-lecture` 6h, notificationclick → focus dashboard)
  - Dashboard : enregistrement SW + sync état vers IndexedDB (`tilawa_sw`) + déclenchement notification si heure passée et lecture non faite
  - Profil : section "Rappel quotidien" avec toggle on/off + sélecteur d'heure (sauvegardés dans `tilawa_notif_enabled` + `tilawa_notif_heure`)
  - Permission demandée au toggle, périodic sync enregistré si disponible
- **Correction programme du jour < 2 hizbs** : `_nextPageB` et `nextPage` utilisent désormais directement `tilawa_last_page` (suppression du `Math.max` avec la position calculée) — le programme du jour part toujours de là où l'utilisateur en est réellement
- **Carte retard (≥ 2 hizbs)** : carte `#carte-retard` avec deux options — "Rattraper" (recalcule rythme, +X pages/jour) ou "Repousser" (recalibre date_debut) ; ignorée pour la journée si l'utilisateur choisit (`tilawa_retard_dismissed`)

#### Dashboard bloom + serenity
- **Sourate incorrecte dans "Reprendre la lecture"** : le dashboard utilisait `HIZB_TABLE[hizb].s` (sourate du début du hizb) au lieu de la sourate réelle de la page — affichait "Ghafir" au lieu de "Fussilat" pour p.480
  - Fix : ajout de `PAGE_TO_SURAH` (604 entrées dérivées de `PAGE_TO_AYAHS` du lecteur) dans les deux sources dashboard
  - Bloom : lookup inline remplacé par `PAGE_TO_SURAH[page]`
  - Serenity : `sdp()` et son `SMAP` incomplet (12 entrées seulement) remplacés par `PAGE_TO_SURAH` + `SURAH_NAMES`

#### Calendrier (`src/pages/calendrier.html`)
- **Message rétro-validation supprimé** ("Tu as commencé ton programme avant aujourd'hui...") — redondant avec la mention "Tapez sur un jour passé"
- **Date de fin prévue restaurée** : ajoutée dans la carte "Objectif à atteindre" → "Fin prévue le X mois AAAA" calculée depuis `date_debut + ceil(60/hizbs_jour)` jours
- **Tutoiement** : "Votre parcours spirituel du mois" → "Ton parcours spirituel du mois", "selon votre programme" → supprimé, "Lancez" → "Lance"

#### Profil (`src/pages/profil.html`)
- **Section statistiques supprimée** : 4 tuiles (Khatmates, Jours consécutifs, Pages lues, Objectif du mois) retirées — ces stats appartiennent au bilan
- **Bouton "Définir mon programme" supprimé** → remplacé par un simple affichage du rythme choisi (info statique en lecture seule)
- **Tutoiement** : "votre prénom, votre programme, votre thème" → "ton prénom, ton programme, ton thème"

### 📦 Fichiers à uploader sur Netlify (7 fichiers buildés le 26 avril + sw-tilawa.js)
| Fichier | Raison |
|---|---|
| `dashboard_bloom_v4.html` + `dashboard_serenity_v4.html` | PAGE_TO_SURAH + carte retard + bannière + SW + fix nextPage |
| `calendrier_bloom.html` + `calendrier_serenity.html` | Date de fin, suppression msg rétro, tutoiement |
| `profil_bloom.html` + `profil_serenity.html` | Suppression stats + bouton programme + section notifications |
| `sw-tilawa.js` | Nouveau — service worker notifications |

### 🔮 À faire (décidé, pas encore implémenté)
- **Stats/jauges dashboard** : supprimer sections "Régularité" et "Statistiques de lecture" (4 tuiles) → elles font doublon avec le bilan
- **Système de rappel** : options A (bannière in-app si lecture du jour non faite) + B (notification locale via Service Worker) retenues — à implémenter après les bugs

---

## Session du 25 Avril 2026 — ce qui a été fait

### ✅ Corrigé et buildé (pas encore pushé sur Netlify)

#### Profil (`src/pages/profil.html` → `profil_bloom.html` + `profil_serenity.html`)
- **Prénom/kunya ne se sauvegardaient pas** : crash silencieux dans `setTraduction()` (null.classList) bloquait tout le script d'init
  - Fix : null-check ajouté avant accès `.classList` sur les boutons
  - Fix : initialisation prénom/kunya déplacée dans un IIFE indépendant (avant les autres inits)
  - Fix : `window.location.reload()` supprimé → UI mise à jour en place (champ grisé, bouton masqué)
  - Fix : `type="button"` ajouté sur le bouton pour éviter submit implicite
- **Bouton "Sauvegarder" masqué** dès que le prénom est saisi ; réapparaît uniquement après reset

#### Dashboard (`src/pages/dashboard-bloom.html` + `src/pages/dashboard-serenity.html`)
- **Carte de bienvenue** pour nouveaux utilisateurs sans prénom (champ + bouton inline)
- **"Hizb 60-60" après Khatma** : formule modulo 60 appliquée → `((Math.floor(h) - 1) % 60) + 1`
- **Détection Khatma manquante dans Bloom** : ajoutée dans `marquerFaitBloom` et `arreterIciBloom`
- **date_debut non réinitialisée** après Khatma : fix → reset à J+1 dans localStorage pour que le programme du mois suivant soit correct
- Fichiers générés : `dashboard_bloom_v4.html` + `dashboard_serenity_v4.html`

#### Calendrier (`src/pages/calendrier.html` → `calendrier_bloom.html` + `calendrier_serenity.html`)
- **Message rétro-validation** : si `date_debut` est dans le passé, affiche une info-bulle expliquant qu'on peut cocher les jours passés directement dans le calendrier

#### Lecteur (`src/pages/lecteur.html` → `lecteur_bloom.html` + `lecteur_serenity.html`)
- **"Page non encore indexée"** (page 461 et toutes pages > 380) : `PAGE_TO_AYAHS` était incomplète (380 pages, mauvais format de mushaf). Remplacée par le mapping complet 604 pages basé sur `quran-uthmani.json`
- **Sommaire des 114 sourates** : tap sur le nom de la sourate dans le header → ouvre un panneau plein écran avec liste des 114 sourates (numéro + nom arabe + numéro de page), barre de recherche, scroll auto sur la sourate active, tap = navigation directe
- **Saut de page** : tap sur `p. X` (numéro français) sous le numéro arabe dans le pied de page → ouvre un champ numérique pour aller à n'importe quelle page (1–604)

#### Footers Instagram (`_blank`)
- Lien Instagram dans le footer de toutes les pages ne s'ouvrait pas dans un nouvel onglet
- Fix : `target="_blank" rel="noopener"` ajouté dans les 8 pages concernées :
  `bilan`, `plan`, `lexique`, `calendrier`, `profil`, `lecteur`, `celebration`, `dashboard`

---

### 📦 Fichiers à uploader sur Netlify (16 fichiers, tous buildés le 25 avril)

| Fichier | Raison |
|---|---|
| `profil_bloom.html` + `profil_serenity.html` | Prénom/kunya + bouton masqué |
| `dashboard_bloom_v4.html` + `dashboard_serenity_v4.html` | Carte bienvenue + modulo hizb + khatma |
| `calendrier_bloom.html` + `calendrier_serenity.html` | Message date passée |
| `lecteur_bloom.html` + `lecteur_serenity.html` | PAGE_TO_AYAHS 604p + sommaire + saut de page |
| `bilan_bloom.html` + `bilan_serenity.html` | Instagram `_blank` |
| `plan_bloom.html` + `plan_serenity.html` | Instagram `_blank` |
| `lexique_bloom.html` + `lexique_serenity.html` | Instagram `_blank` |
| `celebration_bloom.html` + `celebration_serenity.html` | Instagram `_blank` |

> `index.html` et `login.html` non touchés → ne pas re-uploader.

---

### ⚠️ À tester après upload
- Prénom/kunya : sauvegarde → champ grisé → persistance après navigation
- Dashboard : "Hizb X-X" correct après Khatma, repartir de Hizb 1 le lendemain
- Calendrier : message rétro-validation visible si date_debut passée
- Lecteur : plus de "Page non encore indexée", page 461 affiche Az-Zumar 22-31
- Lecteur : sommaire 114 sourates → navigation par tap
- Lecteur : tap `p. X` → saisie libre → navigation
- Instagram : lien s'ouvre bien dans un nouvel onglet

---

## Session du 24 Avril 2026 — ce qui a été fait

### Corrigé et uploadé sur Netlify
- **Reset profil** : `supabase-client.js` (nouvelle fonction `resetCloud()`) + `src/pages/profil.html` → le reset vide maintenant aussi le cloud Supabase, plus de résurrection des données après reset
- **Calcul hizbs dashboard** : `src/pages/dashboard-bloom.html` + `src/pages/dashboard-serenity.html` → `currentHizb` calculé depuis les jours écoulés (`1 + jours × hizbsJour`) au lieu de la page, corrige l'affichage "58-59" → "59-60" pour le 30 avril
- **Login OTP code** : `login.html` → remplacé magic link par OTP 6 chiffres (`signInWithOtp` sans `emailRedirectTo` + `verifyOtp`)
- **Template email Supabase** : modifié pour afficher `{{ .Token }}` en texte brut au lieu du lien magic link
- **OTP length Supabase** : changé de 8 à 6 chiffres

---

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
| src/pages/dashboard-bloom.html + dashboard-serenity.html | dashboard_bloom_v4.html + dashboard_serenity_v4.html | Hub principal (sources séparées par thème) |
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

## État des fonctionnalités (Avril 2026)

### ✅ Fait et fonctionnel
- Choix thème initial (index.html)
- Configuration programme (plan_*.html)
- Dashboard principal (bilan, jauge, programme semaine)
- Lecteur Coran avec audio (cdn.islamic.network + fallback everyayah.com)
- Lecteur : sommaire 114 sourates (tap sur nom de sourate)
- Lecteur : saut de page direct (tap sur numéro français)
- Lecteur : PAGE_TO_AYAHS complet 604 pages (Mushaf Médina)
- Calendrier mensuel
- Profil : sélection langue, traduction, récitant
- Profil : prénom/kunya sauvegardés et grisés une fois saisis (unlock uniquement via reset)
- Profil : boutons Homme/Femme grisés une fois sélectionné (unlock uniquement via reset)
- Sync cloud Supabase (toutes les clés dans SYNC_KEYS)
- Bouton reset dans profil (réinitialise localStorage + cloud + redirect index.html)
- Login OTP 6 chiffres (à confirmer après test)
- Instagram footer : `_blank` sur toutes les pages

### ⚠️ À tester / en suspens
- Login OTP : était en rate limit Supabase le 24 soir — retester
- Reset profil : fonctionnel en théorie, à confirmer en vrai device

### ✅ Bugs corrigés (session suivante)
- Dashboard : avatar cliquable
- Lecteur : audio + ergonomie améliorés
- Lecteur : marquer comme médité fonctionnel
- Calendrier : commence à date_debut (et non au 1er du mois)
- Profil : flèche retour fonctionnelle

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
- **Dashboard exception** : sources séparées `src/pages/dashboard-bloom.html` et `src/pages/dashboard-serenity.html`
- Jamais `toISOString()` pour les dates → `getFullYear/getMonth/getDate`
- Jamais `prompt()` → toujours inputs inline
- `tilawa_last_page` = prochaine page À LIRE (pas la dernière lue)
- `window._arabicData` et `window._maachData` doivent être en tête du HTML (script 1)
- Formule hizb modulo : `((Math.floor(h) - 1) % 60) + 1` pour wrap 1→60 après Khatma

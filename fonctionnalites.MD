# Tilawa Tour — Fonctionnalités complètes

## Concept
Application PWA française d'accompagnement à la lecture du Coran.
Deux thèmes : Serenity (homme, vert émeraude #00917c) et Bloom (femme, terracotta #6a5b53).
Slogan : "Cheminer avec le Coran, mois après mois."
Instagram : https://www.instagram.com/jumua_and_me
Copyright : © 2026 Tilawa Tour • Cheminer avec le Coran, mois après mois.

## Pages et fonctionnalités

### index.html — Sélection du thème
- L'utilisateur choisit entre Serenity (Homme) et Bloom (Femme)
- Le choix est sauvegardé dans localStorage (tilawa_programme.theme)
- Redirige automatiquement si un thème est déjà sauvegardé

### plan_*.html — Configuration du programme
- Sélection du rythme parmi 5 options :
  ½ hizb/jour = 5 pages = 1 khatma en 4 mois
  1 hizb/jour = 10 pages = 1 khatma en 2 mois
  2 hizbs/jour = 20 pages = 1 khatma en 30 jours ★ (défaut)
  3 hizbs/jour = 30 pages = 1 khatma en 20 jours
  4 hizbs/jour = 40 pages = 1 khatma en 15 jours
- Sélection de la date de début (aujourd'hui / demain / 1er du mois / date libre)
- La date ne doit PAS utiliser toISOString() → utiliser getFullYear/getMonth/getDate pour éviter décalage UTC
- La durée khatma est calculée sur 60 hizbs officiels (pas 604 pages)
- Affichage de la date de fin calculée (grégorienne + hégirienne)
- Sélection de la langue (Français, Anglais, Arabe)
- Sélection de la traduction (Rachid Maach / Hamidullah)
- Sélection du récitant (Cheikh Abdullah Basfar)
- Sauvegarde dans localStorage key "tilawa_programme" :
  { theme, pages_jour, hizbs_jour, date_debut (YYYY-MM-DD local), langue, traduction, recitant }

### dashboard_*_v4.html — Tableau de bord principal
- Salutation genrée : "cher voyageur" (Serenity) / "chère voyageuse" (Bloom)
- Double date : grégorienne + hégirienne (PAS de NaN — utiliser en-u-ca-islamic partout)
- Jauge circulaire de progression (% de la khatma accompli)
- Avatar cliquable → redirige vers profil_*.html

#### Bento Grid 3 colonnes :
**Bloc 1 — Lecture du jour**
- Titre : "Lecture du jour"
- Hizbs du jour calculés depuis tilawa_last_page via PAGE_TO_HIZB officiel
- tilawa_last_page = prochaine page À LIRE (pas dernière lue)
- lastPageLue = tilawa_last_page - 1
- Début : sourate + verset + page depuis HIZB_TABLE[hizbActuel]
- Fin : sourate + verset + page depuis HIZB_TABLE[hizbFin + 1] - 1
- Ayat al-Kursi en arabe en bas

**Bloc 2 — Programme du jour**
- Rappel du hizb du jour
- Bouton principal (doré/secondary-container) : "✓ J'ai fait mon programme"
  → marque le jour dans tilawa_done_days{"YYYY-MM-DD": true}
  → avance tilawa_last_page de pages_jour
  → recharge la page
- Titre : "Non, je me suis arrêté à la page :"
- Input numérique (1-604) + bouton "◎ Valider"
  → sauvegarde tilawa_last_page = page saisie
  → recharge la page
- Pas de prompt() — toujours un input inline
- Quand le jour est validé : affiche grande icône ✓ + "Programme accompli !" + "Barak Allahou fikoum" en blanc
- En bas (texte blanc) : "Reste à lire — X Hizbs • X jours" + barre de progression

**Bloc 3 — Citation**
- Citation coranique sur fond sombre

#### Blocs suivants :
- Bouton CTA "Continuer la lecture" → lecteur_*.html
- Bloc Régularité : barre de progression % khatma accompli + page actuelle/604
- Bloc Dernière page lue : tilawa_last_page - 1, nom de sourate correspondant
- Bloc Statistiques : total lu (lastPageLue), pages/jour, % avancement, khatmates/an
- Programme de la semaine :
  → Partir de tilawa_last_page pour aujourd'hui (pas de dateDebut)
  → Aujourd'hui = pages tilawa_last_page à tilawa_last_page + pages_jour - 1
  → Demain = +pages_jour, etc.
  → Hizbs affichés depuis PAGE_TO_HIZB officiel
  → Exactement hizbs_jour hizbs par jour (ex: 2 hizbs/jour → "Hizb 5-6" pas "Hizb 5-8")
  → Pas de bouton "Fait" dans le programme de la semaine (il est dans le bloc Programme du jour)

### lecteur_*.html — Lecteur Coran
- S'ouvre à tilawa_last_page (prochaine page à lire)
- Si pas de localStorage → page 1 (Al-Fatiha)
- currentPage initialisé AVANT tout appel JS aux fonctions d'affichage
- Valeurs HTML statiques neutres (—) pas de valeurs codées en dur (22, 3.6%)
- Navigation : Suiv. / Préc. (attention à l'ordre : Suiv. = page suivante dans la lecture)
- Texte arabe Uthmani depuis window._arabicData
- Traduction Rachid Maach depuis window._maachData
- Traduction Hamidullah depuis API alquran.cloud
- Tajwid : 6 couleurs avec légende (Mad, Ghounnah, Tafkhim, Qalqalah, Ithar, Lettre muette)
- Bouton "Page lue" → sauvegarde dans tilawa_done_days
- Tadabbur / Marquer comme médité :
  → sauvegarde page dans localStorage key "tilawa_meditated" (array JSON)
  → visuellement coché/décoché selon état
  → persiste entre sessions
- Un seul lecteur audio (pas deux) :
  → Source principale : cdn.islamic.network/quran/audio/128/ar.abdullahbasfar/{abs}.mp3
  → abs = SURAH_START[surah] + ayah
  → Fallback : everyayah.com/data/Abdullah_Basfar_192kbps/{SSS}{AAA}.mp3
  → SURAH_START = [0,1,8,294,494,670,790,955,1161,1235,1365,1474,1597,1708,1751,1803,1902,2030,2141,2251,2349,2484,2596,2674,2791,2856,3002,3062,3160,3253,3341,3410,3470,3504,3534,3607,3661,3706,3789,3862,3925,4000,4082,4152,4200,4272,4324,4403,4473,4511,4545,4584,4614,4630,4676,4736,4756,4801,4813,4822,4832,4842,4852,4862,4872,4882,4892,4902,4912,4922,4933,4944,4952,4963,4972,4979,4994,5000,5012,5022,5033,5047,5067,5076,5088,5097,5108,5122,5136,5143,5149,5157,5163,5172,5178,5186,5194,5200,5207,5215,5220,5228,5235,5240,5246,5254,5261,5266,5272,5279,5285,5291,5294,5298,5303,5308]
- SURAH_NAMES sans guillemets cassés (Al-Maidah pas Al-Ma"idah)
- Hizb affiché en bas : depuis PAGE_TO_HIZB officiel (pas Math.ceil(page/10))
- Bouton TERMINÉE → sauvegarde progression + retour dashboard

### calendrier_*.html — Calendrier mensuel
- Affiche le mois en cours
- Navigation mois précédent / suivant
- Lire date_debut depuis localStorage.tilawa_programme.date_debut
- Si pas de programme → message "Configurez votre programme d'abord"
- Les jours AVANT date_debut ne sont pas comptabilisés
- Commencer le surlignage à partir de date_debut uniquement
- Case aujourd'hui : surlignée en primary avec hizb du jour + sourate + pages
- Cases passées : indiquent si le jour a été fait (tilawa_done_days)
- Bloc objectif dynamique :
  → id="obj-titre" : "Khatma dans X jours" calculé depuis tilawa_last_page
  → id="obj-desc" : page actuelle / 604 + % + pages/jour

### bilan_*.html — Bilan annuel
- Progression annuelle (khatmates complètes)
- Objectif Ramadan
- Calcul hégirien pour Ramadan estimé
- Khatmates depuis tilawa_khatmates_annee

### profil_*.html — Profil et réglages
- Avatar (image base64 selon thème)
- Flèche ← retour : window.history.back() si history.length > 1, sinon dashboard_*.html
- Sélection thème : boutons avec "Homme" grand + "Serenity" petit en dessous
  et "Femme" grand + "Bloom" petit en dessous (text-lg, pas text-2xl)
- Sélection langue (select w-48 pour éviter la flèche sur le texte)
- Sélection traduction (select w-48)
- Récitant : Cheikh Abdullah Basfar
- Tous les réglages sauvegardés dans tilawa_programme via localStorage

### lexique_*.html — Lexique Tajwid
- 6 règles avec couleurs : Mad (rouge), Ghounnah (vert foncé), Tafkhim (vert clair),
  Qalqalah (bleu foncé), Ithar (bleu clair), Lettre muette (gris)
- Descriptions détaillées de chaque règle

### celebration_*.html — Khatma accomplie
- Affiché après completion de 604 pages
- Incrémente tilawa_khatmates_annee
- Remet tilawa_last_page à 1 pour nouvelle khatma

## Données Coran officielles

### Hizbs officiels (60 hizbs au verset près)
- HIZB_TABLE : {1: {s:1, v:1, p:1}, 2: {s:2, v:75, p:11}, ...} — 60 entrées
- PAGE_TO_HIZB : pour chaque page 1-604, son hizb officiel
- SURAH_NAMES : 114 sourates sans guillemets cassés
- Ces trois tables doivent être disponibles dans TOUS les fichiers HTML

### localStorage — clés officielles
- tilawa_programme : {theme, pages_jour, hizbs_jour, date_debut, langue, traduction, recitant}
- tilawa_last_page : integer string, prochaine page À LIRE (1-604)
- tilawa_done_days : {"YYYY-MM-DD": true} jours validés
- tilawa_khatmates_annee : integer string
- tilawa_meditated : array JSON de pages méditées
- tilawa_bookmark : integer string page mise en signet
- tilawa_langue : string préférence langue

## Design System

### Serenity (Homme)
- Primary : #00917c | Secondary : #735c00 | Background : #f8faf8
- Fonts : Noto Serif (headlines) + Manrope (body, class font-label)
- Icon weight : 400

### Bloom (Femme)
- Primary : #6a5b53 | Secondary : #6a5d43 | Background : #fcf9f5
- Fonts : Noto Serif (headlines) + Plus Jakarta Sans (body, class font-jakarta)
- Icon weight : 300

### Commun
- Arabic font : Amiri, dir="rtl"
- Material Symbols Outlined (Google Icons CDN)
- Tailwind CSS CDN
- Navigation bottom fixe : Accueil / Coran / Calendrier / Programme / Profil
- Footer : "Proposé par JUMUA & Me" + Instagram + Copyright

## Règles techniques critiques
- Jamais de prompt() — toujours des inputs inline
- Jamais de toISOString() pour les dates → getFullYear/getMonth/getDate
- window._arabicData et window._maachData en TÊTE du HTML (script 1)
- Le script JS principal doit être placé AVANT les boutons HTML qui appellent ses fonctions
- tilawa_last_page = prochaine page à lire | lastPageLue = tilawa_last_page - 1
- Une khatma = 60 hizbs officiels (pas 604/pages_jour jours)
- Pas de font-variation-settings avec apostrophes mal échappées dans les strings JS
- Toujours modifier src/pages/ puis npm run build — jamais les fichiers générés
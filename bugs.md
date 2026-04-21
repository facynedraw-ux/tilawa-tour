Tu travailles sur le projet Tilawa Tour (PWA Coran). 
Toujours modifier src/pages/ puis lancer npm run build. 
Ne jamais modifier les fichiers générés à la racine directement.
Voici les bugs à corriger un par un, en testant après chaque correction :

1. DASHBOARD — Avatar
L'avatar (image de profil en haut à droite) doit être un lien cliquable vers profil_{{THEME}}.html. Actuellement il ne fait rien.

2. DASHBOARD — Programme de la semaine / Hizbs incorrects
Le programme de la semaine affiche "Hizb 1 à 4" pour le jour 1 alors que l'utilisateur a sélectionné 2 hizbs/jour (1 khatma/mois). 
La logique correcte : 
- Jour 1 = Hizb 1-2, Jour 2 = Hizb 3-4, Jour 3 = Hizb 5-6, etc.
- Lire tilawa_last_page depuis localStorage pour connaître le hizb de départ
- Utiliser PAGE_TO_HIZB[page] pour obtenir le vrai numéro de hizb
- Afficher exactement hizbs_par_jour hizbs par jour (ex: 2 hizbs/jour → "Hizb 1-2" puis "Hizb 3-4")

3. LECTEUR — Page de départ incorrecte
Quand on arrive depuis "Reprendre la lecture", le lecteur affiche la page 22 au lieu de la page stockée dans localStorage tilawa_last_page.
- Si tilawa_last_page n'existe pas ou vaut 1 → afficher page 1 (Al-Fatiha)
- currentPage doit être initialisé AVANT tout appel à updateProgress() ou renderPage()
- Vérifier que le script JS qui définit currentPage et toutes les fonctions (playPage, playAyah, nextPage, prevPage) est placé AVANT le HTML des boutons qui les appellent
- Les valeurs statiques dans le HTML (page-display, pg-prog, page-info, progress-pct) doivent être "—" et non "22" ou "3.6%"

4. LECTEUR — Audio ne fonctionne pas + ergonomie
Actuellement il y a deux lecteurs audio (un par verset + un par page) ce qui est confus.
- Garder un seul lecteur audio, placé de façon logique dans l'interface
- Utiliser cdn.islamic.network comme source principale : https://cdn.islamic.network/quran/audio/128/ar.abdullahbasfar/{numéro_absolu}.mp3
  où numéro_absolu = SURAH_START[surah] + ayah
  avec SURAH_START = [0,1,8,294,494,670,790,955,1161,1235,1365,1474,1597,1708,1751,1803,1902,2030,2141,2251,2349,2484,2596,2674,2791,2856,3002,3062,3160,3253,3341,3410,3470,3504,3534,3607,3661,3706,3789,3862,3925,4000,4082,4152,4200,4272,4324,4403,4473,4511,4545,4584,4614,4630,4676,4736,4756,4801,4813,4822,4832,4842,4852,4862,4872,4882,4892,4902,4912,4922,4933,4944,4952,4963,4972,4979,4994,5000,5012,5022,5033,5047,5067,5076,5088,5097,5108,5122,5136,5143,5149,5157,5163,5172,5178,5186,5194,5200,5207,5215,5220,5228,5235,5240,5246,5254,5261,5266,5272,5279,5285,5291,5294,5298,5303,5308]
- Fallback sur everyayah.com si islamic.network échoue : https://everyayah.com/data/Abdullah_Basfar_192kbps/{SSS}{AAA}.mp3
- Le SURAH_NAMES ne doit pas contenir de guillemets doubles dans les valeurs (Al-Ma"idah → Al-Maidah, Al-An"am → Al-Anam, etc.)

5. LECTEUR — Marquer comme médité ne fonctionne pas
Le bouton "Marquer comme médité" (tadabbur) doit :
- Sauvegarder la page dans localStorage key "tilawa_meditated" (array JSON)
- Visuellement cocher/décocher selon l'état sauvegardé
- Persister entre les sessions

6. CALENDRIER — Commence au 1er du mois au lieu du début du programme
Le calendrier doit :
- Lire la date de début depuis localStorage : JSON.parse(localStorage.getItem('tilawa_programme'))?.date_debut
- Si aucun programme n'existe → afficher un message "Configurez votre programme d'abord" sans cases colorées
- Si un programme existe → commencer le surlignage à partir de date_debut, pas du 1er du mois
- Les jours avant date_debut dans le même mois ne doivent pas être comptabilisés comme jours de lecture

7. PROFIL — Flèche retour ne fonctionne pas
La flèche ← en haut à gauche du profil doit :
- Revenir à la page précédente si history.length > 1 : window.history.back()
- Sinon rediriger vers dashboard_{{THEME}}.html

Après chaque correction, lance npm run build et vérifie dans le navigateur sur http://localhost:8080.
Teste chaque point et confirme qu'il est résolu avant de passer au suivant.
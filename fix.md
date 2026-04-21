Dans src/pages/calendrier.html, corriger la logique d'affichage des cases du calendrier :

PROBLÈME : Quand les 60 hizbs sont terminés (hizb 60 atteint), 
le calendrier continue d'afficher "HIZB 60-60" pour tous les jours suivants 
au lieu d'afficher des cases vides.

CORRECTION :
1. Calculer le nombre de jours total du programme : Math.ceil(60 / hizbs_jour)
2. Calculer la date de fin du programme : date_debut + nb_jours
3. Pour chaque case du calendrier :
   - Si la date est AVANT date_debut → case vide (pas de hizb affiché)
   - Si la date est ENTRE date_debut et date_fin → afficher le hizb correspondant
   - Si la date est APRÈS date_fin → case vide (programme terminé, rien à afficher)
4. Si tilawa_last_page >= 604 ou si tous les 60 hizbs sont lus → 
   afficher un message dans le bloc objectif : 
   "Khatma accomplie ! Lancez un nouveau programme pour continuer."
5. Si aucun programme n'existe dans localStorage → 
   afficher "Configurez votre programme d'abord" sans aucun hizb dans les cases

Puis npm run build et tester sur http://localhost:8080/calendrier_serenity.html
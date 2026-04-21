Dans src/pages/profil.html, corriger la sélection du thème :

PROBLÈME : Le profil Serenity affiche "Femme/Bloom" comme sélectionné 
au lieu de "Homme/Serenity", et le switch entre les deux ne fonctionne pas.

CORRECTION :
1. Au chargement, lire le thème actuel depuis localStorage :
   const theme = JSON.parse(localStorage.getItem('tilawa_programme') || '{}').theme || '{{THEME}}';

2. Initialiser visuellement le bon bouton comme sélectionné selon ce thème :
   - Si theme === 'serenity' → bouton Homme/Serenity actif, bouton Femme/Bloom inactif
   - Si theme === 'bloom' → bouton Femme/Bloom actif, bouton Homme/Serenity inactif

3. La fonction setTheme(theme) doit :
   - Mettre à jour visuellement les deux boutons (bordure + icône ✓ sur le actif)
   - Sauvegarder dans localStorage : 
     prog.theme = theme
     localStorage.setItem('tilawa_programme', JSON.stringify(prog))
   - Rediriger vers profil_serenity.html ou profil_bloom.html selon le thème choisi

4. Les boutons affichent :
   - Bouton gauche : "Homme" (text-lg, font-bold) + "Serenity" (text-xs, en dessous)
   - Bouton droit : "Femme" (text-lg, font-bold) + "Bloom" (text-xs, en dessous)
   - Bouton actif : bordure primary + icône check_circle
   - Bouton inactif : bordure outline-variant, pas d'icône

Puis npm run build et tester les deux profils.
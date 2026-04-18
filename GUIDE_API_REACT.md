# Guide des Bonnes Pratiques : Interface React & API FastAPI

Ce document regroupe les règles d'or pour optimiser les performances de notre application de scouting, en garantissant une interaction fluide entre le frontend React et notre backend FastAPI/PostgreSQL.

---

## 1. Analyse du Contexte
L'architecture est **découplée**. Notre serveur VPS (16 Go RAM) et PostgreSQL (shared_buffers de 4 Go) sont taillés pour la performance, mais le client React doit être un bon citoyen pour ne pas saturer les ressources.

## 2. Règle n°1 : Exploiter la Pagination
Le backend impose une sécurité par défaut : `limit: int = 100`.
- **Comportement par défaut** : `fetch('/api/players')` retourne 100 joueurs.
- **Optimisation** : Ne demandez que le volume nécessaire. Si besoin de plus, spécifiez-le explicitement.
- **Exemple** : `fetch('/api/players?limit=500')`.

## 3. Règle n°2 : Politique de Cache (Ne pas spammer le serveur)
Évitez de solliciter la base de données à chaque interaction utilisateur.
- **Chargement initial** : Utilisez `useEffect` avec un tableau de dépendances vide `[]` pour ne charger les données qu'une seule fois.
- **Filtrage local** : Pour trier ou filtrer (ex: par poste), utilisez les fonctions JavaScript natives sur le state local (`players.filter(...)`) au lieu de refaire une requête réseau.

## 4. Règle n°3 : Maîtriser le volume des données granulaires
Les données sportives (Opta/Wyscout) sont massives. Charger des milliers de lignes avec des centaines de colonnes peut ralentir le navigateur.
- **Virtualisation** : Utilisez des composants de tableaux virtuels comme **AG Grid** ou **TanStack Table**.
- **Avantage** : Seules les lignes visibles à l'écran sont "dessinées" dans le DOM, même si 500+ lignes sont chargées en mémoire.

## 5. Règle n°4 : Sécuriser les champs vides
Le backend nettoie les données et renvoie des chaînes vides `""` pour les valeurs manquantes.
- **Précaution Frontend** : Prévoyez toujours une valeur de repli (fallback) dans vos composants.
- **Exemple** : 
  ```jsx
  <span>{player.team_name || "Équipe non renseignée"}</span>
  ```

---
*Dernière mise à jour : Avril 2026*

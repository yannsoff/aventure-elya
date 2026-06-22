# L'Aventure d'Elya

Plateforme web d'apprentissage **gamifiée et adaptative** pour une enfant de 5 ans
(transition Year 1 → Year 2, National Curriculum / White Rose Maths).

> Principe directeur n°1 — **la confiance avant tout** : aucune erreur n'est punie,
> chaque séance commence et finit sur une réussite, célébrations généreuses.

## Ce que fait l'app

- **Carte-aventure de 8 îles** (1 île = 1 semaine), chemin de pas, compagnon animal qui grandit.
- **Séance quotidienne** (~15 min) d'enchaînements de mini-jeux pilotés par un **moteur adaptatif**.
- **Répétition espacée (Leitner 4 boîtes)** + **banque d'erreurs** : les notions ratées reviennent en priorité.
- **Ajustement de difficulté** par compétence (précision glissante).
- **Gamification** : étoiles, série de jours (streak), niveaux du compagnon, badges, **coffre hebdomadaire**.
- **Audio-first bilingue** : consignes/encouragements en **français**, contenu d'apprentissage en **anglais**.
- **Zone parent** (code PIN) : tableau de bord, « à consolider », validation de jour, récompenses, ressources, export JSON.
- **PWA installable** (iPad/téléphone/ordinateur), **fonctionne hors-ligne**, persistance locale **IndexedDB**.

## Stack

Vite · React 18 · TypeScript · Tailwind CSS · Framer Motion · Zustand · Dexie (IndexedDB) ·
Web Speech API · canvas-confetti · vite-plugin-pwa.

## Démarrer

```bash
npm install
npm run dev      # développement
npm run build    # build de production (dossier dist/)
npm run preview  # prévisualiser le build
```

## Architecture (découplage contenu / moteur)

- `src/content/` — données « seed » (mots, sons, lettres, phrases, générateurs maths, 8 semaines).
- `src/engine/` — répétition espacée, constructeur de séance adaptatif, progression/badges.
- `src/games/` — les 16 mini-jeux, pilotés par les items dus.
- `src/storage/` — `StorageAdapter` abstrait + `DexieAdapter` (un `SupabaseAdapter` cloud pourra être ajouté sans réécriture).
- `src/screens/` — splash, onboarding, carte, semaine, séance, coffre, trophées, zone parent.

## Déploiement

Déployé automatiquement sur **GitHub Pages** via GitHub Actions (`.github/workflows/deploy.yml`)
à chaque push sur `main`. Le `base` Vite est `/rankingia/`.

Personnalisation : prénom, compagnon et couleur sont configurés au premier lancement
(et modifiables via une réinitialisation dans la zone parent).

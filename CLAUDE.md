# CLAUDE.md - Ready Steady Bang

## Projet
Remake du jeu mobile **Ready Steady Bang** - un jeu de duel western "quick draw" où le joueur doit tirer plus vite que son adversaire après le signal "BANG!".

## Stack Technique
- **Framework**: Phaser.js 3.80+ (TypeScript)
- **Build**: Vite
- **Mobile**: Capacitor (iOS + Android)
- **Langage**: TypeScript strict

## Structure du Projet
```
/game                    # Code source du jeu
  /src
    /scenes              # Scènes Phaser (Menu, Game, etc.)
    /sprites             # Classes des sprites/animations
    /config              # Configuration (niveaux, animations)
    /utils               # Utilitaires
    /audio               # Gestionnaire audio
  /public/assets         # Assets du jeu
    /images              # PNG des sprites
    /sounds              # WAV/MP3
    /fonts               # Polices TTF
    /spritesheets        # Spritesheets + JSON atlas

/assets                  # Assets extraits de l'APK original (source)
/decompiled              # APK décompilé (ne pas commit)
/GAME_ANALYSIS.md        # Documentation complète du jeu original
```

## Mécanique de Jeu
1. Écran divisé en 2 zones (joueur vs adversaire)
2. Séquence "READY" → "STEADY" → délai aléatoire → "BANG!"
3. Premier à taper APRÈS le "BANG" gagne
4. Taper AVANT = disqualification (coward/miss)

## Données des Niveaux
Depuis `assets/animations/levels.plist`:
- Level 1: Arthur Rightus (0.352s)
- Level 2: Bill Droolin (0.295s)
- Level 3: Sloe Jim (0.275s)
- Level 4: Chaps Middlegun (0.250s)
- Level 5: Van Queef (0.225s)
- Level 6: Thomas Edward (0.200s)
- Level 7: Doc Hunter (0.190s)
- Level 8: Texas Slaughter (0.180s)
- Level 9: Aberdeen Bangus (0.175s)
- Level 10: The Cowboy (0.160s)

## Animations (depuis rsbang.plist)
- `stand` - Position d'attente (loop)
- `shoot` - Tir
- `win` - Victoire + `win_loop`
- `death_1` à `death_31` - 31 animations de mort
- `coward` - A tiré trop tôt
- `miss` - Tir manqué
- `angry` - Colère du perdant

## Sons Clés
- `ready.wav`, `steady.wav`, `rsbang.wav` - Séquence de jeu
- `bang_1.wav` - Coup de feu
- `winMusic_1.wav`, `loseMusic_1.wav` - Musiques fin de round
- `death_1.wav` à `death_31.wav` - Sons des morts

## Commandes
```bash
cd game
npm install          # Installer les dépendances
npm run dev          # Lancer en dev (localhost:3000)
npm run build        # Build production
npm run build:mobile # Build + sync Capacitor
```

## Conventions
- Tout en TypeScript strict
- Classes ES6 pour les sprites
- Configuration externalisée (pas de magic numbers)
- Noms de fichiers en kebab-case
- Classes en PascalCase

## Assets à Convertir
Les spritesheets `.plist` (format Cocos2D) doivent être convertis en JSON (format Phaser).
Script de conversion dans `/scripts/convert-plist.js`.

## TODO
- [ ] Convertir les spritesheets plist → JSON atlas
- [ ] Implémenter BootScene (preload)
- [ ] Implémenter MenuScene
- [ ] Implémenter GameScene (1P)
- [ ] Implémenter MultiplayerScene (2P)
- [ ] Implémenter KillGalleryScene
- [ ] Ajouter Capacitor pour mobile
- [ ] Tests sur iOS/Android

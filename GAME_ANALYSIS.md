# Ready Steady Bang - Analyse Complète

## 📱 Informations Générales
- **Nom**: Ready Steady Bang (RSB)
- **Bundle ID**: `com.noodlecake.rsb`
- **Version**: 2.0.2
- **Développeur original**: Animade & Hover Studio
- **Version Android par**: Noodlecake Games
- **Moteur**: Cocos2D (porté sur Android via Apportable)
- **Orientation**: Portrait uniquement

---

## 🎮 Concept du Jeu

**Ready Steady Bang** est un jeu de duel western au style "quick draw" (dégainer rapidement).

### Règles de Base
1. L'écran est divisé en deux zones (joueur vs adversaire ou 2 joueurs)
2. Le joueur attend le signal "BANG!" (visuel + audio)
3. Le plus rapide à taper après le "BANG" gagne
4. **ATTENTION**: Taper AVANT le "BANG" = miss (tir raté), l'adversaire gagne

### Modes de Jeu
- **1 Joueur**: Affronter des adversaires IA de difficulté croissante
- **2 Joueurs**: Duel local sur le même appareil

---

## 🤠 Niveaux et Adversaires

### Configuration des 10 niveaux (depuis `levels.plist`)

| Niveau | Nom | Vitesse de Dégaine (secondes) |
|--------|-----|-------------------------------|
| 1 | Arthur Rightus | 0.352s |
| 2 | Bill Droolin | 0.295s |
| 3 | Sloe Jim | 0.275s |
| 4 | Chaps Middlegun | 0.250s |
| 5 | Van Queef | 0.225s |
| 6 | Thomas Edward | 0.200s |
| 7 | Doc Hunter | 0.190s |
| 8 | Texas Slaughter | 0.180s |
| 9 | Aberdeen Bangus | 0.175s |
| 10 | The Cowboy (Boss Final) | 0.160s |

**Note**: La vitesse de dégaine représente le temps de réaction de l'IA en secondes après le "BANG".

---

## 🎬 Système d'Animation

### États du Personnage (depuis `rsbang.plist`)

| État | Description | Loop | Fichiers |
|------|-------------|------|----------|
| `stand` | Position d'attente | Oui | stand_1, stand_2 |
| `fidget` | Mouvement nerveux | Non | fidget_1 |
| `gunsling` | Dégainer | Non | gunsling_1 |
| `shoot` | Tirer | Non | shoot_1, shoot_2 |
| `miss` | Tir manqué (trop tôt) | Non | miss_1, miss_2 |
| `win` | Victoire | Oui (follow loop) | win_1 à win_4 |
| `win_loop` | Animation victoire continue | Oui | win_loop_2/3/4 |
| `coward` | Lâche (a tiré trop tôt) | Non | coward_1, coward_2 |
| `coward_loop` | Animation lâche continue | Oui | coward_loop_1 |
| `angry` | Colère (perdant) | Non | angry_1 |
| `angry_loop` | Animation colère continue | Oui | angry_loop_1 |
| `death` | Animations de mort | Non | death_1 à death_31 |
| `menu` | Animation menu | Non | menu_1, menu_2 |

### 31 Animations de Mort Uniques

Chaque animation a un nom et une description:

| ID | Nom | Description | Type d'arme |
|----|-----|-------------|-------------|
| death_1 | "down the barrel" | shot you in the chest | gun 0 |
| death_2 | "eye crosser" | shot you between the eyes | gun 0 |
| death_3 | "shoulder pin" | shot you up | gun 0 |
| death_4 | "spin cycle" | shot you up | gun 0 |
| death_5 | "ball banger" | popped your scrotum | gun 0 |
| death_6 | "stagger dagger" | shot you up | gun 1 |
| death_7 | "internal pleading" | shot you up | gun 1 |
| death_8 | "coffin drop" | shot you up | gun 1 |
| death_9 | "sigh'n'die" | shot you up | gun 1 |
| death_10 | "hangman's faint" | popped you in the face | gun 1 |
| death_11 | "human caterpillar" | split your gas pipe | gun 2 |
| death_12 | "hard against the wall" | knock you off your feet | gun 2 |
| death_13 | "face plant" | shot your legs out | gun 2 |
| death_14 | "hat juggler" | made you look silly | gun 2 |
| death_15 | "corkscrew" | killed you good | gun 2 |
| death_16 | "headstand'n'land" | shot you off your feet | gun 3 |
| death_17 | "trough splosh" | soaked your corpse | gun 3 |
| death_18 | "bum slider" | shot you down | gun 3 |
| death_19 | "cart wheels" | sent you flying | gun 3 |
| death_20 | "jack in the box" | shot you up | gun 3 |
| death_21 | "sausage circus" | blew up your body | gun 4 |
| death_22 | "body poppin'" | blew up your body | gun 4 |
| death_23 | "legless" | blew up your body | gun 4 |
| death_24 | "arm popper" | blew up your body | gun 4 |
| death_25 | "dead head" | blew up your body | gun 4 |
| death_26 | "reverse cowboy" | blew up your body | gun 5 |
| death_27 | "dead arms" | shot off your arms | gun 5 |
| death_28 | "catherine wheel" | span you silly | gun 5 |
| death_29 | "pop hop" | shot off your leg | gun 5 |
| death_30 | "down the middle" | shot you in two | gun 5 |
| death_31 | "mystery kill" | shot ya! | gun 6 |

**Types d'armes débloqués en progressant**:
- Gun 0-1: Arme de base
- Gun 2-5: Armes plus puissantes
- Gun 6: Arme secrète

---

## 🔊 Système Audio

### Sons de Gameplay
| Fichier | Usage |
|---------|-------|
| `ready.wav` | Son "Ready" |
| `steady.wav` | Son "Steady" |
| `rsbang.wav` | Son "BANG!" (signal de tir) |
| `bang_1.wav` | Son du coup de feu |
| `miss_1.wav` | Tir manqué |
| `click_1.wav` | Clic interface |
| `back.wav` | Retour menu |
| `spin_1.wav` | Rotation (revolver?) |
| `rev.wav` | Son de révolver |

### Musiques
| Fichier | Usage |
|---------|-------|
| `winMusic_1.wav` | Musique de victoire |
| `loseMusic_1.wav` | Musique de défaite |

### Sons de Mort (31 fichiers)
`death_1.wav` à `death_31.wav` - Chaque animation de mort a son propre son.

---

## 🏆 Succès / Achievements

| ID | Nom |
|----|-----|
| goldBullet | Balle d'or |
| silverBullet | Balle d'argent |
| bronzeBullet | Balle de bronze |
| sheriffBadge | Badge du shérif |
| wanted | Recherché |
| grave | Tombe |
| gun1-5 | Débloquer les armes |
| gossip | Commère (partage social?) |
| cowboyKill | Tuer le Cowboy (boss final) |

---

## 🎨 Style Visuel

### Palette et Design
- Style **cartoon/animation frame-by-frame**
- Personnages en **silhouettes noires** sur fond coloré
- Chaque niveau a son propre fond (`level1.png` à `level10.png`)
- Versions HD disponibles (`-hd.png`)

### Polices
- `uni05_53.ttf`
- `uni05_54.ttf`
- `uni05_63.ttf`
- `uni05_64.ttf`
- `Roboto-Bold.ttf`

### Format des Spritesheets
- Format: Cocos2D plist (TexturePacker)
- Tailles: 256x64 à 512x512 pixels
- Les sprites sont "trimmed" pour optimisation

---

## 🌍 Localisations Disponibles

- Anglais (en)
- Français (fr)
- Allemand (de)
- Espagnol (es, es-419)
- Italien (it)
- Néerlandais (nl)
- Japonais (ja)
- Russe (ru)
- Chinois simplifié (zh-Hans)
- Chinois traditionnel (zh-Hant)
- Coréen (ko)
- Arabe (ar)
- Turc (tr)
- Portugais brésilien (pt-BR)

---

## 🔧 Architecture Technique

### Framework
- **Cocos2D** (moteur de jeu 2D)
- **Apportable** (conversion iOS → Android)
- Librairies natives: OpenAL (audio), OpenGL ES

### Structure des Fichiers
```
assets/
├── sprites/          # PNG des personnages et animations
├── animations/       # Fichiers .plist (spritesheets)
├── sounds/           # Fichiers .wav
├── fonts/            # Polices TTF
├── ui/               # Éléments d'interface
├── localization/     # Traductions
└── levels.plist      # Configuration des niveaux
```

---

## 🎯 Mécanique de Jeu Détaillée

### Flux de Jeu
1. **Écran titre** → Menu principal
2. **Sélection mode** → 1P ou 2P
3. **Pré-duel** → Affichage adversaire
4. **Phase "READY"** → Son + texte
5. **Phase "STEADY"** → Son + texte (durée variable aléatoire)
6. **Phase "BANG!"** → Signal de tir
7. **Résolution** → Qui a tiré le premier?
8. **Animation résultat** → Win/Death/Miss/Coward
9. **Score** → Mise à jour et affichage

### Système de Score
- Scores enregistrés dans le leaderboard
- Système d'étoiles (0-3) par niveau (fichiers stars0-3.png)
- Progression débloque nouveaux niveaux et armes

---

## 📁 Structure des Assets Extraits

```
/ReadyBang/
├── decompiled/
│   ├── apk_extracted/      # APK décompressé brut
│   └── jadx_output/        # Code Java décompilé
├── assets/
│   ├── sounds/             # 43 fichiers WAV
│   ├── sprites/            # Images des personnages
│   ├── animations/         # Fichiers plist
│   ├── fonts/              # 5 polices TTF
│   ├── ui/                 # Éléments interface
│   └── localization/       # 15 langues
└── GAME_ANALYSIS.md        # Ce document
```

---

## 💡 Notes pour Recréation

### Éléments Clés à Reproduire
1. **Timing précis** du "Ready... Steady... BANG!"
2. **Délai aléatoire** entre Steady et Bang (empêche triche)
3. **Détection du tap** avec timestamp précis
4. **Système d'armes** progressif (affects les animations de mort)
5. **31 animations de mort** uniques comme récompense de progression

### Assets Réutilisables
- ✅ Toutes les images PNG
- ✅ Tous les sons WAV
- ✅ Polices TTF
- ✅ Configuration des niveaux
- ✅ Localisations

### À Recréer
- ⚠️ Code du jeu (l'original est en Objective-C/Cocos2D, porté via Apportable)
- ⚠️ Système de spritesheets (parser les .plist)
- ⚠️ Intégrations Game Center / Google Play Games

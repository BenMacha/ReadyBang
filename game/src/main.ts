import Phaser from 'phaser';
import { gameConfig } from './config/game-config';
import { BootScene } from './scenes/boot-scene';
import { MenuScene } from './scenes/menu-scene';
import { GameScene } from './scenes/game-scene';
import { LevelSelectScene } from './scenes/level-select-scene';
import { KillGalleryScene } from './scenes/kill-gallery-scene';
import { MultiplayerSetupScene } from './scenes/multiplayer-setup-scene';

const config: Phaser.Types.Core.GameConfig = {
  ...gameConfig,
  scene: [
    BootScene,
    MenuScene,
    LevelSelectScene,
    MultiplayerSetupScene,
    GameScene,
    KillGalleryScene
  ]
};

// Create game instance
const game = new Phaser.Game(config);

// Handle window resize
window.addEventListener('resize', () => {
  game.scale.refresh();
});

// Prevent context menu on right click
window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

export default game;

import Phaser from 'phaser';

// Original game resolution (iPhone 4/5 era)
export const GAME_WIDTH = 320;
export const GAME_HEIGHT = 480;

// Western style font
export const FONT_FAMILY = '"Rye", "Staatliches", "Georgia", serif';

// Colors from the original game
export const COLORS = {
  background: 0xf5f5f5,      // Light gray/white
  backgroundHex: '#f5f5f5',
  primary: 0x666666,          // Dark gray for cowboys
  primaryHex: '#666666',
  accent: 0x999999,           // Medium gray
  accentHex: '#999999',
  text: 0x333333,             // Dark text
  textHex: '#333333',
  divider: 0xcccccc,          // Divider line
  dividerHex: '#cccccc'
};

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: COLORS.backgroundHex,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    touch: {
      capture: true
    }
  },
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: true  // Sharper rendering
  }
};

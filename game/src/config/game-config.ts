import Phaser from 'phaser';

export const GAME_WIDTH = 320;
export const GAME_HEIGHT = 480;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#d4a574',
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
    pixelArt: true,
    antialias: false
  }
};

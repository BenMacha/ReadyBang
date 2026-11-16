import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game-config';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    // Background
    this.cameras.main.setBackgroundColor('#c4956a');

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 80, 'READY\nSTEADY\nBANG!', {
      fontSize: '48px',
      fontFamily: 'Arial Black',
      color: '#2c1810',
      align: 'center',
      lineSpacing: 10
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(GAME_WIDTH / 2, 180, 'A Western Quick Draw Duel', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#5c3d2e',
      align: 'center'
    });
    subtitle.setOrigin(0.5);

    // 1 Player Button
    const btn1P = this.createButton(GAME_WIDTH / 2, 280, '1 PLAYER', () => {
      this.scene.start('LevelSelectScene');
    });

    // 2 Players Button
    const btn2P = this.createButton(GAME_WIDTH / 2, 350, '2 PLAYERS', () => {
      this.scene.start('GameScene', { mode: 'multiplayer' });
    });

    // Kill Gallery Button
    const btnGallery = this.createButton(GAME_WIDTH / 2, 420, 'KILL GALLERY', () => {
      this.scene.start('KillGalleryScene');
    });

    // Add cowboy silhouette decoration (placeholder)
    this.add.rectangle(80, GAME_HEIGHT - 60, 60, 100, 0x2c1810);
    this.add.rectangle(GAME_WIDTH - 80, GAME_HEIGHT - 60, 60, 100, 0x2c1810);
  }

  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Button background
    const bg = this.add.rectangle(0, 0, 200, 50, 0x2c1810);
    bg.setStrokeStyle(3, 0x1a0f0a);
    
    // Button text
    const label = this.add.text(0, 0, text, {
      fontSize: '18px',
      fontFamily: 'Arial Black',
      color: '#d4a574'
    });
    label.setOrigin(0.5);

    container.add([bg, label]);
    container.setSize(200, 50);
    container.setInteractive({ useHandCursor: true });

    // Hover effects
    container.on('pointerover', () => {
      bg.setFillStyle(0x3d2517);
    });

    container.on('pointerout', () => {
      bg.setFillStyle(0x2c1810);
    });

    container.on('pointerdown', () => {
      bg.setFillStyle(0x1a0f0a);
    });

    container.on('pointerup', () => {
      this.playClickSound();
      callback();
    });

    return container;
  }

  private playClickSound(): void {
    if (this.sound.get('snd_click')) {
      this.sound.play('snd_click');
    }
  }
}

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT_FAMILY } from '../config/game-config';

export class MultiplayerSetupScene extends Phaser.Scene {
  private selectedRounds: number = 3;

  constructor() {
    super({ key: 'MultiplayerSetupScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.backgroundHex);
    this.selectedRounds = 3;

    // Title
    this.add.text(GAME_WIDTH / 2, 40, '2 PLAYER', {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      color: COLORS.textHex
    }).setOrigin(0.5);

    // Back button (home icon)
    this.createBackButton();

    // Instructions
    this.add.text(GAME_WIDTH / 2, 100, 'first to win:', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      color: COLORS.accentHex
    }).setOrigin(0.5);

    // Round options
    this.createRoundOption(GAME_WIDTH / 2 - 80, 160, 1);
    this.createRoundOption(GAME_WIDTH / 2, 160, 3);
    this.createRoundOption(GAME_WIDTH / 2 + 80, 160, 5);

    // Cowboy preview
    if (this.textures.exists('stand_1')) {
      const cowboy = this.add.sprite(GAME_WIDTH / 2, 280, 'stand_1');
      const frames = this.textures.get('stand_1').getFrameNames().sort();
      if (frames.length > 0) cowboy.setFrame(frames[0]);
    }

    // Start button
    this.createStartButton();
  }

  private createBackButton(): void {
    let btn: Phaser.GameObjects.Image | Phaser.GameObjects.Container;
    
    if (this.textures.exists('btn_back')) {
      btn = this.add.image(30, 40, 'btn_back');
      btn.setInteractive({ useHandCursor: true });
    } else {
      const container = this.add.container(30, 40);
      const circle = this.add.circle(0, 0, 15, 0x999999);
      const text = this.add.text(0, 0, '⌂', { fontSize: '16px', color: '#fff' }).setOrigin(0.5);
      container.add([circle, text]);
      container.setSize(30, 30);
      container.setInteractive({ useHandCursor: true });
      btn = container;
    }

    btn.on('pointerup', () => {
      this.playSound('snd_back');
      this.scene.start('MenuScene');
    });
  }

  private createRoundOption(x: number, y: number, rounds: number): void {
    const container = this.add.container(x, y);

    // Checkbox
    const isSelected = this.selectedRounds === rounds;
    let checkbox: Phaser.GameObjects.Image | Phaser.GameObjects.Arc;
    
    if (this.textures.exists('tick')) {
      checkbox = this.add.image(0, 0, isSelected ? 'tickSel' : 'tick');
    } else {
      checkbox = this.add.circle(0, 0, 12, isSelected ? 0x666666 : 0xcccccc);
    }
    
    // Number
    const numText = this.add.text(0, 35, rounds.toString(), {
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      color: isSelected ? COLORS.textHex : COLORS.accentHex
    }).setOrigin(0.5);

    container.add([checkbox, numText]);
    container.setSize(50, 60);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerup', () => {
      this.playSound('snd_click');
      this.selectedRounds = rounds;
      this.scene.restart();
    });
  }

  private createStartButton(): void {
    const y = 380;
    const container = this.add.container(GAME_WIDTH / 2, y);

    let bg: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
    if (this.textures.exists('btn_menu_bg')) {
      bg = this.add.image(0, 0, 'btn_menu_bg');
    } else {
      bg = this.add.rectangle(0, 0, 150, 40, 0x444444);
    }

    const label = this.add.text(0, 0, 'START', {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    container.add([bg, label]);
    container.setSize(150, 40);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerup', () => {
      this.playSound('snd_click');
      this.scene.start('GameScene', { 
        mode: 'multiplayer',
        targetScore: this.selectedRounds
      });
    });
  }

  private playSound(key: string): void {
    if (this.cache.audio.exists(key)) {
      this.sound.play(key);
    }
  }
}

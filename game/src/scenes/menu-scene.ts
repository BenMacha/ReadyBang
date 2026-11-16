import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT_FAMILY } from '../config/game-config';

export class MenuScene extends Phaser.Scene {
  private menuCowboy!: Phaser.GameObjects.Sprite;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.backgroundHex);

    // Title text - western style
    const titleY = 50;
    
    this.add.text(GAME_WIDTH / 2, titleY, 'READY STEADY BANG', {
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      color: COLORS.textHex
    }).setOrigin(0.5);

    // Animated cowboy in center
    this.createMenuCowboy();

    // Menu buttons
    const buttonY = 280;
    const buttonSpacing = 50;

    this.createMenuButton(GAME_WIDTH / 2, buttonY, '1 PLAYER', () => {
      this.scene.start('LevelSelectScene');
    });

    this.createMenuButton(GAME_WIDTH / 2, buttonY + buttonSpacing, '2 PLAYER', () => {
      this.scene.start('MultiplayerSetupScene');
    });

    this.createMenuButton(GAME_WIDTH / 2, buttonY + buttonSpacing * 2, 'KILL GALLERY', () => {
      this.scene.start('KillGalleryScene');
    });

    // Credits at bottom
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 15, 'by BEN MECHA - benmacha.tn', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '9px',
      color: COLORS.accentHex,
      align: 'center'
    }).setOrigin(0.5);
  }

  private createMenuCowboy(): void {
    const cowboyY = 160;

    if (this.textures.exists('stand_1')) {
      this.menuCowboy = this.add.sprite(GAME_WIDTH / 2, cowboyY, 'stand_1');
      const frames = this.textures.get('stand_1').getFrameNames().sort();
      if (frames.length > 0) {
        this.menuCowboy.setFrame(frames[0]);
      }
      this.menuCowboy.setOrigin(0.5, 0.5);
    } else {
      this.add.rectangle(GAME_WIDTH / 2, cowboyY, 60, 80, COLORS.primary);
    }
  }

  private createMenuButton(x: number, y: number, text: string, callback: () => void): void {
    const container = this.add.container(x, y);

    let bg: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
    
    if (this.textures.exists('btn_menu_bg')) {
      bg = this.add.image(0, 0, 'btn_menu_bg');
    } else {
      bg = this.add.rectangle(0, 0, 150, 40, 0x444444);
      (bg as Phaser.GameObjects.Rectangle).setStrokeStyle(1, 0x333333);
    }

    const label = this.add.text(0, 0, text, {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      color: '#ffffff'
    });
    label.setOrigin(0.5);

    container.add([bg, label]);
    container.setSize(150, 40);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      if (this.textures.exists('btn_menu_bg_sel')) {
        (bg as Phaser.GameObjects.Image).setTexture('btn_menu_bg_sel');
      }
    });

    container.on('pointerout', () => {
      if (this.textures.exists('btn_menu_bg')) {
        (bg as Phaser.GameObjects.Image).setTexture('btn_menu_bg');
      }
    });

    container.on('pointerup', () => {
      this.playSound('snd_click');
      callback();
    });
  }

  private playSound(key: string): void {
    if (this.sound.get(key) || this.cache.audio.exists(key)) {
      this.sound.play(key);
    }
  }
}

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/game-config';

export class MenuScene extends Phaser.Scene {
  private menuCowboy!: Phaser.GameObjects.Sprite;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.backgroundHex);

    // Title text - styled like original
    const titleY = 60;
    
    this.add.text(GAME_WIDTH / 2, titleY, 'ready steady bang', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: COLORS.accentHex,
      fontStyle: 'normal'
    }).setOrigin(0.5);

    // Animated cowboy in center
    this.createMenuCowboy();

    // Menu buttons
    const buttonY = 320;
    const buttonSpacing = 55;

    this.createMenuButton(GAME_WIDTH / 2, buttonY, '1 player', () => {
      this.scene.start('LevelSelectScene');
    });

    this.createMenuButton(GAME_WIDTH / 2, buttonY + buttonSpacing, '2 player', () => {
      this.scene.start('GameScene', { mode: 'multiplayer' });
    });

    this.createMenuButton(GAME_WIDTH / 2, buttonY + buttonSpacing * 2, 'kill gallery', () => {
      this.scene.start('KillGalleryScene');
    });

    // Credits at bottom
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30, 'by Animade\n& Hover Studio', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      color: COLORS.accentHex,
      align: 'center'
    }).setOrigin(0.5);
  }

  private createMenuCowboy(): void {
    // Position cowboy in center
    const cowboyY = 180;

    // Check if animation exists
    if (this.anims.exists('menu_anim')) {
      this.menuCowboy = this.add.sprite(GAME_WIDTH / 2, cowboyY, 'menu_1');
      this.menuCowboy.play('menu_anim');
      this.menuCowboy.setScale(1);
    } else {
      // Fallback: use stand sprite or placeholder
      if (this.textures.exists('stand_1')) {
        this.menuCowboy = this.add.sprite(GAME_WIDTH / 2, cowboyY, 'stand_1');
        const frames = this.textures.get('stand_1').getFrameNames();
        if (frames.length > 0) {
          this.menuCowboy.setFrame(frames[0]);
        }
      } else {
        // Ultimate fallback: gray rectangle placeholder
        this.add.rectangle(GAME_WIDTH / 2, cowboyY, 60, 80, COLORS.primary);
      }
    }
  }

  private createMenuButton(x: number, y: number, text: string, callback: () => void): void {
    const container = this.add.container(x, y);

    // Button background - try to use original asset
    let bg: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
    
    if (this.textures.exists('btn_menu_bg')) {
      bg = this.add.image(0, 0, 'btn_menu_bg');
    } else {
      // Fallback rectangle
      bg = this.add.rectangle(0, 0, 150, 40, 0xeeeeee);
      (bg as Phaser.GameObjects.Rectangle).setStrokeStyle(1, COLORS.divider);
    }

    // Button text
    const label = this.add.text(0, 0, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: COLORS.textHex
    });
    label.setOrigin(0.5);

    container.add([bg, label]);
    container.setSize(150, 40);
    container.setInteractive({ useHandCursor: true });

    // Hover/press effects
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

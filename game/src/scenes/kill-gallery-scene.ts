import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/game-config';
import { DEATH_ANIMATIONS } from '../config/animations';
import { gameState } from '../utils/game-state';

export class KillGalleryScene extends Phaser.Scene {
  private currentIndex: number = 0;
  private cowboySprite!: Phaser.GameObjects.Sprite;
  private nameText!: Phaser.GameObjects.Text;
  private descText!: Phaser.GameObjects.Text;
  private counterText!: Phaser.GameObjects.Text;
  private lockIcon!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'KillGalleryScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.backgroundHex);
    this.currentIndex = 0;

    // Title
    this.add.text(GAME_WIDTH / 2, 25, 'kill gallery', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: COLORS.textHex
    }).setOrigin(0.5);

    // Back button
    this.createBackButton();

    // Navigation arrows
    this.createNavigation();

    // Cowboy display area
    this.cowboySprite = this.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'stand_1');
    this.cowboySprite.setDepth(10);

    // Death name
    this.nameText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 100, '', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: COLORS.textHex
    }).setOrigin(0.5);

    // Death description
    this.descText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 80, '', {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: COLORS.accentHex
    }).setOrigin(0.5);

    // Counter
    this.counterText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 50, '', {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: COLORS.accentHex
    }).setOrigin(0.5);

    // Lock icon
    this.lockIcon = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, '🔒', {
      fontSize: '40px'
    }).setOrigin(0.5).setDepth(20);

    // Show first death
    this.showDeath();

    // Tap to play animation
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.x > 60 && pointer.x < GAME_WIDTH - 60) {
        this.playCurrentAnimation();
      }
    });
  }

  private createBackButton(): void {
    const btn = this.add.container(30, 25);
    
    let bg: Phaser.GameObjects.Image | Phaser.GameObjects.Arc;
    if (this.textures.exists('btn_back')) {
      bg = this.add.image(0, 0, 'btn_back');
    } else {
      bg = this.add.circle(0, 0, 15, COLORS.accent);
    }
    
    btn.add(bg);
    btn.setSize(30, 30);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerup', () => {
      this.sound.play('snd_back');
      this.scene.start('MenuScene');
    });
  }

  private createNavigation(): void {
    // Left arrow
    const leftBtn = this.add.text(30, GAME_HEIGHT / 2, '◀', {
      fontSize: '30px',
      color: COLORS.textHex
    }).setOrigin(0.5);
    leftBtn.setInteractive({ useHandCursor: true });
    leftBtn.on('pointerup', () => this.navigate(-1));

    // Right arrow
    const rightBtn = this.add.text(GAME_WIDTH - 30, GAME_HEIGHT / 2, '▶', {
      fontSize: '30px',
      color: COLORS.textHex
    }).setOrigin(0.5);
    rightBtn.setInteractive({ useHandCursor: true });
    rightBtn.on('pointerup', () => this.navigate(1));
  }

  private navigate(direction: number): void {
    this.currentIndex += direction;
    
    if (this.currentIndex < 0) {
      this.currentIndex = DEATH_ANIMATIONS.length - 1;
    } else if (this.currentIndex >= DEATH_ANIMATIONS.length) {
      this.currentIndex = 0;
    }

    this.showDeath();
  }

  private showDeath(): void {
    const death = DEATH_ANIMATIONS[this.currentIndex];
    const isUnlocked = gameState.isDeathUnlocked(death.id);

    // Update texts
    if (isUnlocked) {
      this.nameText.setText(death.name);
      this.descText.setText(death.description);
      this.lockIcon.setVisible(false);
      this.cowboySprite.setVisible(true);
      
      // Set to stand pose
      if (this.anims.exists('stand')) {
        this.cowboySprite.play('stand');
      }
    } else {
      this.nameText.setText('unseen');
      this.descText.setText(`requires gun level ${death.gunLevel}`);
      this.lockIcon.setVisible(true);
      this.cowboySprite.setVisible(false);
    }

    // Counter
    const unlockedCount = DEATH_ANIMATIONS.filter(d => gameState.isDeathUnlocked(d.id)).length;
    this.counterText.setText(`${this.currentIndex + 1} / ${DEATH_ANIMATIONS.length}  •  ${unlockedCount} unlocked`);
  }

  private playCurrentAnimation(): void {
    const death = DEATH_ANIMATIONS[this.currentIndex];
    const isUnlocked = gameState.isDeathUnlocked(death.id);

    if (!isUnlocked) return;

    const animKey = death.id;
    
    if (this.anims.exists(animKey)) {
      this.cowboySprite.play(animKey);
      
      // Play sound
      const soundKey = `snd_${death.id}`;
      if (this.cache.audio.exists(soundKey)) {
        this.sound.play(soundKey);
      }

      // Return to stand when done
      this.cowboySprite.once('animationcomplete', () => {
        if (this.anims.exists('stand')) {
          this.cowboySprite.play('stand');
        }
      });
    }
  }
}

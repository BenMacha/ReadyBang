import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game-config';
import { DEATH_ANIMATIONS } from '../config/animations';
import { gameState } from '../utils/game-state';

export class KillGalleryScene extends Phaser.Scene {
  private currentIndex: number = 0;

  constructor() {
    super({ key: 'KillGalleryScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#c4956a');
    this.currentIndex = 0;

    // Title
    this.add.text(GAME_WIDTH / 2, 30, 'KILL GALLERY', {
      fontSize: '24px',
      fontFamily: 'Arial Black',
      color: '#2c1810'
    }).setOrigin(0.5);

    // Back button
    this.createBackButton();

    // Navigation arrows
    this.createNavigationArrows();

    // Display current death
    this.showCurrentDeath();

    // Counter
    this.updateCounter();
  }

  private createBackButton(): void {
    const btn = this.add.container(40, 30);
    
    const bg = this.add.circle(0, 0, 20, 0x2c1810);
    const text = this.add.text(0, 0, '←', {
      fontSize: '20px',
      color: '#d4a574'
    }).setOrigin(0.5);

    btn.add([bg, text]);
    btn.setSize(40, 40);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerup', () => {
      this.scene.start('MenuScene');
    });
  }

  private createNavigationArrows(): void {
    // Left arrow
    const leftArrow = this.add.text(30, GAME_HEIGHT / 2, '◀', {
      fontSize: '40px',
      color: '#2c1810'
    }).setOrigin(0.5);
    leftArrow.setInteractive({ useHandCursor: true });
    leftArrow.on('pointerup', () => this.navigate(-1));

    // Right arrow
    const rightArrow = this.add.text(GAME_WIDTH - 30, GAME_HEIGHT / 2, '▶', {
      fontSize: '40px',
      color: '#2c1810'
    }).setOrigin(0.5);
    rightArrow.setInteractive({ useHandCursor: true });
    rightArrow.on('pointerup', () => this.navigate(1));
  }

  private navigate(direction: number): void {
    this.currentIndex += direction;
    
    if (this.currentIndex < 0) {
      this.currentIndex = DEATH_ANIMATIONS.length - 1;
    } else if (this.currentIndex >= DEATH_ANIMATIONS.length) {
      this.currentIndex = 0;
    }

    this.showCurrentDeath();
    this.updateCounter();
  }

  private showCurrentDeath(): void {
    // Clear previous display
    const displayArea = this.children.getByName('deathDisplay');
    if (displayArea) {
      displayArea.destroy();
    }

    const death = DEATH_ANIMATIONS[this.currentIndex];
    const isUnlocked = gameState.isDeathUnlocked(death.id);

    const container = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    container.setName('deathDisplay');

    if (isUnlocked) {
      // Show death info
      const nameText = this.add.text(0, -80, death.name, {
        fontSize: '20px',
        fontFamily: 'Arial Black',
        color: '#2c1810',
        align: 'center'
      }).setOrigin(0.5);

      const descText = this.add.text(0, -50, death.description, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#5c3d2e',
        align: 'center'
      }).setOrigin(0.5);

      // Placeholder for animation
      const animPlaceholder = this.add.rectangle(0, 50, 150, 150, 0x2c1810, 0.3);
      animPlaceholder.setStrokeStyle(2, 0x2c1810);

      const playText = this.add.text(0, 50, '▶\nTap to play', {
        fontSize: '16px',
        color: '#2c1810',
        align: 'center'
      }).setOrigin(0.5);

      container.add([nameText, descText, animPlaceholder, playText]);

      // Make it interactive to play animation
      animPlaceholder.setInteractive({ useHandCursor: true });
      animPlaceholder.on('pointerup', () => {
        this.playDeathAnimation(death.id);
      });
    } else {
      // Locked
      const lockIcon = this.add.text(0, 0, '🔒', {
        fontSize: '60px'
      }).setOrigin(0.5);

      const lockText = this.add.text(0, 60, 'UNSEEN', {
        fontSize: '18px',
        fontFamily: 'Arial Black',
        color: '#666666'
      }).setOrigin(0.5);

      const hintText = this.add.text(0, 90, `Requires Gun Level ${death.gunLevel}`, {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#888888'
      }).setOrigin(0.5);

      container.add([lockIcon, lockText, hintText]);
    }
  }

  private updateCounter(): void {
    const counter = this.children.getByName('counter') as Phaser.GameObjects.Text;
    if (counter) {
      counter.destroy();
    }

    const unlockedCount = DEATH_ANIMATIONS.filter(d => 
      gameState.isDeathUnlocked(d.id)
    ).length;

    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40, 
      `${this.currentIndex + 1} / ${DEATH_ANIMATIONS.length}  |  Unlocked: ${unlockedCount}`, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#5c3d2e'
    }).setOrigin(0.5);
    text.setName('counter');
  }

  private playDeathAnimation(deathId: string): void {
    // Play death sound
    try {
      this.sound.play(`snd_${deathId}`);
    } catch (e) {
      // Sound not available
    }

    // TODO: Play actual sprite animation when spritesheets are ready
    console.log(`Playing animation: ${deathId}`);
  }
}

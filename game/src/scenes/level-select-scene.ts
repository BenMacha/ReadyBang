import Phaser from 'phaser';
import { GAME_WIDTH, COLORS, FONT_FAMILY } from '../config/game-config';
import { LEVELS } from '../config/levels';
import { gameState } from '../utils/game-state';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.backgroundHex);

    // Title
    this.add.text(GAME_WIDTH / 2, 30, '1 PLAYER', {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      color: COLORS.textHex
    }).setOrigin(0.5);

    // Back button
    this.createBackButton();

    // Level grid
    this.createLevelGrid();
  }

  private createBackButton(): void {
    const btn = this.add.container(30, 30);
    
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
      if (this.cache.audio.exists('snd_back')) {
        this.sound.play('snd_back');
      }
      this.scene.start('MenuScene');
    });
  }

  private createLevelGrid(): void {
    const startY = 70;
    const cols = 2;
    const cellWidth = GAME_WIDTH / cols;
    const cellHeight = 75;

    LEVELS.forEach((level, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const x = cellWidth / 2 + col * cellWidth;
      const y = startY + row * cellHeight;

      this.createLevelButton(x, y, level.id, level.name);
    });
  }

  private createLevelButton(x: number, y: number, levelId: number, name: string): void {
    const isUnlocked = gameState.isLevelUnlocked(levelId);
    const highScore = gameState.getHighScore(levelId);

    const container = this.add.container(x, y);

    // Level preview image
    const bgKey = `level${levelId}`;
    if (this.textures.exists(bgKey)) {
      const preview = this.add.image(0, -5, bgKey);
      preview.setScale(0.8);
      if (!isUnlocked) {
        preview.setTint(0x666666);
      }
      container.add(preview);
    } else {
      const placeholder = this.add.rectangle(0, -5, 100, 40, isUnlocked ? 0xdddddd : 0x999999);
      container.add(placeholder);
    }

    // Level name
    const nameText = this.add.text(0, 25, name.toLowerCase(), {
      fontFamily: FONT_FAMILY,
      fontSize: '10px',
      color: isUnlocked ? COLORS.textHex : COLORS.accentHex
    }).setOrigin(0.5);
    container.add(nameText);

    // High score in seconds
    if (highScore) {
      const seconds = (highScore / 1000).toFixed(2);
      const scoreText = this.add.text(0, 36, `${seconds}s`, {
        fontFamily: FONT_FAMILY,
        fontSize: '8px',
        color: COLORS.accentHex
      }).setOrigin(0.5);
      container.add(scoreText);
    }

    // Lock icon
    if (!isUnlocked) {
      if (this.textures.exists('locked')) {
        const lock = this.add.image(0, -5, 'locked');
        lock.setScale(0.5);
        container.add(lock);
      } else {
        const lockText = this.add.text(0, -5, '🔒', {
          fontSize: '20px'
        }).setOrigin(0.5);
        container.add(lockText);
      }
    }

    container.setSize(120, 60);

    if (isUnlocked) {
      container.setInteractive({ useHandCursor: true });

      container.on('pointerup', () => {
        if (this.cache.audio.exists('snd_click')) {
          this.sound.play('snd_click');
        }
        this.scene.start('GameScene', { 
          mode: 'singleplayer', 
          levelId: levelId 
        });
      });
    }
  }
}

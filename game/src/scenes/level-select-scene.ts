import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game-config';
import { LEVELS } from '../config/levels';
import { gameState } from '../utils/game-state';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#c4956a');

    // Title
    this.add.text(GAME_WIDTH / 2, 40, 'SELECT LEVEL', {
      fontSize: '28px',
      fontFamily: 'Arial Black',
      color: '#2c1810'
    }).setOrigin(0.5);

    // Back button
    this.createBackButton();

    // Level grid
    this.createLevelGrid();
  }

  private createBackButton(): void {
    const btn = this.add.container(40, 40);
    
    const bg = this.add.circle(0, 0, 25, 0x2c1810);
    const text = this.add.text(0, 0, '←', {
      fontSize: '24px',
      color: '#d4a574'
    }).setOrigin(0.5);

    btn.add([bg, text]);
    btn.setSize(50, 50);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerup', () => {
      this.scene.start('MenuScene');
    });
  }

  private createLevelGrid(): void {
    const startY = 100;
    const cols = 2;
    const cellWidth = GAME_WIDTH / cols;
    const cellHeight = 80;

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

    // Background
    const bg = this.add.rectangle(0, 0, 140, 60, isUnlocked ? 0x2c1810 : 0x666666);
    bg.setStrokeStyle(2, 0x1a0f0a);

    // Level number
    const levelNum = this.add.text(-50, -10, `${levelId}`, {
      fontSize: '24px',
      fontFamily: 'Arial Black',
      color: isUnlocked ? '#d4a574' : '#999999'
    }).setOrigin(0.5);

    // Name
    const nameText = this.add.text(10, -10, name, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: isUnlocked ? '#d4a574' : '#999999'
    }).setOrigin(0, 0.5);

    container.add([bg, levelNum, nameText]);

    // High score if exists
    if (highScore) {
      const scoreText = this.add.text(10, 10, `Best: ${highScore}ms`, {
        fontSize: '10px',
        fontFamily: 'Arial',
        color: '#aaa'
      }).setOrigin(0, 0.5);
      container.add(scoreText);
    }

    // Locked icon
    if (!isUnlocked) {
      const lock = this.add.text(50, 0, '🔒', {
        fontSize: '20px'
      }).setOrigin(0.5);
      container.add(lock);
    }

    container.setSize(140, 60);

    if (isUnlocked) {
      container.setInteractive({ useHandCursor: true });

      container.on('pointerover', () => {
        bg.setFillStyle(0x3d2517);
      });

      container.on('pointerout', () => {
        bg.setFillStyle(0x2c1810);
      });

      container.on('pointerup', () => {
        this.scene.start('GameScene', { 
          mode: 'singleplayer', 
          levelId: levelId 
        });
      });
    }
  }
}

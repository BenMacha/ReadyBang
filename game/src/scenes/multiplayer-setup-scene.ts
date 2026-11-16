import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT_FAMILY, HOME_BUTTON } from '../config/game-config';

export class MultiplayerSetupScene extends Phaser.Scene {
  private selectedRounds: number = 3;
  private checkboxes: Map<number, Phaser.GameObjects.Image | Phaser.GameObjects.Arc> = new Map();
  private numberTexts: Map<number, Phaser.GameObjects.Text> = new Map();

  constructor() {
    super({ key: 'MultiplayerSetupScene' });
  }

  init(data: { selectedRounds?: number }): void {
    this.selectedRounds = data.selectedRounds || 3;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.backgroundHex);
    this.checkboxes.clear();
    this.numberTexts.clear();

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
    if (this.textures.exists('btn_back')) {
      const btn = this.add.image(HOME_BUTTON.x, HOME_BUTTON.y, 'btn_back');
      btn.setScale(HOME_BUTTON.scale);
      btn.setInteractive({ useHandCursor: true });
      
      btn.on('pointerup', () => {
        this.playSound('snd_back');
        this.scene.start('MenuScene');
      });
    }
  }

  private createRoundOption(x: number, y: number, rounds: number): void {
    const isSelected = this.selectedRounds === rounds;
    
    // Checkbox
    let checkbox: Phaser.GameObjects.Image | Phaser.GameObjects.Arc;
    
    if (this.textures.exists('tick') && this.textures.exists('tickSel')) {
      checkbox = this.add.image(x, y, isSelected ? 'tickSel' : 'tick');
      checkbox.setScale(0.5);
    } else {
      checkbox = this.add.circle(x, y, 15, isSelected ? 0x666666 : 0xcccccc);
    }
    
    this.checkboxes.set(rounds, checkbox);
    
    // Number
    const numText = this.add.text(x, y + 40, rounds.toString(), {
      fontFamily: FONT_FAMILY,
      fontSize: '24px',
      color: isSelected ? COLORS.textHex : COLORS.accentHex
    }).setOrigin(0.5);
    
    this.numberTexts.set(rounds, numText);

    // Make both clickable
    checkbox.setInteractive({ useHandCursor: true });
    numText.setInteractive({ useHandCursor: true });

    const selectThis = () => {
      if (this.selectedRounds !== rounds) {
        this.playSound('snd_click');
        this.updateSelection(rounds);
      }
    };

    checkbox.on('pointerup', selectThis);
    numText.on('pointerup', selectThis);
  }

  private updateSelection(newRounds: number): void {
    const oldRounds = this.selectedRounds;
    this.selectedRounds = newRounds;

    // Update old checkbox
    const oldCheckbox = this.checkboxes.get(oldRounds);
    const oldText = this.numberTexts.get(oldRounds);
    if (oldCheckbox && this.textures.exists('tick')) {
      (oldCheckbox as Phaser.GameObjects.Image).setTexture('tick');
    } else if (oldCheckbox) {
      (oldCheckbox as Phaser.GameObjects.Arc).setFillStyle(0xcccccc);
    }
    if (oldText) {
      oldText.setColor(COLORS.accentHex);
    }

    // Update new checkbox
    const newCheckbox = this.checkboxes.get(newRounds);
    const newText = this.numberTexts.get(newRounds);
    if (newCheckbox && this.textures.exists('tickSel')) {
      (newCheckbox as Phaser.GameObjects.Image).setTexture('tickSel');
    } else if (newCheckbox) {
      (newCheckbox as Phaser.GameObjects.Arc).setFillStyle(0x666666);
    }
    if (newText) {
      newText.setColor(COLORS.textHex);
    }
  }

  private createStartButton(): void {
    const y = 380;
    const container = this.add.container(GAME_WIDTH / 2, y);

    let bg: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
    if (this.textures.exists('btn_game')) {
      bg = this.add.image(0, 0, 'btn_game');
      bg.setScale(0.8);
    } else {
      bg = this.add.rectangle(0, 0, 120, 35, 0x444444, 1);
      (bg as Phaser.GameObjects.Rectangle).setStrokeStyle(1, 0x333333);
    }

    const label = this.add.text(0, 0, 'START', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    container.add([bg, label]);
    container.setSize(120, 35);
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

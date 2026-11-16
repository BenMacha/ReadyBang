import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT_FAMILY, HOME_BUTTON } from '../config/game-config';
import { LEVELS, STEADY_DELAY_MIN, STEADY_DELAY_MAX, LevelConfig } from '../config/levels';
import { gameState } from '../utils/game-state';

type GamePhase = 'intro' | 'ready' | 'steady' | 'waiting' | 'bang' | 'shooting' | 'result';

interface GameSceneData {
  mode: 'singleplayer' | 'multiplayer';
  levelId?: number;
  targetScore?: number;
}

export class GameScene extends Phaser.Scene {
  private mode: 'singleplayer' | 'multiplayer' = 'singleplayer';
  private level: LevelConfig | null = null;
  private phase: GamePhase = 'intro';
  private targetScore: number = 5;
  
  // Timing
  private bangTime: number = 0;
  private playerShootTime: number = 0;
  private opponentShootTime: number = 0;
  
  // Game objects
  private playerCowboy!: Phaser.GameObjects.Sprite;
  private opponentCowboy!: Phaser.GameObjects.Sprite;
  private phaseImage!: Phaser.GameObjects.Image;
  private dividerLine!: Phaser.GameObjects.Graphics;
  private homeButton!: Phaser.GameObjects.Container;
  
  // Score display
  private playerScoreText!: Phaser.GameObjects.Text;
  private opponentScoreText!: Phaser.GameObjects.Text;
  private playerScore: number = 0;
  private opponentScore: number = 0;
  
  // Result UI
  private resultContainer!: Phaser.GameObjects.Container;
  
  // Flags
  private playerTapped: boolean = false;
  private opponentTapped: boolean = false;
  private roundEnded: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: GameSceneData): void {
    this.mode = data.mode || 'singleplayer';
    this.targetScore = data.targetScore || 5;
    
    if (this.mode === 'singleplayer' && data.levelId) {
      this.level = LEVELS.find(l => l.id === data.levelId) || LEVELS[0];
    } else {
      this.level = null;
    }
    
    this.phase = 'intro';
    this.playerTapped = false;
    this.opponentTapped = false;
    this.playerShootTime = 0;
    this.opponentShootTime = 0;
    this.playerScore = 0;
    this.opponentScore = 0;
    this.roundEnded = false;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.backgroundHex);

    // Home button (top left)
    this.createHomeButton();

    // Draw dotted divider line with score marks
    this.createDividerLine();

    // Create cowboys
    this.createCowboys();

    // Phase image (READY, STEADY, BANG!)
    this.createPhaseImage();

    // Score display
    this.createScoreDisplay();

    // Input zones
    this.createInputZones();

    // Start game after short delay
    this.time.delayedCall(500, () => this.startRound());
  }

  private createHomeButton(): void {
    if (this.textures.exists('btn_back')) {
      const btn = this.add.image(HOME_BUTTON.x, HOME_BUTTON.y, 'btn_back');
      btn.setScale(HOME_BUTTON.scale);
      btn.setInteractive({ useHandCursor: true });
      btn.setDepth(200);
      
      btn.on('pointerup', () => {
        this.playSound('snd_back');
        if (this.mode === 'singleplayer') {
          this.scene.start('LevelSelectScene');
        } else {
          this.scene.start('MultiplayerSetupScene');
        }
      });
    }
  }

  private createPhaseImage(): void {
    // Use original images if available
    if (this.textures.exists('ready_img')) {
      this.phaseImage = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'ready_img');
    } else {
      // Fallback to text-based
      this.phaseImage = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, '__DEFAULT');
    }
    this.phaseImage.setVisible(false);
    this.phaseImage.setDepth(100);
  }

  private createDividerLine(): void {
    this.dividerLine = this.add.graphics();
    this.dividerLine.lineStyle(1, COLORS.divider, 0.6);
    
    const y = GAME_HEIGHT / 2;
    const dashLength = 6;
    const gapLength = 6;
    let x = 0;
    
    while (x < GAME_WIDTH) {
      this.dividerLine.moveTo(x, y);
      this.dividerLine.lineTo(Math.min(x + dashLength, GAME_WIDTH), y);
      x += dashLength + gapLength;
    }
    this.dividerLine.strokePath();
    this.dividerLine.setDepth(10);

    // Add score divider image if available
    if (this.textures.exists('scoreboard_divider')) {
      const divider = this.add.image(25, GAME_HEIGHT / 2, 'scoreboard_divider');
      divider.setDepth(11);
    }
  }

  private createCowboys(): void {
    const playerY = GAME_HEIGHT * 0.75;
    const opponentY = GAME_HEIGHT * 0.25;

    // Player cowboy (bottom)
    this.playerCowboy = this.add.sprite(GAME_WIDTH / 2, playerY, 'stand_1');
    this.playerCowboy.setDepth(50);
    this.playerCowboy.setOrigin(0.5, 0.5);
    
    const standFrames = this.textures.get('stand_1').getFrameNames().sort();
    if (standFrames.length > 0) {
      this.playerCowboy.setFrame(standFrames[0]);
    }

    // Opponent cowboy (top, flipped)
    this.opponentCowboy = this.add.sprite(GAME_WIDTH / 2, opponentY, 'stand_1');
    this.opponentCowboy.setDepth(50);
    this.opponentCowboy.setOrigin(0.5, 0.5);
    this.opponentCowboy.setFlipY(true);
    
    if (standFrames.length > 0) {
      this.opponentCowboy.setFrame(standFrames[0]);
    }
  }

  private createScoreDisplay(): void {
    const scoreX = 20;
    
    // Target score indicator
    const targetText = this.mode === 'multiplayer' ? `first to ${this.targetScore}` : 'first to 5';
    this.add.text(GAME_WIDTH - 10, GAME_HEIGHT / 2, targetText, {
      fontFamily: FONT_FAMILY,
      fontSize: '8px',
      color: COLORS.accentHex
    }).setOrigin(1, 0.5).setAngle(90);

    // HIM label and score (top half)
    this.add.text(scoreX, GAME_HEIGHT / 2 - 45, 'HIM', {
      fontFamily: FONT_FAMILY,
      fontSize: '10px',
      color: COLORS.accentHex
    });

    this.opponentScoreText = this.add.text(scoreX, GAME_HEIGHT / 2 - 30, '0', {
      fontFamily: FONT_FAMILY,
      fontSize: '24px',
      color: COLORS.textHex
    });

    // ME label and score (bottom half)
    this.add.text(scoreX, GAME_HEIGHT / 2 + 12, 'ME', {
      fontFamily: FONT_FAMILY,
      fontSize: '10px',
      color: COLORS.accentHex
    });

    this.playerScoreText = this.add.text(scoreX, GAME_HEIGHT / 2 + 25, '0', {
      fontFamily: FONT_FAMILY,
      fontSize: '24px',
      color: COLORS.textHex
    });
  }

  private createInputZones(): void {
    // Player tap zone (bottom half)
    const playerZone = this.add.zone(GAME_WIDTH / 2, GAME_HEIGHT * 0.75, GAME_WIDTH, GAME_HEIGHT / 2);
    playerZone.setInteractive();
    playerZone.on('pointerdown', () => this.onPlayerTap());

    // Opponent tap zone (top half) - only in multiplayer
    if (this.mode === 'multiplayer') {
      const opponentZone = this.add.zone(GAME_WIDTH / 2, GAME_HEIGHT * 0.25, GAME_WIDTH, GAME_HEIGHT / 2);
      opponentZone.setInteractive();
      opponentZone.on('pointerdown', () => this.onOpponentTap());
    }
  }

  private startRound(): void {
    this.playerTapped = false;
    this.opponentTapped = false;
    this.roundEnded = false;

    // Hide result UI if visible
    if (this.resultContainer) {
      this.resultContainer.destroy();
    }

    // Reset cowboys to stand
    this.resetCowboyToStand(this.playerCowboy);
    this.resetCowboyToStand(this.opponentCowboy);

    // READY phase
    this.phase = 'ready';
    this.showPhaseImage('ready');
    this.playSound('snd_ready');

    this.time.delayedCall(1000, () => {
      if (this.roundEnded) return;
      
      // STEADY phase
      this.phase = 'steady';
      this.showPhaseImage('steady');
      this.playSound('snd_steady');

      // Random delay before BANG
      const delay = Phaser.Math.Between(STEADY_DELAY_MIN, STEADY_DELAY_MAX);
      
      this.time.delayedCall(delay, () => {
        if (this.phase === 'steady' && !this.roundEnded) {
          this.triggerBang();
        }
      });
    });
  }

  private triggerBang(): void {
    this.phase = 'bang';
    this.bangTime = this.time.now;
    
    this.showPhaseImage('bang');
    this.playSound('snd_bang');

    // AI shoots after draw speed (singleplayer)
    if (this.mode === 'singleplayer' && this.level) {
      this.time.delayedCall(this.level.drawSpeed * 1000, () => {
        if (!this.playerTapped && this.phase === 'bang' && !this.roundEnded) {
          this.onOpponentShoot();
        }
      });
    }

    // Timeout after 3 seconds
    this.time.delayedCall(3000, () => {
      if (this.phase === 'bang' && !this.roundEnded) {
        this.endRound('timeout');
      }
    });
  }

  private onPlayerTap(): void {
    if (this.playerTapped || this.roundEnded) return;
    this.playerTapped = true;
    this.playerShootTime = this.time.now;

    if (this.phase === 'ready' || this.phase === 'steady') {
      this.playCowboyAnim(this.playerCowboy, 'coward');
      this.playSound('snd_miss');
      this.endRound('player_early');
    } else if (this.phase === 'bang') {
      this.playCowboyAnim(this.playerCowboy, 'shoot');
      this.playSound('snd_gunshot');
      
      if (this.mode === 'singleplayer') {
        const playerReaction = this.playerShootTime - this.bangTime;
        const aiReaction = this.level!.drawSpeed * 1000;
        
        if (playerReaction < aiReaction) {
          this.time.delayedCall(200, () => {
            this.endRound('player_wins', playerReaction);
          });
        }
      } else {
        this.checkMultiplayerResult();
      }
    }
  }

  private onOpponentTap(): void {
    if (this.opponentTapped || this.mode !== 'multiplayer' || this.roundEnded) return;
    this.opponentTapped = true;
    this.opponentShootTime = this.time.now;

    if (this.phase === 'ready' || this.phase === 'steady') {
      this.playCowboyAnim(this.opponentCowboy, 'coward');
      this.playSound('snd_miss');
      this.endRound('opponent_early');
    } else if (this.phase === 'bang') {
      this.playCowboyAnim(this.opponentCowboy, 'shoot');
      this.playSound('snd_gunshot');
      this.checkMultiplayerResult();
    }
  }

  private onOpponentShoot(): void {
    if (this.phase !== 'bang' || this.roundEnded) return;
    
    this.opponentTapped = true;
    this.opponentShootTime = this.time.now;
    this.playCowboyAnim(this.opponentCowboy, 'shoot');
    this.playSound('snd_gunshot');
    
    if (!this.playerTapped) {
      this.time.delayedCall(200, () => {
        this.endRound('opponent_wins');
      });
    }
  }

  private checkMultiplayerResult(): void {
    if (this.mode === 'multiplayer' && this.phase === 'bang' && !this.roundEnded) {
      if (this.playerTapped && !this.opponentTapped) {
        this.time.delayedCall(200, () => {
          this.endRound('player_wins', this.playerShootTime - this.bangTime);
        });
      } else if (this.opponentTapped && !this.playerTapped) {
        this.time.delayedCall(200, () => {
          this.endRound('opponent_wins', this.opponentShootTime - this.bangTime);
        });
      } else if (this.playerTapped && this.opponentTapped) {
        if (this.playerShootTime <= this.opponentShootTime) {
          this.endRound('player_wins', this.playerShootTime - this.bangTime);
        } else {
          this.endRound('opponent_wins', this.opponentShootTime - this.bangTime);
        }
      }
    }
  }

  private endRound(result: string, reactionTime?: number): void {
    if (this.roundEnded) return;
    this.roundEnded = true;
    this.phase = 'result';
    this.phaseImage.setVisible(false);

    const deathIndex = Phaser.Math.Between(1, 31);
    const deathAnim = `death_${deathIndex}`;

    switch (result) {
      case 'player_wins':
        this.playCowboyAnim(this.playerCowboy, 'win');
        this.playCowboyAnim(this.opponentCowboy, deathAnim);
        this.playSound('music_win');
        this.playSound(`snd_death_${deathIndex}`);
        this.playerScore++;
        this.playerScoreText.setText(this.playerScore.toString());
        
        if (this.mode === 'singleplayer') {
          gameState.unlockDeath(`death_${deathIndex}`);
        }
        break;

      case 'opponent_wins':
        this.playCowboyAnim(this.opponentCowboy, 'win');
        this.playCowboyAnim(this.playerCowboy, deathAnim);
        this.playSound('music_lose');
        this.playSound(`snd_death_${deathIndex}`);
        this.opponentScore++;
        this.opponentScoreText.setText(this.opponentScore.toString());
        break;

      case 'player_early':
        this.playCowboyAnim(this.opponentCowboy, 'angry');
        this.opponentScore++;
        this.opponentScoreText.setText(this.opponentScore.toString());
        break;

      case 'opponent_early':
        this.playCowboyAnim(this.playerCowboy, 'angry');
        this.playerScore++;
        this.playerScoreText.setText(this.playerScore.toString());
        break;
    }

    // Check if game is over
    const targetScore = this.mode === 'singleplayer' ? 5 : this.targetScore;
    const gameOver = this.playerScore >= targetScore || this.opponentScore >= targetScore;
    const playerWonGame = this.playerScore >= targetScore;

    // Show result UI after delay
    this.time.delayedCall(1500, () => {
      this.showResultUI(result, reactionTime, gameOver, playerWonGame);
    });
  }

  private showResultUI(result: string, reactionTime: number | undefined, gameOver: boolean, playerWonGame: boolean): void {
    this.resultContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.resultContainer.setDepth(150);

    // Background overlay
    const overlay = this.add.rectangle(0, 0, GAME_WIDTH, 120, 0xffffff, 0.95);
    this.resultContainer.add(overlay);

    // Result text
    let resultText = '';
    let resultColor = COLORS.textHex;
    
    if (gameOver) {
      resultText = playerWonGame ? 'YOU WIN!' : 'YOU LOSE';
      resultColor = playerWonGame ? '#4CAF50' : '#f44336';
    } else {
      if (result === 'player_wins') {
        resultText = 'WIN';
        resultColor = '#4CAF50';
      } else if (result === 'opponent_wins') {
        resultText = 'LOSE';
        resultColor = '#f44336';
      } else if (result === 'player_early' || result === 'opponent_early') {
        resultText = 'TOO EARLY!';
        resultColor = '#ff9800';
      } else {
        resultText = 'TIMEOUT';
        resultColor = '#ff9800';
      }
    }

    const mainText = this.add.text(0, -30, resultText, {
      fontFamily: FONT_FAMILY,
      fontSize: gameOver ? '28px' : '24px',
      color: resultColor
    }).setOrigin(0.5);
    this.resultContainer.add(mainText);

    // Reaction time (if available)
    if (reactionTime && (result === 'player_wins' || result === 'opponent_wins')) {
      const seconds = (reactionTime / 1000).toFixed(2);
      const timeText = this.add.text(0, 0, `${seconds}s`, {
        fontFamily: FONT_FAMILY,
        fontSize: '16px',
        color: COLORS.accentHex
      }).setOrigin(0.5);
      this.resultContainer.add(timeText);
    }

    // Buttons
    if (gameOver) {
      // Game over - show menu button and replay
      if (this.mode === 'singleplayer' && playerWonGame && this.level && this.level.id < 10) {
        gameState.unlockLevel(this.level.id + 1);
        if (reactionTime) {
          gameState.recordHighScore(this.level.id, reactionTime);
        }
        
        // Next cowboy button
        this.createResultButton(-50, 35, 'NEXT', () => {
          this.scene.start('GameScene', {
            mode: 'singleplayer',
            levelId: this.level!.id + 1
          });
        });
        
        // Replay button
        this.createResultButton(50, 35, 'REPLAY', () => {
          this.scene.restart();
        });
      } else {
        // Just replay button
        this.createResultButton(0, 35, 'REPLAY', () => {
          this.scene.restart();
        });
      }
    } else {
      // Round not over - auto continue or show next button
      const promptText = this.add.text(0, 25, 'tap to continue', {
        fontFamily: FONT_FAMILY,
        fontSize: '12px',
        color: COLORS.accentHex
      }).setOrigin(0.5);
      this.resultContainer.add(promptText);

      // Tap anywhere to continue
      this.input.once('pointerdown', () => {
        this.startRound();
      });
    }
  }

  private createResultButton(x: number, y: number, text: string, callback: () => void): void {
    const btn = this.add.container(x, y);
    
    const bg = this.add.rectangle(0, 0, 80, 30, 0x444444, 1);
    bg.setStrokeStyle(1, 0x333333);
    
    const label = this.add.text(0, 0, text, {
      fontFamily: FONT_FAMILY,
      fontSize: '12px',
      color: '#ffffff'
    }).setOrigin(0.5);

    btn.add([bg, label]);
    btn.setSize(80, 30);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerup', () => {
      this.playSound('snd_click');
      callback();
    });

    this.resultContainer.add(btn);
  }

  private showPhaseImage(phase: string): void {
    // Use original pixel art images
    const imageKey = `img_${phase}`;
    
    if (this.textures.exists(imageKey)) {
      this.phaseImage.setTexture(imageKey);
      this.phaseImage.setVisible(true);
      this.phaseImage.setScale(0);
      
      this.tweens.add({
        targets: this.phaseImage,
        scale: 1.5,
        duration: 100,
        ease: 'Back.easeOut'
      });
    }
  }

  private resetCowboyToStand(cowboy: Phaser.GameObjects.Sprite): void {
    const frames = this.textures.get('stand_1').getFrameNames().sort();
    if (frames.length > 0) {
      cowboy.setTexture('stand_1', frames[0]);
    }
  }

  private playCowboyAnim(cowboy: Phaser.GameObjects.Sprite, animKey: string): void {
    let atlasKey = animKey;
    
    if (animKey === 'stand') atlasKey = 'stand_1';
    else if (animKey === 'shoot') atlasKey = 'shoot_1';
    else if (animKey === 'win') atlasKey = 'win_1';
    else if (animKey === 'coward') atlasKey = 'coward_1';
    else if (animKey === 'angry') atlasKey = 'angry_1';
    
    if (this.anims.exists(animKey)) {
      cowboy.play(animKey);
    } else if (this.textures.exists(atlasKey)) {
      const frames = this.textures.get(atlasKey).getFrameNames().sort();
      if (frames.length > 0) {
        this.anims.create({
          key: animKey,
          frames: frames.map(f => ({ key: atlasKey, frame: f })),
          frameRate: 24,
          repeat: animKey.includes('loop') ? -1 : 0
        });
        cowboy.play(animKey);
      }
    }
  }

  private playSound(key: string): void {
    if (this.cache.audio.exists(key)) {
      this.sound.play(key);
    }
  }
}

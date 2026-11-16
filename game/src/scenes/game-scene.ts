import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/game-config';
import { LEVELS, STEADY_DELAY_MIN, STEADY_DELAY_MAX, LevelConfig } from '../config/levels';
import { gameState } from '../utils/game-state';

type GamePhase = 'intro' | 'ready' | 'steady' | 'waiting' | 'bang' | 'shooting' | 'result';

interface GameSceneData {
  mode: 'singleplayer' | 'multiplayer';
  levelId?: number;
}

export class GameScene extends Phaser.Scene {
  private mode: 'singleplayer' | 'multiplayer' = 'singleplayer';
  private level: LevelConfig | null = null;
  private phase: GamePhase = 'intro';
  
  // Timing
  private bangTime: number = 0;
  private playerShootTime: number = 0;
  private opponentShootTime: number = 0;
  
  // Game objects
  private playerCowboy!: Phaser.GameObjects.Sprite;
  private opponentCowboy!: Phaser.GameObjects.Sprite;
  private phaseText!: Phaser.GameObjects.Text;
  private dividerLine!: Phaser.GameObjects.Graphics;
  
  // Score display
  private playerScoreText!: Phaser.GameObjects.Text;
  private opponentScoreText!: Phaser.GameObjects.Text;
  private playerScore: number = 0;
  private opponentScore: number = 0;
  
  // Flags
  private playerTapped: boolean = false;
  private opponentTapped: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: GameSceneData): void {
    this.mode = data.mode || 'singleplayer';
    
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
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.backgroundHex);

    // Draw dotted divider line
    this.createDividerLine();

    // Create cowboys
    this.createCowboys();

    // Phase text (READY, STEADY, BANG!)
    this.phaseText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: COLORS.textHex,
      fontStyle: 'bold'
    });
    this.phaseText.setOrigin(0.5);
    this.phaseText.setDepth(100);

    // Score display
    this.createScoreDisplay();

    // Input zones
    this.createInputZones();

    // Start game after short delay
    this.time.delayedCall(500, () => this.startRound());
  }

  private createDividerLine(): void {
    this.dividerLine = this.add.graphics();
    this.dividerLine.lineStyle(1, COLORS.divider, 0.5);
    
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
  }

  private createCowboys(): void {
    const playerY = GAME_HEIGHT * 0.75;
    const opponentY = GAME_HEIGHT * 0.25;

    // Player cowboy (bottom) - use stand_1 spritesheet
    this.playerCowboy = this.add.sprite(GAME_WIDTH / 2, playerY, 'stand_1');
    this.playerCowboy.setDepth(50);
    this.playerCowboy.setOrigin(0.5, 0.5);
    
    // Set initial frame
    const standFrames = this.textures.get('stand_1').getFrameNames().sort();
    if (standFrames.length > 0) {
      this.playerCowboy.setFrame(standFrames[0]);
    }

    // Opponent cowboy (top, flipped vertically)
    this.opponentCowboy = this.add.sprite(GAME_WIDTH / 2, opponentY, 'stand_1');
    this.opponentCowboy.setDepth(50);
    this.opponentCowboy.setOrigin(0.5, 0.5);
    this.opponentCowboy.setFlipY(true);
    
    if (standFrames.length > 0) {
      this.opponentCowboy.setFrame(standFrames[0]);
    }
  }

  private createScoreDisplay(): void {
    // ME label and score (bottom half)
    this.add.text(15, GAME_HEIGHT / 2 + 15, 'ME', {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: COLORS.accentHex
    });

    this.playerScoreText = this.add.text(15, GAME_HEIGHT / 2 + 28, '0', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: COLORS.textHex,
      fontStyle: 'bold'
    });

    // HIM label and score (top half)
    this.add.text(15, GAME_HEIGHT / 2 - 45, 'HIM', {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: COLORS.accentHex
    });

    this.opponentScoreText = this.add.text(15, GAME_HEIGHT / 2 - 32, '0', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: COLORS.textHex,
      fontStyle: 'bold'
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

    // Reset cowboys to stand
    this.resetCowboyToStand(this.playerCowboy);
    this.resetCowboyToStand(this.opponentCowboy);

    // READY phase
    this.phase = 'ready';
    this.showPhaseText('ready');
    this.playSound('snd_ready');

    this.time.delayedCall(1000, () => {
      // STEADY phase
      this.phase = 'steady';
      this.showPhaseText('steady');
      this.playSound('snd_steady');

      // Random delay before BANG
      const delay = Phaser.Math.Between(STEADY_DELAY_MIN, STEADY_DELAY_MAX);
      
      this.time.delayedCall(delay, () => {
        if (this.phase === 'steady') {
          this.triggerBang();
        }
      });
    });
  }

  private triggerBang(): void {
    this.phase = 'bang';
    this.bangTime = this.time.now;
    
    this.showPhaseText('bang!');
    this.playSound('snd_bang');

    // AI shoots after draw speed (singleplayer)
    if (this.mode === 'singleplayer' && this.level) {
      this.time.delayedCall(this.level.drawSpeed * 1000, () => {
        if (!this.playerTapped && this.phase === 'bang') {
          this.onOpponentShoot();
        }
      });
    }

    // Timeout after 3 seconds
    this.time.delayedCall(3000, () => {
      if (this.phase === 'bang') {
        this.endRound('timeout');
      }
    });
  }

  private onPlayerTap(): void {
    if (this.playerTapped) return;
    this.playerTapped = true;
    this.playerShootTime = this.time.now;

    if (this.phase === 'ready' || this.phase === 'steady') {
      // Too early - coward!
      this.playCowboyAnim(this.playerCowboy, 'coward');
      this.playSound('snd_miss');
      this.endRound('player_early');
    } else if (this.phase === 'bang') {
      // Valid shot
      this.playCowboyAnim(this.playerCowboy, 'shoot');
      this.playSound('snd_gunshot');
      
      if (this.mode === 'singleplayer') {
        const playerReaction = this.playerShootTime - this.bangTime;
        const aiReaction = this.level!.drawSpeed * 1000;
        
        if (playerReaction < aiReaction) {
          // Player wins - delay to show shoot animation
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
    if (this.opponentTapped || this.mode !== 'multiplayer') return;
    this.opponentTapped = true;
    this.opponentShootTime = this.time.now;

    if (this.phase === 'ready' || this.phase === 'steady') {
      this.playCowboyAnim(this.opponentCowboy, 'coward');
      this.endRound('opponent_early');
    } else if (this.phase === 'bang') {
      this.playCowboyAnim(this.opponentCowboy, 'shoot');
      this.playSound('snd_gunshot');
      this.checkMultiplayerResult();
    }
  }

  private onOpponentShoot(): void {
    if (this.phase !== 'bang') return;
    
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
    if (this.playerTapped && this.opponentTapped) {
      if (this.playerShootTime < this.opponentShootTime) {
        this.endRound('player_wins', this.playerShootTime - this.bangTime);
      } else {
        this.endRound('opponent_wins', this.opponentShootTime - this.bangTime);
      }
    }
  }

  private endRound(result: string, reactionTime?: number): void {
    this.phase = 'result';
    this.phaseText.setVisible(false);

    // Pick random death animation
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
        
        // Show WIN text
        this.showResultText('WIN!', '#4CAF50');
        
        // Unlock death and level
        if (this.mode === 'singleplayer') {
          gameState.unlockDeath(`death_${deathIndex}`);
          if (this.level && this.level.id < 10) {
            gameState.unlockLevel(this.level.id + 1);
          }
          if (reactionTime && this.level) {
            gameState.recordHighScore(this.level.id, reactionTime);
          }
        }
        break;

      case 'opponent_wins':
        this.playCowboyAnim(this.opponentCowboy, 'win');
        this.playCowboyAnim(this.playerCowboy, deathAnim);
        this.playSound('music_lose');
        this.playSound(`snd_death_${deathIndex}`);
        this.opponentScore++;
        this.opponentScoreText.setText(this.opponentScore.toString());
        
        // Show LOSE text
        this.showResultText('LOSE', '#f44336');
        break;

      case 'player_early':
        this.playCowboyAnim(this.opponentCowboy, 'angry');
        this.opponentScore++;
        this.opponentScoreText.setText(this.opponentScore.toString());
        this.showResultText('TOO EARLY!', '#ff9800');
        break;

      case 'opponent_early':
        this.playCowboyAnim(this.playerCowboy, 'angry');
        this.playerScore++;
        this.playerScoreText.setText(this.playerScore.toString());
        break;
        
      case 'timeout':
        this.showResultText('TIMEOUT', '#ff9800');
        break;
    }

    // Show reaction time if player won
    if (reactionTime && result === 'player_wins') {
      this.time.delayedCall(500, () => {
        const timeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, `${reactionTime.toFixed(0)}ms`, {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: COLORS.textHex
        }).setOrigin(0.5).setDepth(200);
      });
    }

    // Next round or back to menu
    this.time.delayedCall(3000, () => {
      if (this.mode === 'multiplayer') {
        this.scene.restart();
      } else {
        this.scene.start('LevelSelectScene');
      }
    });
  }

  private showPhaseText(text: string): void {
    this.phaseText.setText(text);
    this.phaseText.setVisible(true);
    this.phaseText.setScale(0);
    
    this.tweens.add({
      targets: this.phaseText,
      scale: 1,
      duration: 100,
      ease: 'Back.easeOut'
    });
  }
  
  private showResultText(text: string, color: string): void {
    const resultText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, text, {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: color,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(200);
    
    resultText.setScale(0);
    this.tweens.add({
      targets: resultText,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
  }

  private resetCowboyToStand(cowboy: Phaser.GameObjects.Sprite): void {
    const frames = this.textures.get('stand_1').getFrameNames().sort();
    if (frames.length > 0) {
      cowboy.setTexture('stand_1', frames[0]);
    }
  }

  private playCowboyAnim(cowboy: Phaser.GameObjects.Sprite, animKey: string): void {
    // Map animation key to atlas
    let atlasKey = animKey;
    
    // Handle special cases
    if (animKey === 'stand') atlasKey = 'stand_1';
    else if (animKey === 'shoot') atlasKey = 'shoot_1';
    else if (animKey === 'win') atlasKey = 'win_1';
    else if (animKey === 'coward') atlasKey = 'coward_1';
    else if (animKey === 'angry') atlasKey = 'angry_1';
    
    // Check if animation exists, otherwise play frames manually
    if (this.anims.exists(animKey)) {
      cowboy.play(animKey);
    } else if (this.textures.exists(atlasKey)) {
      // Create animation on the fly
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

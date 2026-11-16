import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game-config';
import { LEVELS, STEADY_DELAY_MIN, STEADY_DELAY_MAX, LevelConfig } from '../config/levels';
import { DEATH_ANIMATIONS } from '../config/animations';
import { gameState } from '../utils/game-state';

type GamePhase = 'intro' | 'ready' | 'steady' | 'waiting' | 'bang' | 'result';

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
  
  // UI Elements
  private phaseText!: Phaser.GameObjects.Text;
  private playerZone!: Phaser.GameObjects.Zone;
  private opponentZone!: Phaser.GameObjects.Zone;
  private dividerLine!: Phaser.GameObjects.Graphics;
  
  // Scores (for multiplayer)
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
    
    // Reset state
    this.phase = 'intro';
    this.playerTapped = false;
    this.opponentTapped = false;
    this.playerShootTime = 0;
    this.opponentShootTime = 0;
  }

  create(): void {
    // Background
    if (this.level) {
      // Add level background if available
      // this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, this.level.background);
    }
    this.cameras.main.setBackgroundColor('#c4956a');

    // Create divider line (dotted line in the middle)
    this.dividerLine = this.add.graphics();
    this.drawDividerLine();

    // Create tap zones
    this.createTapZones();

    // Phase text (READY, STEADY, BANG!)
    this.phaseText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontSize: '48px',
      fontFamily: 'Arial Black',
      color: '#2c1810',
      align: 'center'
    });
    this.phaseText.setOrigin(0.5);
    this.phaseText.setVisible(false);

    // Score display (for multiplayer)
    if (this.mode === 'multiplayer') {
      this.createScoreDisplay();
    }

    // Start the game sequence after a short delay
    this.time.delayedCall(500, () => {
      this.startRound();
    });
  }

  private drawDividerLine(): void {
    this.dividerLine.clear();
    this.dividerLine.lineStyle(3, 0x2c1810, 1);
    
    // Draw dotted line
    const y = GAME_HEIGHT / 2;
    const dashLength = 10;
    const gapLength = 10;
    let x = 0;
    
    while (x < GAME_WIDTH) {
      this.dividerLine.moveTo(x, y);
      this.dividerLine.lineTo(Math.min(x + dashLength, GAME_WIDTH), y);
      x += dashLength + gapLength;
    }
    
    this.dividerLine.strokePath();
  }

  private createTapZones(): void {
    // Player zone (bottom half)
    this.playerZone = this.add.zone(GAME_WIDTH / 2, GAME_HEIGHT * 0.75, GAME_WIDTH, GAME_HEIGHT / 2);
    this.playerZone.setInteractive();
    this.playerZone.on('pointerdown', () => this.onPlayerTap());

    // Opponent zone (top half) - only interactive in multiplayer
    this.opponentZone = this.add.zone(GAME_WIDTH / 2, GAME_HEIGHT * 0.25, GAME_WIDTH, GAME_HEIGHT / 2);
    if (this.mode === 'multiplayer') {
      this.opponentZone.setInteractive();
      this.opponentZone.on('pointerdown', () => this.onOpponentTap());
    }

    // Visual feedback areas (debug - remove in production)
    // this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 0.75, GAME_WIDTH - 20, GAME_HEIGHT / 2 - 20)
    //   .setStrokeStyle(2, 0x00ff00, 0.3);
    // this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 0.25, GAME_WIDTH - 20, GAME_HEIGHT / 2 - 20)
    //   .setStrokeStyle(2, 0xff0000, 0.3);
  }

  private createScoreDisplay(): void {
    // Opponent score (top)
    this.add.text(GAME_WIDTH - 20, 20, `${this.opponentScore}`, {
      fontSize: '32px',
      fontFamily: 'Arial Black',
      color: '#2c1810'
    }).setOrigin(1, 0);

    // Player score (bottom)
    this.add.text(GAME_WIDTH - 20, GAME_HEIGHT - 20, `${this.playerScore}`, {
      fontSize: '32px',
      fontFamily: 'Arial Black',
      color: '#2c1810'
    }).setOrigin(1, 1);
  }

  private startRound(): void {
    this.playerTapped = false;
    this.opponentTapped = false;
    
    // READY phase
    this.phase = 'ready';
    this.showPhaseText('READY');
    this.playSound('snd_ready');

    this.time.delayedCall(1000, () => {
      // STEADY phase
      this.phase = 'steady';
      this.showPhaseText('STEADY');
      this.playSound('snd_steady');

      // Random delay before BANG
      const delay = Phaser.Math.Between(STEADY_DELAY_MIN, STEADY_DELAY_MAX);
      
      this.time.delayedCall(delay, () => {
        if (this.phase === 'steady') { // Only if no one tapped early
          this.triggerBang();
        }
      });
    });
  }

  private triggerBang(): void {
    this.phase = 'bang';
    this.bangTime = this.time.now;
    
    this.showPhaseText('BANG!', 0xff0000);
    this.playSound('snd_bang');

    // In singleplayer, AI shoots after its draw speed
    if (this.mode === 'singleplayer' && this.level) {
      this.time.delayedCall(this.level.drawSpeed * 1000, () => {
        if (!this.playerTapped && this.phase === 'bang') {
          this.onOpponentShoot();
        }
      });
    }

    // Timeout if no one shoots (shouldn't happen)
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
      // Shot too early - COWARD!
      this.endRound('player_early');
    } else if (this.phase === 'bang') {
      // Valid shot
      this.playSound('snd_gunshot');
      
      if (this.mode === 'singleplayer') {
        // Check if player beat the AI
        const playerReaction = this.playerShootTime - this.bangTime;
        const aiReaction = this.level!.drawSpeed * 1000;
        
        if (playerReaction < aiReaction) {
          this.endRound('player_wins', playerReaction);
        } else {
          // AI was faster (already scheduled)
        }
      } else {
        // Multiplayer - wait for opponent or timeout
        this.checkMultiplayerResult();
      }
    }
  }

  private onOpponentTap(): void {
    if (this.opponentTapped || this.mode !== 'multiplayer') return;
    this.opponentTapped = true;
    this.opponentShootTime = this.time.now;

    if (this.phase === 'ready' || this.phase === 'steady') {
      this.endRound('opponent_early');
    } else if (this.phase === 'bang') {
      this.playSound('snd_gunshot');
      this.checkMultiplayerResult();
    }
  }

  private onOpponentShoot(): void {
    // AI shoots (singleplayer)
    if (this.phase !== 'bang') return;
    
    this.opponentTapped = true;
    this.opponentShootTime = this.time.now;
    this.playSound('snd_gunshot');
    
    if (!this.playerTapped) {
      this.endRound('opponent_wins');
    }
  }

  private checkMultiplayerResult(): void {
    if (this.playerTapped && this.opponentTapped) {
      // Both shot - compare times
      if (this.playerShootTime < this.opponentShootTime) {
        this.endRound('player_wins', this.playerShootTime - this.bangTime);
      } else {
        this.endRound('opponent_wins', this.opponentShootTime - this.bangTime);
      }
    }
  }

  private endRound(result: string, reactionTime?: number): void {
    this.phase = 'result';

    switch (result) {
      case 'player_wins':
        this.showResult('YOU WIN!', '#00ff00');
        this.playSound('music_win');
        this.playerScore++;
        
        // Unlock random death animation
        if (this.mode === 'singleplayer') {
          this.unlockRandomDeath();
          
          // Unlock next level
          if (this.level && this.level.id < 10) {
            gameState.unlockLevel(this.level.id + 1);
          }
          
          // Record high score
          if (reactionTime && this.level) {
            gameState.recordHighScore(this.level.id, reactionTime);
          }
        }
        break;

      case 'opponent_wins':
        this.showResult('YOU LOSE!', '#ff0000');
        this.playSound('music_lose');
        this.opponentScore++;
        break;

      case 'player_early':
        this.showResult('TOO EARLY!\nCOWARD!', '#ff6600');
        this.playSound('snd_miss');
        this.opponentScore++;
        break;

      case 'opponent_early':
        this.showResult('OPPONENT\nTOO EARLY!', '#00ff00');
        this.playerScore++;
        break;

      case 'timeout':
        this.showResult('DRAW!', '#ffff00');
        break;
    }

    // Show reaction time if applicable
    if (reactionTime) {
      this.time.delayedCall(500, () => {
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, `${reactionTime.toFixed(0)}ms`, {
          fontSize: '24px',
          fontFamily: 'Arial',
          color: '#2c1810'
        }).setOrigin(0.5);
      });
    }

    // Return to menu or play again after delay
    this.time.delayedCall(3000, () => {
      if (this.mode === 'singleplayer') {
        this.scene.start('LevelSelectScene');
      } else {
        // Reset for next round in multiplayer
        this.scene.restart();
      }
    });
  }

  private showPhaseText(text: string, color: string = '#2c1810'): void {
    this.phaseText.setText(text);
    this.phaseText.setColor(color);
    this.phaseText.setVisible(true);
    this.phaseText.setScale(0);

    this.tweens.add({
      targets: this.phaseText,
      scale: 1,
      duration: 150,
      ease: 'Back.easeOut'
    });
  }

  private showResult(text: string, color: string): void {
    this.phaseText.setText(text);
    this.phaseText.setColor(color);
    
    this.tweens.add({
      targets: this.phaseText,
      scale: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Bounce.easeOut'
    });
  }

  private playSound(key: string): void {
    try {
      this.sound.play(key);
    } catch (e) {
      // Sound not loaded yet, ignore
    }
  }

  private unlockRandomDeath(): void {
    const gunLevel = gameState.gunLevel;
    const availableDeaths = DEATH_ANIMATIONS.filter(d => 
      d.gunLevel <= gunLevel && !gameState.isDeathUnlocked(d.id)
    );

    if (availableDeaths.length > 0) {
      const randomDeath = Phaser.Utils.Array.GetRandom(availableDeaths);
      gameState.unlockDeath(randomDeath.id);
    }
  }
}

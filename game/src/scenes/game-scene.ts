import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/game-config';
import { LEVELS, STEADY_DELAY_MIN, STEADY_DELAY_MAX, LevelConfig } from '../config/levels';
import { DEATH_ANIMATIONS } from '../config/animations';
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
  private phaseImage!: Phaser.GameObjects.Image;
  private dividerLine!: Phaser.GameObjects.Graphics;
  private levelBackground!: Phaser.GameObjects.Image;
  
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
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.backgroundHex);

    // Level background (small image in center showing the scene)
    if (this.level && this.textures.exists(this.level.background)) {
      this.levelBackground = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, this.level.background);
      this.levelBackground.setScale(2); // Scale up the small level image
    }

    // Draw dotted divider line
    this.createDividerLine();

    // Create cowboys
    this.createCowboys();

    // Phase image (READY, STEADY, BANG!)
    this.phaseImage = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'ready_img');
    this.phaseImage.setVisible(false);
    this.phaseImage.setDepth(100);

    // Score display for multiplayer
    this.createScoreDisplay();

    // Input zones
    this.createInputZones();

    // Start game after short delay
    this.time.delayedCall(500, () => this.startRound());
  }

  private createDividerLine(): void {
    this.dividerLine = this.add.graphics();
    this.dividerLine.lineStyle(2, COLORS.divider, 1);
    
    const y = GAME_HEIGHT / 2;
    const dashLength = 8;
    const gapLength = 8;
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

    // Player cowboy (bottom)
    if (this.anims.exists('stand')) {
      this.playerCowboy = this.add.sprite(GAME_WIDTH / 2, playerY, 'stand_1');
      this.playerCowboy.play('stand');
    } else if (this.textures.exists('stand_1')) {
      this.playerCowboy = this.add.sprite(GAME_WIDTH / 2, playerY, 'stand_1');
      const frames = this.textures.get('stand_1').getFrameNames();
      if (frames.length > 0) this.playerCowboy.setFrame(frames[0]);
    } else {
      // Placeholder
      this.playerCowboy = this.add.sprite(GAME_WIDTH / 2, playerY, '__DEFAULT');
      this.add.rectangle(GAME_WIDTH / 2, playerY, 50, 70, COLORS.primary);
    }
    this.playerCowboy.setDepth(50);

    // Opponent cowboy (top, flipped)
    if (this.anims.exists('stand')) {
      this.opponentCowboy = this.add.sprite(GAME_WIDTH / 2, opponentY, 'stand_1');
      this.opponentCowboy.play('stand');
    } else if (this.textures.exists('stand_1')) {
      this.opponentCowboy = this.add.sprite(GAME_WIDTH / 2, opponentY, 'stand_1');
      const frames = this.textures.get('stand_1').getFrameNames();
      if (frames.length > 0) this.opponentCowboy.setFrame(frames[0]);
    } else {
      this.opponentCowboy = this.add.sprite(GAME_WIDTH / 2, opponentY, '__DEFAULT');
      this.add.rectangle(GAME_WIDTH / 2, opponentY, 50, 70, COLORS.primary);
    }
    this.opponentCowboy.setFlipY(true); // Flip for opponent
    this.opponentCowboy.setDepth(50);
  }

  private createScoreDisplay(): void {
    // Score labels
    this.add.text(10, GAME_HEIGHT / 2 + 10, 'ME', {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: COLORS.accentHex
    });

    this.playerScoreText = this.add.text(10, GAME_HEIGHT / 2 + 25, '0', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: COLORS.textHex
    });

    this.add.text(10, GAME_HEIGHT / 2 - 25, 'HIM', {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: COLORS.accentHex
    });

    this.opponentScoreText = this.add.text(10, GAME_HEIGHT / 2 - 45, '0', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: COLORS.textHex
    });

    // Divider image
    if (this.textures.exists('scoreboard_divider')) {
      this.add.image(25, GAME_HEIGHT / 2, 'scoreboard_divider');
    }
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
    this.playCowboyAnim(this.playerCowboy, 'stand');
    this.playCowboyAnim(this.opponentCowboy, 'stand');

    // READY phase
    this.phase = 'ready';
    this.showPhaseImage('ready_img');
    this.playSound('snd_ready');

    this.time.delayedCall(1000, () => {
      // STEADY phase
      this.phase = 'steady';
      this.showPhaseImage('steady_img');
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
    
    this.showPhaseImage('bang');
    this.playSound('snd_bang');

    // AI shoots after draw speed (singleplayer)
    if (this.mode === 'singleplayer' && this.level) {
      this.time.delayedCall(this.level.drawSpeed * 1000, () => {
        if (!this.playerTapped && this.phase === 'bang') {
          this.onOpponentShoot();
        }
      });
    }

    // Timeout
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
          // Player wins
          this.time.delayedCall(300, () => {
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
      this.time.delayedCall(300, () => {
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
    this.phaseImage.setVisible(false);

    // Pick random death animation
    const deathIndex = Phaser.Math.Between(1, 31);
    const deathAnim = `death_${deathIndex}`;

    switch (result) {
      case 'player_wins':
        this.showPhaseImage('win_img');
        this.playCowboyAnim(this.playerCowboy, 'win');
        this.playCowboyAnim(this.opponentCowboy, deathAnim);
        this.playSound('music_win');
        this.playSound(`snd_death_${deathIndex}`);
        this.playerScore++;
        this.playerScoreText.setText(this.playerScore.toString());
        
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
        this.showPhaseImage('lose_img');
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

    // Show reaction time
    if (reactionTime) {
      this.time.delayedCall(500, () => {
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, `${reactionTime.toFixed(0)}ms`, {
          fontFamily: 'Arial',
          fontSize: '20px',
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

  private showPhaseImage(key: string): void {
    if (this.textures.exists(key)) {
      this.phaseImage.setTexture(key);
      this.phaseImage.setVisible(true);
      this.phaseImage.setScale(0);
      
      this.tweens.add({
        targets: this.phaseImage,
        scale: 1,
        duration: 100,
        ease: 'Back.easeOut'
      });
    }
  }

  private playCowboyAnim(cowboy: Phaser.GameObjects.Sprite, animKey: string): void {
    if (this.anims.exists(animKey)) {
      cowboy.play(animKey);
    }
  }

  private playSound(key: string): void {
    if (this.cache.audio.exists(key)) {
      this.sound.play(key);
    }
  }
}

import Phaser from 'phaser';
import { CowboyState } from '../config/animations';

export class Cowboy extends Phaser.GameObjects.Sprite {
  private currentState: CowboyState = 'stand';
  private isFlipped: boolean;

  constructor(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    isFlipped: boolean = false
  ) {
    super(scene, x, y, 'cowboy_stand');
    this.isFlipped = isFlipped;
    
    scene.add.existing(this);
    
    if (isFlipped) {
      this.setFlipY(true); // Flip for opponent (top of screen)
    }
    
    this.setOrigin(0.5, 1); // Anchor at feet
    this.play('cowboy_stand');
  }

  setState(state: CowboyState, deathId?: string): void {
    if (this.currentState === state) return;
    
    this.currentState = state;
    
    switch (state) {
      case 'stand':
        this.play('cowboy_stand', true);
        break;
      case 'shoot':
        this.play('cowboy_shoot');
        break;
      case 'win':
        this.play('cowboy_win');
        this.once('animationcomplete', () => {
          this.play('cowboy_win_loop', true);
        });
        break;
      case 'death':
        if (deathId) {
          this.play(`cowboy_${deathId}`);
        }
        break;
      case 'coward':
        this.play('cowboy_coward');
        this.once('animationcomplete', () => {
          this.play('cowboy_coward_loop', true);
        });
        break;
      case 'miss':
        this.play('cowboy_miss');
        break;
      case 'angry':
        this.play('cowboy_angry');
        this.once('animationcomplete', () => {
          this.play('cowboy_angry_loop', true);
        });
        break;
      case 'gunsling':
        this.play('cowboy_gunsling');
        break;
    }
  }

  getState(): CowboyState {
    return this.currentState;
  }

  static createAnimations(scene: Phaser.Scene): void {
    // Stand animation (idle loop)
    scene.anims.create({
      key: 'cowboy_stand',
      frames: scene.anims.generateFrameNames('cowboy', {
        prefix: 'stand_1_',
        start: 1,
        end: 1,
        zeroPad: 4,
        suffix: '.png'
      }),
      frameRate: 12,
      repeat: -1
    });

    // Shoot animation
    scene.anims.create({
      key: 'cowboy_shoot',
      frames: scene.anims.generateFrameNames('cowboy', {
        prefix: 'shoot_1_',
        start: 1,
        end: 47,
        zeroPad: 4,
        suffix: '.png'
      }),
      frameRate: 30,
      repeat: 0
    });

    // Win animation
    scene.anims.create({
      key: 'cowboy_win',
      frames: scene.anims.generateFrameNames('cowboy', {
        prefix: 'win_1_',
        start: 1,
        end: 20,
        zeroPad: 4,
        suffix: '.png'
      }),
      frameRate: 24,
      repeat: 0
    });

    // Win loop
    scene.anims.create({
      key: 'cowboy_win_loop',
      frames: scene.anims.generateFrameNames('cowboy', {
        prefix: 'win_loop_2_',
        start: 1,
        end: 10,
        zeroPad: 4,
        suffix: '.png'
      }),
      frameRate: 12,
      repeat: -1
    });

    // Coward animation
    scene.anims.create({
      key: 'cowboy_coward',
      frames: scene.anims.generateFrameNames('cowboy', {
        prefix: 'coward_1_',
        start: 1,
        end: 15,
        zeroPad: 4,
        suffix: '.png'
      }),
      frameRate: 24,
      repeat: 0
    });

    // Coward loop
    scene.anims.create({
      key: 'cowboy_coward_loop',
      frames: scene.anims.generateFrameNames('cowboy', {
        prefix: 'coward_loop_1_',
        start: 1,
        end: 8,
        zeroPad: 4,
        suffix: '.png'
      }),
      frameRate: 12,
      repeat: -1
    });

    // Miss animation
    scene.anims.create({
      key: 'cowboy_miss',
      frames: scene.anims.generateFrameNames('cowboy', {
        prefix: 'miss_1_',
        start: 1,
        end: 20,
        zeroPad: 4,
        suffix: '.png'
      }),
      frameRate: 24,
      repeat: 0
    });

    // Angry animation
    scene.anims.create({
      key: 'cowboy_angry',
      frames: scene.anims.generateFrameNames('cowboy', {
        prefix: 'angry_1_',
        start: 1,
        end: 15,
        zeroPad: 4,
        suffix: '.png'
      }),
      frameRate: 24,
      repeat: 0
    });

    // Angry loop
    scene.anims.create({
      key: 'cowboy_angry_loop',
      frames: scene.anims.generateFrameNames('cowboy', {
        prefix: 'angry_loop_1_',
        start: 1,
        end: 8,
        zeroPad: 4,
        suffix: '.png'
      }),
      frameRate: 12,
      repeat: -1
    });

    // Create death animations (1-31)
    for (let i = 1; i <= 31; i++) {
      scene.anims.create({
        key: `cowboy_death_${i}`,
        frames: scene.anims.generateFrameNames('cowboy', {
          prefix: `death_${i}_`,
          start: 1,
          end: 30, // Variable, will just play available frames
          zeroPad: 4,
          suffix: '.png'
        }),
        frameRate: 24,
        repeat: 0
      });
    }
  }
}

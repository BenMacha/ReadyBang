import Phaser from 'phaser';
import { CowboyState } from '../config/animations';

export class Cowboy extends Phaser.GameObjects.Sprite {
  private currentState: CowboyState = 'stand';
  private flipped: boolean;

  constructor(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    isFlipped: boolean = false
  ) {
    super(scene, x, y, 'stand_1');
    this.flipped = isFlipped;
    
    scene.add.existing(this);
    
    if (this.flipped) {
      this.setFlipY(true);
    }
    
    this.setOrigin(0.5, 1);
    this.playAnim('stand');
  }

  playAnim(state: CowboyState, deathId?: string): void {
    if (this.currentState === state && state !== 'death') return;
    
    this.currentState = state;
    
    switch (state) {
      case 'stand':
        if (this.scene.anims.exists('stand')) {
          this.play('stand', true);
        }
        break;
      case 'shoot':
        if (this.scene.anims.exists('shoot')) {
          this.play('shoot');
        }
        break;
      case 'win':
        if (this.scene.anims.exists('win')) {
          this.play('win');
          this.once('animationcomplete', () => {
            if (this.scene.anims.exists('win_loop')) {
              this.play('win_loop', true);
            }
          });
        }
        break;
      case 'death':
        if (deathId && this.scene.anims.exists(deathId)) {
          this.play(deathId);
        }
        break;
      case 'coward':
        if (this.scene.anims.exists('coward')) {
          this.play('coward');
          this.once('animationcomplete', () => {
            if (this.scene.anims.exists('coward_loop')) {
              this.play('coward_loop', true);
            }
          });
        }
        break;
      case 'miss':
        if (this.scene.anims.exists('miss')) {
          this.play('miss');
        }
        break;
      case 'angry':
        if (this.scene.anims.exists('angry')) {
          this.play('angry');
          this.once('animationcomplete', () => {
            if (this.scene.anims.exists('angry_loop')) {
              this.play('angry_loop', true);
            }
          });
        }
        break;
      case 'gunsling':
        if (this.scene.anims.exists('gunsling')) {
          this.play('gunsling');
        }
        break;
    }
  }

  getState(): CowboyState {
    return this.currentState;
  }
}

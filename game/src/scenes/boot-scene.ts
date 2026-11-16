import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/game-config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Show loading screen similar to original
    this.cameras.main.setBackgroundColor(COLORS.backgroundHex);

    // Simple loading indicator
    const loadingText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'loading...', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: COLORS.textHex
    });
    loadingText.setOrigin(0.5);

    // Load fonts first
    this.loadFonts();
    
    // Load all assets
    this.loadImages();
    this.loadSounds();
    this.loadSpritesheets();
  }

  private loadFonts(): void {
    // Load western style font
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
  }

  private loadImages(): void {
    // Splash/Default screens
    this.load.image('splash', 'assets/images/Default.png');
    
    // Phase text images (pixel art style from original)
    this.load.image('img_ready', 'assets/images/ready.png');
    this.load.image('img_steady', 'assets/images/steady.png');
    this.load.image('img_bang', 'assets/images/bang.png');
    this.load.image('img_lose', 'assets/images/lose.png');
    
    // Tick/checkbox for multiplayer
    this.load.image('tick', 'assets/images/tick.png');
    this.load.image('tickSel', 'assets/images/tickSel.png');

    // UI elements
    this.load.image('btn_menu_bg', 'assets/images/menuButtonBg.png');
    this.load.image('btn_menu_bg_sel', 'assets/images/menuButtonBgSel.png');
    this.load.image('btn_game', 'assets/images/gameButton.png');
    this.load.image('btn_game_sel', 'assets/images/gameButtonSel.png');
    this.load.image('btn_back', 'assets/images/back.png');
    this.load.image('btn_back_sel', 'assets/images/backSel.png');
    this.load.image('scoreboard_divider', 'assets/images/scoreBoardDivide.png');
    this.load.image('info_bg', 'assets/images/infoLayerBg.png');

    // Level backgrounds
    for (let i = 1; i <= 10; i++) {
      this.load.image(`level${i}`, `assets/images/level${i}.png`);
    }

    // Stars
    for (let i = 0; i <= 3; i++) {
      this.load.image(`stars${i}`, `assets/images/stars${i}.png`);
    }

    // Lock icons
    this.load.image('locked', 'assets/images/locked.png');
    this.load.image('unlocked', 'assets/images/unlocked.png');
  }

  private loadSounds(): void {
    // Gameplay sounds
    this.load.audio('snd_ready', 'assets/sounds/ready.wav');
    this.load.audio('snd_steady', 'assets/sounds/steady.wav');
    this.load.audio('snd_bang', 'assets/sounds/rsbang.wav');
    this.load.audio('snd_gunshot', 'assets/sounds/bang_1.wav');
    this.load.audio('snd_miss', 'assets/sounds/miss_1.wav');
    this.load.audio('snd_click', 'assets/sounds/click_1.wav');
    this.load.audio('snd_back', 'assets/sounds/back.wav');
    this.load.audio('snd_spin', 'assets/sounds/spin_1.wav');

    // Music
    this.load.audio('music_win', 'assets/sounds/winMusic_1.wav');
    this.load.audio('music_lose', 'assets/sounds/loseMusic_1.wav');

    // Death sounds
    for (let i = 1; i <= 31; i++) {
      this.load.audio(`snd_death_${i}`, `assets/sounds/death_${i}.wav`);
    }
  }

  private loadSpritesheets(): void {
    // Menu animations
    this.load.atlas('menu_1', 'assets/spritesheets/menu_1.png', 'assets/spritesheets/menu_1.json');
    this.load.atlas('menu_2', 'assets/spritesheets/menu_2.png', 'assets/spritesheets/menu_2.json');

    // Cowboy states
    this.load.atlas('stand_1', 'assets/spritesheets/stand_1.png', 'assets/spritesheets/stand_1.json');
    this.load.atlas('shoot_1', 'assets/spritesheets/shoot_1.png', 'assets/spritesheets/shoot_1.json');
    this.load.atlas('shoot_2', 'assets/spritesheets/shoot_2.png', 'assets/spritesheets/shoot_2.json');
    this.load.atlas('gunsling_1', 'assets/spritesheets/gunsling_1.png', 'assets/spritesheets/gunsling_1.json');

    // Win animations
    this.load.atlas('win_1', 'assets/spritesheets/win_1.png', 'assets/spritesheets/win_1.json');
    this.load.atlas('win_2', 'assets/spritesheets/win_2.png', 'assets/spritesheets/win_2.json');
    this.load.atlas('win_loop_2', 'assets/spritesheets/win_loop_2.png', 'assets/spritesheets/win_loop_2.json');

    // Coward/Miss animations
    this.load.atlas('coward_1', 'assets/spritesheets/coward_1.png', 'assets/spritesheets/coward_1.json');
    this.load.atlas('coward_loop_1', 'assets/spritesheets/coward_loop_1.png', 'assets/spritesheets/coward_loop_1.json');
    this.load.atlas('miss_2', 'assets/spritesheets/miss_2.png', 'assets/spritesheets/miss_2.json');

    // Angry animations
    this.load.atlas('angry_1', 'assets/spritesheets/angry_1.png', 'assets/spritesheets/angry_1.json');
    this.load.atlas('angry_loop_1', 'assets/spritesheets/angry_loop_1.png', 'assets/spritesheets/angry_loop_1.json');

    // Death animations (all 31)
    for (let i = 1; i <= 31; i++) {
      this.load.atlas(`death_${i}`, `assets/spritesheets/death_${i}.png`, `assets/spritesheets/death_${i}.json`);
    }
  }

  create(): void {
    // Load Google Font for western style
    const WebFont = (window as any).WebFont;
    if (WebFont) {
      WebFont.load({
        google: {
          families: ['Rye', 'Staatliches']
        },
        active: () => {
          this.createAnimations();
          this.scene.start('MenuScene');
        },
        inactive: () => {
          // Font failed to load, continue anyway
          this.createAnimations();
          this.scene.start('MenuScene');
        }
      });
    } else {
      this.createAnimations();
      this.scene.start('MenuScene');
    }
  }

  private createAnimations(): void {
    // Menu cowboy animation
    this.createAtlasAnimation('menu_1', 'menu_anim', 24, 0);
    this.createAtlasAnimation('menu_2', 'menu_anim_2', 24, 0);

    // Stand (single frame, looping)
    this.createAtlasAnimation('stand_1', 'stand', 12, -1);

    // Shoot
    this.createAtlasAnimation('shoot_1', 'shoot', 30, 0);
    this.createAtlasAnimation('shoot_2', 'shoot_2', 30, 0);

    // Gunsling
    this.createAtlasAnimation('gunsling_1', 'gunsling', 24, 0);

    // Win
    this.createAtlasAnimation('win_1', 'win', 24, 0);
    this.createAtlasAnimation('win_2', 'win_2', 24, 0);
    this.createAtlasAnimation('win_loop_2', 'win_loop', 12, -1);

    // Coward
    this.createAtlasAnimation('coward_1', 'coward', 24, 0);
    this.createAtlasAnimation('coward_loop_1', 'coward_loop', 12, -1);

    // Miss
    this.createAtlasAnimation('miss_2', 'miss', 24, 0);

    // Angry
    this.createAtlasAnimation('angry_1', 'angry', 24, 0);
    this.createAtlasAnimation('angry_loop_1', 'angry_loop', 12, -1);

    // Death animations
    for (let i = 1; i <= 31; i++) {
      this.createAtlasAnimation(`death_${i}`, `death_${i}`, 24, 0);
    }
  }

  private createAtlasAnimation(atlasKey: string, animKey: string, frameRate: number, repeat: number): void {
    const atlas = this.textures.get(atlasKey);
    if (!atlas || atlas.key === '__MISSING') {
      console.warn(`Atlas not found: ${atlasKey}`);
      return;
    }

    const frameNames = atlas.getFrameNames().sort();
    if (frameNames.length === 0) {
      console.warn(`No frames in atlas: ${atlasKey}`);
      return;
    }

    this.anims.create({
      key: animKey,
      frames: frameNames.map(frame => ({ key: atlasKey, frame })),
      frameRate,
      repeat
    });
  }
}

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Show loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '20px monospace',
      color: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);

    // Progress events
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Load all assets
    this.loadImages();
    this.loadSounds();
    this.loadSpritesheets();
    this.loadFonts();
  }

  private loadImages(): void {
    // UI elements
    this.load.image('bang', 'assets/images/bang.png');
    this.load.image('ready', 'assets/images/ready.png');
    this.load.image('steady', 'assets/images/steady.png');
    this.load.image('win', 'assets/images/win.png');
    this.load.image('lose', 'assets/images/Lose.png');

    // Buttons
    this.load.image('btn_play', 'assets/images/gameButton.png');
    this.load.image('btn_play_sel', 'assets/images/gameButtonSel.png');
    this.load.image('btn_back', 'assets/images/back.png');
    this.load.image('btn_back_sel', 'assets/images/backSel.png');
    this.load.image('btn_menu_bg', 'assets/images/menuButtonBg.png');
    this.load.image('btn_menu_bg_sel', 'assets/images/menuButtonBgSel.png');

    // Level backgrounds
    for (let i = 1; i <= 10; i++) {
      this.load.image(`level${i}`, `assets/images/level${i}.png`);
    }

    // Stars for level select
    for (let i = 0; i <= 3; i++) {
      this.load.image(`stars${i}`, `assets/images/stars${i}.png`);
    }

    // Misc UI
    this.load.image('locked', 'assets/images/locked.png');
    this.load.image('unlocked', 'assets/images/unlocked.png');
    this.load.image('arrow', 'assets/images/arrow.png');
    this.load.image('arrowNext', 'assets/images/arrowNext.png');
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

    // Music
    this.load.audio('music_win', 'assets/sounds/winMusic_1.wav');
    this.load.audio('music_lose', 'assets/sounds/loseMusic_1.wav');

    // Death sounds
    for (let i = 1; i <= 31; i++) {
      this.load.audio(`snd_death_${i}`, `assets/sounds/death_${i}.wav`);
    }
  }

  private loadSpritesheets(): void {
    // Note: Les spritesheets doivent être converties du format plist vers JSON
    // Pour l'instant, on charge les PNG individuellement
    
    // On chargera les atlas JSON une fois convertis
    // this.load.atlas('cowboy', 'assets/spritesheets/cowboy.png', 'assets/spritesheets/cowboy.json');
  }

  private loadFonts(): void {
    // Les fonts sont chargées via CSS ou comme bitmap fonts
    // Pour l'instant, on utilisera les fonts système
  }

  create(): void {
    // Créer les animations une fois les assets chargés
    // Cowboy.createAnimations(this);
    
    // Aller au menu
    this.scene.start('MenuScene');
  }
}

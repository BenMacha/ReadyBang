import Phaser from 'phaser';

export class AudioManager {
  private scene: Phaser.Scene;
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  private musicEnabled: boolean = true;
  private sfxEnabled: boolean = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  preload(): void {
    // Gameplay sounds
    this.scene.load.audio('ready', 'assets/sounds/ready.wav');
    this.scene.load.audio('steady', 'assets/sounds/steady.wav');
    this.scene.load.audio('bang', 'assets/sounds/rsbang.wav');
    this.scene.load.audio('gunshot', 'assets/sounds/bang_1.wav');
    this.scene.load.audio('miss', 'assets/sounds/miss_1.wav');
    this.scene.load.audio('click', 'assets/sounds/click_1.wav');
    this.scene.load.audio('back', 'assets/sounds/back.wav');
    this.scene.load.audio('spin', 'assets/sounds/spin_1.wav');

    // Music
    this.scene.load.audio('winMusic', 'assets/sounds/winMusic_1.wav');
    this.scene.load.audio('loseMusic', 'assets/sounds/loseMusic_1.wav');

    // Death sounds (load dynamically as needed)
    for (let i = 1; i <= 31; i++) {
      this.scene.load.audio(`death_${i}`, `assets/sounds/death_${i}.wav`);
    }
  }

  play(key: string, config?: Phaser.Types.Sound.SoundConfig): Phaser.Sound.BaseSound | null {
    if (!this.sfxEnabled && key !== 'winMusic' && key !== 'loseMusic') return null;
    if (!this.musicEnabled && (key === 'winMusic' || key === 'loseMusic')) return null;

    const sound = this.scene.sound.add(key, config);
    sound.play();
    this.sounds.set(key, sound);
    return sound;
  }

  stop(key: string): void {
    const sound = this.sounds.get(key);
    if (sound) {
      sound.stop();
      sound.destroy();
      this.sounds.delete(key);
    }
  }

  stopAll(): void {
    this.sounds.forEach((sound) => {
      sound.stop();
      sound.destroy();
    });
    this.sounds.clear();
  }

  toggleMusic(): boolean {
    this.musicEnabled = !this.musicEnabled;
    return this.musicEnabled;
  }

  toggleSfx(): boolean {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }
}

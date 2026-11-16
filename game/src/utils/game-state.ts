const STORAGE_KEY = 'ready_steady_bang_save';

export interface GameSave {
  currentLevel: number;
  unlockedLevels: number[];
  unlockedDeaths: string[];
  gunLevel: number;
  cowboyKilled: boolean;
  highScores: Record<number, number>; // levelId -> best time in ms
}

const DEFAULT_SAVE: GameSave = {
  currentLevel: 1,
  unlockedLevels: [1],
  unlockedDeaths: [],
  gunLevel: 0,
  cowboyKilled: false,
  highScores: {}
};

class GameStateManager {
  private state: GameSave;

  constructor() {
    this.state = this.load();
  }

  private load(): GameSave {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SAVE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load save:', e);
    }
    return { ...DEFAULT_SAVE };
  }

  save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save:', e);
    }
  }

  get currentLevel(): number {
    return this.state.currentLevel;
  }

  set currentLevel(level: number) {
    this.state.currentLevel = level;
    this.save();
  }

  get gunLevel(): number {
    return this.state.gunLevel;
  }

  isLevelUnlocked(level: number): boolean {
    return this.state.unlockedLevels.includes(level);
  }

  unlockLevel(level: number): void {
    if (!this.state.unlockedLevels.includes(level)) {
      this.state.unlockedLevels.push(level);
      this.save();
    }
  }

  isDeathUnlocked(deathId: string): boolean {
    return this.state.unlockedDeaths.includes(deathId);
  }

  unlockDeath(deathId: string): void {
    if (!this.state.unlockedDeaths.includes(deathId)) {
      this.state.unlockedDeaths.push(deathId);
      // Update gun level based on unlocked deaths
      this.updateGunLevel();
      this.save();
    }
  }

  private updateGunLevel(): void {
    const deathCount = this.state.unlockedDeaths.length;
    if (deathCount >= 26) this.state.gunLevel = 5;
    else if (deathCount >= 21) this.state.gunLevel = 4;
    else if (deathCount >= 16) this.state.gunLevel = 3;
    else if (deathCount >= 11) this.state.gunLevel = 2;
    else if (deathCount >= 6) this.state.gunLevel = 1;
    else this.state.gunLevel = 0;
  }

  recordHighScore(level: number, timeMs: number): boolean {
    const current = this.state.highScores[level];
    if (!current || timeMs < current) {
      this.state.highScores[level] = timeMs;
      this.save();
      return true;
    }
    return false;
  }

  getHighScore(level: number): number | null {
    return this.state.highScores[level] ?? null;
  }

  markCowboyKilled(): void {
    this.state.cowboyKilled = true;
    this.save();
  }

  reset(): void {
    this.state = { ...DEFAULT_SAVE };
    this.save();
  }
}

export const gameState = new GameStateManager();

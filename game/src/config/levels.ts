export interface LevelConfig {
  id: number;
  name: string;
  drawSpeed: number; // Temps de réaction de l'IA en secondes
  background: string;
}

export const LEVELS: LevelConfig[] = [
  { id: 1, name: 'Arthur Rightus', drawSpeed: 0.352, background: 'level1' },
  { id: 2, name: 'Bill Droolin', drawSpeed: 0.295, background: 'level2' },
  { id: 3, name: 'Sloe Jim', drawSpeed: 0.275, background: 'level3' },
  { id: 4, name: 'Chaps Middlegun', drawSpeed: 0.250, background: 'level4' },
  { id: 5, name: 'Van Queef', drawSpeed: 0.225, background: 'level5' },
  { id: 6, name: 'Thomas Edward', drawSpeed: 0.200, background: 'level6' },
  { id: 7, name: 'Doc Hunter', drawSpeed: 0.190, background: 'level7' },
  { id: 8, name: 'Texas Slaughter', drawSpeed: 0.180, background: 'level8' },
  { id: 9, name: 'Aberdeen Bangus', drawSpeed: 0.175, background: 'level9' },
  { id: 10, name: 'The Cowboy', drawSpeed: 0.160, background: 'level10' },
];

// Délai minimum et maximum entre "STEADY" et "BANG"
export const STEADY_DELAY_MIN = 1000; // 1 seconde
export const STEADY_DELAY_MAX = 4000; // 4 secondes

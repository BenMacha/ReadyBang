export interface DeathAnimation {
  id: string;
  name: string;
  description: string;
  gunLevel: number;
}

export const DEATH_ANIMATIONS: DeathAnimation[] = [
  { id: 'death_1', name: 'down the barrel', description: 'shot you in the chest', gunLevel: 0 },
  { id: 'death_2', name: 'eye crosser', description: 'shot you between the eyes', gunLevel: 0 },
  { id: 'death_3', name: 'shoulder pin', description: 'shot you up', gunLevel: 0 },
  { id: 'death_4', name: 'spin cycle', description: 'shot you up', gunLevel: 0 },
  { id: 'death_5', name: 'ball banger', description: 'popped your scrotum', gunLevel: 0 },
  { id: 'death_6', name: 'stagger dagger', description: 'shot you up', gunLevel: 1 },
  { id: 'death_7', name: 'internal pleading', description: 'shot you up', gunLevel: 1 },
  { id: 'death_8', name: 'coffin drop', description: 'shot you up', gunLevel: 1 },
  { id: 'death_9', name: "sigh'n'die", description: 'shot you up', gunLevel: 1 },
  { id: 'death_10', name: "hangman's faint", description: 'popped you in the face', gunLevel: 1 },
  { id: 'death_11', name: 'human caterpillar', description: 'split your gas pipe', gunLevel: 2 },
  { id: 'death_12', name: 'hard against the wall', description: 'knock you off your feet', gunLevel: 2 },
  { id: 'death_13', name: 'face plant', description: 'shot your legs out', gunLevel: 2 },
  { id: 'death_14', name: 'hat juggler', description: 'made you look silly', gunLevel: 2 },
  { id: 'death_15', name: 'corkscrew', description: 'killed you good', gunLevel: 2 },
  { id: 'death_16', name: "headstand'n'land", description: 'shot you off your feet', gunLevel: 3 },
  { id: 'death_17', name: 'trough splosh', description: 'soaked your corpse', gunLevel: 3 },
  { id: 'death_18', name: 'bum slider', description: 'shot you down', gunLevel: 3 },
  { id: 'death_19', name: 'cart wheels', description: 'sent you flying', gunLevel: 3 },
  { id: 'death_20', name: 'jack in the box', description: 'shot you up', gunLevel: 3 },
  { id: 'death_21', name: 'sausage circus', description: 'blew up your body', gunLevel: 4 },
  { id: 'death_22', name: "body poppin'", description: 'blew up your body', gunLevel: 4 },
  { id: 'death_23', name: 'legless', description: 'blew up your body', gunLevel: 4 },
  { id: 'death_24', name: 'arm popper', description: 'blew up your body', gunLevel: 4 },
  { id: 'death_25', name: 'dead head', description: 'blew up your body', gunLevel: 4 },
  { id: 'death_26', name: 'reverse cowboy', description: 'blew up your body', gunLevel: 5 },
  { id: 'death_27', name: 'dead arms', description: 'shot off your arms', gunLevel: 5 },
  { id: 'death_28', name: 'catherine wheel', description: 'span you silly', gunLevel: 5 },
  { id: 'death_29', name: 'pop hop', description: 'shot off your leg', gunLevel: 5 },
  { id: 'death_30', name: 'down the middle', description: 'shot you in two', gunLevel: 5 },
  { id: 'death_31', name: 'mystery kill', description: 'shot ya!', gunLevel: 6 },
];

export type CowboyState = 
  | 'stand' 
  | 'shoot' 
  | 'win' 
  | 'win_loop'
  | 'death' 
  | 'coward' 
  | 'coward_loop'
  | 'angry' 
  | 'angry_loop'
  | 'miss'
  | 'gunsling'
  | 'fidget';

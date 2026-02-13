
export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM'
}

export enum GameType {
  DISCRIMINATION = 'DISCRIMINATION',
  SPATIAL = 'SPATIAL',
  MEMORY = 'MEMORY',
  PATH_FOLLOWING = 'PATH_FOLLOWING',
  SLICE_CHALLENGE = 'SLICE_CHALLENGE'
}

export interface GameState {
  score: number;
  level: number;
  isActive: boolean;
  gameType: GameType | null;
  difficulty: Difficulty | null;
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
}

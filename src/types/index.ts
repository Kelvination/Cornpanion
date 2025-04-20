// Team-related types
export type TeamColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'custom';

export interface Team {
  name: string;
  color: TeamColor | string;
  score: number;
}

// Game settings types
export interface GameSettings {
  scoreLimit: number;
  bustRuleEnabled: boolean;
  bustResetScore: number;
  allowOthersToEditScore: boolean;
  team1: Team;
  team2: Team;
}

// Lobby types
export interface Lobby {
  id: string;
  settings: GameSettings;
  gameState: GameState;
  connectedUsers: ConnectedUser[];
  hostId: string;
  createdAt: number;
}

// Game state types
export interface GameState {
  team1Score: number;
  team2Score: number;
  roundNumber: number;
  throwingTeam: 1 | 2;
  isGameOver: boolean;
  winningTeam?: 1 | 2;
  lastScoreUpdate?: {
    team1PrevScore: number;
    team2PrevScore: number;
    // Add missing fields
    roundNumberPrev: number;
    throwingTeamPrev: 1 | 2;
    isGameOverPrev: boolean;
    winningTeamPrev?: 1 | 2;
  };
}

// User types
export interface ConnectedUser {
  id: string;
  name: string;
  isHost: boolean;
  joinedAt: number;
}

// Math Mode types
export interface MathModeScores {
  team1BagsOnBoard: number;
  team1BagsInHole: number;
  team2BagsOnBoard: number;
  team2BagsInHole: number;
}

// App Mode
export type AppMode = 'host' | 'join' | 'solo';
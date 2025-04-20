import { GameSettings, GameState, MathModeScores } from '../types';

// Apply bust rule if needed
export const applyBustRule = (
  score: number,
  settings: GameSettings
): number => {
  if (!settings.bustRuleEnabled) {
    return score;
  }

  return score > settings.scoreLimit
    ? settings.bustResetScore
    : score;
};

// Add points to a team's score with bust rule check
export const addPointsToTeam = (
  teamNumber: 1 | 2,
  points: number,
  gameState: GameState,
  settings: GameSettings
): GameState => {
  // Store previous scores for undo functionality
  const lastScoreUpdate = {
    team1PrevScore: gameState.team1Score,
    team2PrevScore: gameState.team2Score
  };

  // Add points to the appropriate team
  const newState = { ...gameState, lastScoreUpdate };

  if (teamNumber === 1) {
    newState.team1Score = applyBustRule(gameState.team1Score + points, settings);
  } else {
    newState.team2Score = applyBustRule(gameState.team2Score + points, settings);
  }

  // Update throwing team - it's the team that scored last
  newState.throwingTeam = teamNumber;

  // Check for win condition
  if (checkWinCondition(newState, settings)) {
    newState.isGameOver = true;
    newState.winningTeam = determineWinningTeam(newState);
  }

  return newState;
};

// Calculate score using math mode
export const calculateMathModeScore = (
  scores: MathModeScores,
  gameState: GameState,
  settings: GameSettings
): GameState => {
  // Store previous scores
  const lastScoreUpdate = {
    team1PrevScore: gameState.team1Score,
    team2PrevScore: gameState.team2Score
  };

  // Calculate raw scores for each team
  const team1RawScore = scores.team1BagsOnBoard * 1 + scores.team1BagsInHole * 3;
  const team2RawScore = scores.team2BagsOnBoard * 1 + scores.team2BagsInHole * 3;

  // Calculate net score
  const netScore = team1RawScore - team2RawScore;

  const newState = {
    ...gameState,
    lastScoreUpdate,
    roundNumber: gameState.roundNumber + 1
  };

  // Apply net score to the appropriate team
  if (netScore > 0) {
    newState.team1Score = applyBustRule(gameState.team1Score + netScore, settings);
    newState.throwingTeam = 1;
  } else if (netScore < 0) {
    newState.team2Score = applyBustRule(gameState.team2Score + Math.abs(netScore), settings);
    newState.throwingTeam = 2;
  }
  // If netScore is 0, no points added, and throwing team doesn't change

  // Check for win condition
  if (checkWinCondition(newState, settings)) {
    newState.isGameOver = true;
    newState.winningTeam = determineWinningTeam(newState);
  }

  return newState;
};

// Reset a team's score (for BUST button)
export const resetTeamScore = (
  teamNumber: 1 | 2,
  gameState: GameState,
  settings: GameSettings
): GameState => {
  // Store previous scores for undo functionality
  const lastScoreUpdate = {
    team1PrevScore: gameState.team1Score,
    team2PrevScore: gameState.team2Score
  };

  const newState = { ...gameState, lastScoreUpdate };

  if (teamNumber === 1) {
    newState.team1Score = settings.bustResetScore;
  } else {
    newState.team2Score = settings.bustResetScore;
  }

  return newState;
};

// Set exact score for a team (for manual override)
export const setTeamScore = (
  teamNumber: 1 | 2,
  score: number,
  gameState: GameState,
  settings: GameSettings
): GameState => {
  // Store previous scores for undo functionality
  const lastScoreUpdate = {
    team1PrevScore: gameState.team1Score,
    team2PrevScore: gameState.team2Score
  };

  const newState = { ...gameState, lastScoreUpdate };

  if (teamNumber === 1) {
    newState.team1Score = applyBustRule(score, settings);
  } else {
    newState.team2Score = applyBustRule(score, settings);
  }

  // Check for win condition
  if (checkWinCondition(newState, settings)) {
    newState.isGameOver = true;
    newState.winningTeam = determineWinningTeam(newState);
  }

  return newState;
};

// Reset game (keeps settings)
export const resetGame = (): GameState => ({
  team1Score: 0,
  team2Score: 0,
  roundNumber: 1,
  throwingTeam: 1,
  isGameOver: false
});

// Undo last score
export const undoLastScore = (gameState: GameState): GameState => {
  if (!gameState.lastScoreUpdate) {
    return gameState;
  }

  return {
    ...gameState,
    team1Score: gameState.lastScoreUpdate.team1PrevScore,
    team2Score: gameState.lastScoreUpdate.team2PrevScore,
    isGameOver: false,
    winningTeam: undefined,
    lastScoreUpdate: undefined
  };
};

// Check if win condition is met
const checkWinCondition = (gameState: GameState, settings: GameSettings): boolean => {
  const { team1Score, team2Score } = gameState;
  const { scoreLimit } = settings;

  return (team1Score >= scoreLimit || team2Score >= scoreLimit);
};

// Determine the winning team based on scores
const determineWinningTeam = (gameState: GameState): 1 | 2 => {
  return gameState.team1Score >= gameState.team2Score ? 1 : 2;
};
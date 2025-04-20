import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { GameSettings } from '../types';
import { soloGameSettingsAtom, soloGameStateAtom } from '../store/atoms';
import {
  addPointsToTeam,
  resetTeamScore,
  setTeamScore,
  resetGame,
  undoLastScore
} from '../utils/gameUtils';

export const useSoloGame = () => {
  const [settings, setSettings] = useAtom(soloGameSettingsAtom);
  const [gameState, setGameState] = useAtom(soloGameStateAtom);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings(current => ({ ...current, ...newSettings }));
  }, [setSettings]);

  // Add points to a team
  const addPoints = useCallback((teamNumber: 1 | 2, points: number) => {
    setGameState(current => addPointsToTeam(teamNumber, points, current, settings));
  }, [settings, setGameState]);

  // Reset team score (for BUST)
  const bustTeam = useCallback((teamNumber: 1 | 2) => {
    setGameState(current => resetTeamScore(teamNumber, current, settings));
  }, [settings, setGameState]);

  // Override score manually
  const overrideScore = useCallback((teamNumber: 1 | 2, score: number) => {
    setGameState(current => setTeamScore(teamNumber, score, current, settings));
  }, [settings, setGameState]);

  // Reset the game
  const resetGameState = useCallback(() => {
    setGameState(resetGame());
  }, [setGameState]);

  // Undo last score
  const undoScore = useCallback(() => {
    setGameState(current => undoLastScore(current));
  }, [setGameState]);

  return {
    settings,
    gameState,
    updateSettings,
    addPoints,
    bustTeam,
    overrideScore,
    resetGameState,
    undoScore
  };
};
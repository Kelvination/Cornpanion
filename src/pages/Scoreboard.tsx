import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import {
  appModeAtom,
  isHostAtom,
  errorAtom
} from '../store/atoms';
import { useLobby } from '../hooks/useLobby';
import { useSoloGame } from '../hooks/useSoloGame';

const Scoreboard = () => {
  const navigate = useNavigate();

  // Atoms
  const [appMode] = useAtom(appModeAtom);
  const [isHost] = useAtom(isHostAtom);
  const [, setError] = useAtom(errorAtom);

  // Network game data
  const {
    gameSettings: networkSettings,
    gameState: networkState,
    updateGameState,
    leaveLobby
  } = useLobby();

  // Solo game data
  const {
    settings: soloSettings,
    gameState: soloState,
    addPoints: addSoloPoints,
    bustTeam: bustSoloTeam,
    overrideScore: overrideSoloScore,
    resetGameState: resetSoloGame,
    undoScore: undoSoloScore
  } = useSoloGame();

  // Get the active settings and state based on mode
  const settings = appMode === 'solo' ? soloSettings : networkSettings;
  const gameState = appMode === 'solo' ? soloState : networkState;

  // Modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [showManualOverrideModal, setShowManualOverrideModal] = useState<1 | 2 | null>(null);
  const [manualScore, setManualScore] = useState<number>(0);

  // Check if user has permission to edit scores
  const canEdit = appMode === 'solo' || isHost || (networkSettings && networkSettings.allowOthersToEditScore);

  // Handle adding points (both modes)
  const handleAddPoints = useCallback((team: 1 | 2, points: number) => {
    if (!canEdit) {
      setError('You do not have permission to update the score');
      return;
    }

    if (appMode === 'solo') {
      addSoloPoints(team, points);
    } else {
      const newState = { ...networkState }; // Use networkState
      const currentScore = team === 1 ? newState.team1Score : newState.team2Score;
      const newScore = currentScore + points;

      // Store previous state for undo
      const lastScoreUpdate = {
        team1PrevScore: newState.team1Score,
        team2PrevScore: newState.team2Score,
        roundNumberPrev: newState.roundNumber,
        throwingTeamPrev: newState.throwingTeam,
        isGameOverPrev: newState.isGameOver,
        winningTeamPrev: newState.winningTeam
      };

      if (team === 1) {
        newState.team1Score = newScore;
        // Apply bust rule if enabled and needed
        if (settings.bustRuleEnabled && newState.team1Score > settings.scoreLimit) {
          newState.team1Score = settings.bustResetScore;
        }
      } else {
        newState.team2Score = newScore;
        // Apply bust rule if enabled and needed
        if (settings.bustRuleEnabled && newState.team2Score > settings.scoreLimit) {
          newState.team2Score = settings.bustResetScore;
        }
      }

      // Increment round number only if points were added (not subtracted)
      // Or perhaps increment every time score changes? Let's increment every time for now.
      newState.roundNumber = newState.roundNumber + 1; // Increment round
      newState.throwingTeam = team === 1 ? 2 : 1; // Switch throwing team
      newState.lastScoreUpdate = lastScoreUpdate; // Save previous state

      // Check win condition AFTER score update
      if (newState.team1Score >= settings.scoreLimit || newState.team2Score >= settings.scoreLimit) {
        newState.isGameOver = true;
        newState.winningTeam = newState.team1Score >= newState.team2Score ? 1 : 2;
      } else {
        newState.isGameOver = false;
        newState.winningTeam = undefined;
      }

      updateGameState(newState);
    }
  }, [canEdit, appMode, addSoloPoints, networkState, settings, updateGameState, setError]);

  // Handle bust (reset team score)
  const handleBust = useCallback((team: 1 | 2) => {
    if (!canEdit) {
      setError('You do not have permission to update the score');
      return;
    }

    if (appMode === 'solo') {
      bustSoloTeam(team);
    } else {
      const newState = { ...networkState };
      // Store previous state for undo
      const lastScoreUpdate = {
        team1PrevScore: newState.team1Score,
        team2PrevScore: newState.team2Score,
        roundNumberPrev: newState.roundNumber,
        throwingTeamPrev: newState.throwingTeam,
        isGameOverPrev: newState.isGameOver,
        winningTeamPrev: newState.winningTeam
      };

      if (team === 1) {
        newState.team1Score = settings.bustResetScore;
      } else {
        newState.team2Score = settings.bustResetScore;
      }
      newState.roundNumber = newState.roundNumber + 1; // Increment round
      newState.throwingTeam = team === 1 ? 2 : 1; // Switch throwing team
      newState.lastScoreUpdate = lastScoreUpdate; // Save previous state
      newState.isGameOver = false; // Busting doesn't end the game
      newState.winningTeam = undefined;

      updateGameState(newState);
    }
  }, [canEdit, appMode, bustSoloTeam, networkState, settings, updateGameState, setError]);

  // Handle manual score override
  const handleManualOverride = useCallback((team: 1 | 2) => {
    if (!canEdit) {
      setError('You do not have permission to update the score');
      return;
    }
    setManualScore(team === 1 ? gameState.team1Score : gameState.team2Score);
    setShowManualOverrideModal(team);
  }, [canEdit, gameState, setError]);

  const submitManualOverride = useCallback(() => {
    if (!showManualOverrideModal || !canEdit) return;

    if (appMode === 'solo') {
      overrideSoloScore(showManualOverrideModal, manualScore);
    } else {
      const newState = { ...networkState };
      // Store previous state for undo
      const lastScoreUpdate = {
        team1PrevScore: newState.team1Score,
        team2PrevScore: newState.team2Score,
        roundNumberPrev: newState.roundNumber,
        throwingTeamPrev: newState.throwingTeam,
        isGameOverPrev: newState.isGameOver,
        winningTeamPrev: newState.winningTeam
      };

      if (showManualOverrideModal === 1) {
        newState.team1Score = manualScore;
        // Apply bust rule if enabled and needed
        if (settings.bustRuleEnabled && newState.team1Score > settings.scoreLimit) {
          newState.team1Score = settings.bustResetScore;
        }
      } else {
        newState.team2Score = manualScore;
        // Apply bust rule if enabled and needed
        if (settings.bustRuleEnabled && newState.team2Score > settings.scoreLimit) {
          newState.team2Score = settings.bustResetScore;
        }
      }

      newState.roundNumber = newState.roundNumber + 1; // Increment round
      newState.throwingTeam = showManualOverrideModal === 1 ? 2 : 1; // Switch throwing team
      newState.lastScoreUpdate = lastScoreUpdate; // Save previous state

      // Check win condition AFTER score update
      if (newState.team1Score >= settings.scoreLimit || newState.team2Score >= settings.scoreLimit) {
        newState.isGameOver = true;
        newState.winningTeam = newState.team1Score >= newState.team2Score ? 1 : 2;
      } else {
        newState.isGameOver = false;
        newState.winningTeam = undefined;
      }

      updateGameState(newState);
    }

    setShowManualOverrideModal(null);
  }, [showManualOverrideModal, canEdit, appMode, overrideSoloScore, manualScore, networkState, settings, updateGameState]);

  // Reset the game
  const handleReset = useCallback(() => {
    if (!canEdit) {
      setError('You do not have permission to reset the game');
      return;
    }
    setShowResetModal(true);
  }, [canEdit, setError]);

  const confirmReset = useCallback(() => {
    if (!canEdit) return; // Double check permission

    if (appMode === 'solo') {
      resetSoloGame();
    } else {
      // Reset network game state
      updateGameState({
        team1Score: 0,
        team2Score: 0,
        roundNumber: 1,
        throwingTeam: 1, // Or maybe keep the last throwing team? Resetting to 1 is simpler.
        isGameOver: false,
        winningTeam: undefined,
        lastScoreUpdate: undefined // Clear undo history on reset
      });
    }
    setShowResetModal(false);
  }, [canEdit, appMode, resetSoloGame, updateGameState]);

  // Undo last score
  const handleUndo = useCallback(() => {
    if (!canEdit) {
      setError('You do not have permission to undo scores');
      return;
    }

    if (appMode === 'solo') {
      undoSoloScore();
    } else if (networkState.lastScoreUpdate) {
      // Restore the previous state from lastScoreUpdate
      updateGameState({
        ...networkState, // Keep current state but overwrite specific fields
        team1Score: networkState.lastScoreUpdate.team1PrevScore,
        team2Score: networkState.lastScoreUpdate.team2PrevScore,
        roundNumber: networkState.lastScoreUpdate.roundNumberPrev,
        throwingTeam: networkState.lastScoreUpdate.throwingTeamPrev,
        isGameOver: networkState.lastScoreUpdate.isGameOverPrev,
        winningTeam: networkState.lastScoreUpdate.winningTeamPrev,
        lastScoreUpdate: undefined // Clear the undo state after using it
      });
    } else {
      setError('No previous score to undo.');
    }
  }, [canEdit, appMode, undoSoloScore, networkState, updateGameState, setError]);

  // Exit game
  const handleExit = useCallback(() => {
    if (appMode === 'solo') {
      navigate('/');
    } else {
      leaveLobby();
      navigate('/');
    }
  }, [appMode, navigate, leaveLobby]);

  // Return to lobby (network mode only)
  const handleReturnToLobby = useCallback(() => {
    if (appMode !== 'solo') {
      // Reset game state before returning to lobby?
      // Maybe not, allow resuming game later?
      // For now, just navigate.
      navigate('/lobby');
    }
  }, [appMode, navigate]);

  // Render
  return (
    <div className="scoreboard-container">
      {/* Header remains the same */}
      <header className="scoreboard-header">
        <h1>Scoreboard</h1>
        <div className="round-indicator">
          Round: {gameState.roundNumber}
        </div>
        <button onClick={handleExit} className="exit-button">
          Exit
        </button>
      </header>

      {/* Throwing indicator remains the same */}
      <div className="throwing-indicator">
        {!gameState.isGameOver && (
          <div>
            Next to throw: <span className="throwing-team">
              {gameState.throwingTeam === 1
                ? settings?.team1?.name ?? 'Team 1'
                : settings?.team2?.name ?? 'Team 2'}
            </span>
          </div>
        )}
      </div>

      <main className="scores-container">
        {/* Team 1 Score */}
        <div
          className={`team-score team-1 ${gameState.throwingTeam === 1 && !gameState.isGameOver ? 'active-team' : ''}`}
        >
          <h2>{settings?.team1?.name ?? 'Team 1'}</h2>
          <div className="score">{gameState.team1Score}</div>

          {canEdit && !gameState.isGameOver && (
            <div className="score-actions">
              <button onClick={() => handleAddPoints(1, 1)} className="add-button">
                +1
              </button>
              <button onClick={() => handleAddPoints(1, 3)} className="add-button">
                +3
              </button>
              <button onClick={() => handleAddPoints(1, -1)} className="subtract-button">
                -1
              </button>
              <button onClick={() => handleAddPoints(1, -3)} className="subtract-button">
                -3
              </button>
              {settings?.bustRuleEnabled && (
                <button onClick={() => handleBust(1)} className="bust-button">
                  BUST
                </button>
              )}
              <button onClick={() => handleManualOverride(1)} className="override-button">
                Set Score
              </button>
            </div>
          )}
        </div>

        {/* Team 2 Score */}
        <div
          className={`team-score team-2 ${gameState.throwingTeam === 2 && !gameState.isGameOver ? 'active-team' : ''}`}
        >
          <h2>{settings?.team2?.name ?? 'Team 2'}</h2>
          <div className="score">{gameState.team2Score}</div>

          {canEdit && !gameState.isGameOver && (
            <div className="score-actions">
              <button onClick={() => handleAddPoints(2, 1)} className="add-button">
                +1
              </button>
              <button onClick={() => handleAddPoints(2, 3)} className="add-button">
                +3
              </button>
              <button onClick={() => handleAddPoints(2, -1)} className="subtract-button">
                -1
              </button>
              <button onClick={() => handleAddPoints(2, -3)} className="subtract-button">
                -3
              </button>
              {settings?.bustRuleEnabled && (
                <button onClick={() => handleBust(2)} className="bust-button">
                  BUST
                </button>
              )}
              <button onClick={() => handleManualOverride(2)} className="override-button">
                Set Score
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Game controls - Removed Math Mode button */}
      <div className="game-controls">
        {/* Removed Math Mode Button */}
        {/* {!gameState.isGameOver && canEdit && !mathModeActive && (
          <button onClick={toggleMathMode} className="math-mode-button">
            Math Mode
          </button>
        )} */}

        {!gameState.isGameOver && canEdit && (
          <button onClick={handleReset} className="reset-button">
            Reset Game
          </button>
        )}

        {/* Enable Undo button if there's a last score update, even if game is over */}
        {canEdit && gameState.lastScoreUpdate && (
          <button onClick={handleUndo} className="undo-button">
            Undo Last Score
          </button>
        )}

        {appMode !== 'solo' && (
          <button onClick={handleReturnToLobby} className="lobby-button">
            Back to Lobby
          </button>
        )}
      </div>

      {/* Game Over UI - Added "Go Back" button */}
      {gameState.isGameOver && (
        <div className="game-over-container">
          <h2 className="winner-message">
            {gameState.winningTeam === 1
              ? settings?.team1?.name ?? 'Team 1'
              : settings?.team2?.name ?? 'Team 2'} WINS!
          </h2>

          <div className="game-over-actions">
            {/* Add button to undo the last score / revert game over state */}
            {canEdit && gameState.lastScoreUpdate && (
              <button onClick={handleUndo} className="undo-button go-back-button">
                Go Back (Undo Last Score)
              </button>
            )}

            {/* This button now correctly calls confirmReset */}
            <button onClick={confirmReset} className="new-game-button">
              New Game (Same Settings)
            </button>

            {appMode !== 'solo' && (
              <button onClick={handleReturnToLobby} className="lobby-button">
                Back to Lobby
              </button>
            )}
          </div>
        </div>
      )}

      {/* Manual Override Modal remains the same */}
      {showManualOverrideModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Manual Score Override</h3>
            <p>Set score for {showManualOverrideModal === 1 ? settings?.team1?.name ?? 'Team 1' : settings?.team2?.name ?? 'Team 2'}:</p>

            <input
              type="number"
              min="0"
              value={manualScore}
              onChange={(e) => setManualScore(parseInt(e.target.value) || 0)}
            />

            <div className="modal-actions">
              <button onClick={submitManualOverride} className="confirm-button">
                Set Score
              </button>
              <button onClick={() => setShowManualOverrideModal(null)} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal remains the same */}
      {showResetModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reset Game</h3>
            <p>Are you sure you want to reset the game? All scores will be set to zero.</p>

            <div className="modal-actions">
              <button onClick={confirmReset} className="confirm-button">
                Yes, Reset Game
              </button>
              <button onClick={() => setShowResetModal(false)} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scoreboard;
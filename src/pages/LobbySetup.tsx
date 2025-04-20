/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import {
  appModeAtom,
  currentLobbyIdAtom,
  isHostAtom,
  connectedUsersAtom,
  userNameAtom
} from '../store/atoms';
import { useLobby } from '../hooks/useLobby';
import { TeamColor } from '../types';
import { getShareableLobbyLink } from '../utils/lobbyUtils';

const LobbySetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [appMode] = useAtom(appModeAtom);
  const [currentLobbyId] = useAtom(currentLobbyIdAtom);
  const [isHost] = useAtom(isHostAtom);
  const [connectedUsers] = useAtom(connectedUsersAtom);
  const [userName] = useAtom(userNameAtom);

  // From useLobby hook
  const {
    gameSettings,
    updateGameSettings,
    joinLobby,
    leaveLobby,
    startGame,
    error,
    isLoading
  } = useLobby();

  // For joining with a lobby code from the URL
  const [joinCode, setJoinCode] = useState<string | null>(null);

  // Track if the game is starting to prevent multiple clicks
  const [isStarting, setIsStarting] = useState(false);

  // Process the URL parameters or state from navigate()
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const joinParam = searchParams.get('join');
    const stateCode = location.state?.lobbyCode;

    if (joinParam && joinParam.length === 4) {
      setJoinCode(joinParam);
    } else if (stateCode && stateCode.length === 4) {
      setJoinCode(stateCode);
    }
  }, [location]);

  // Attempt to join a lobby with the code
  useEffect(() => {
    const attemptJoin = async () => {
      if (joinCode && appMode === 'join' && !currentLobbyId) {
        await joinLobby(joinCode);
      }
    };

    attemptJoin();
  }, [joinCode, appMode, currentLobbyId, joinLobby]);

  // Handler for starting the game
  const handleStartGame = useCallback(async () => {
    if (isStarting) return;

    try {
      setIsStarting(true);
      const success = await startGame();
      if (success) {
        navigate('/game');
      }
    } finally {
      setIsStarting(false);
    }
  }, [startGame, navigate, isStarting]);

  // Handler for updating game settings
  const handleSettingChange = useCallback((field: string, value: any) => {
    const updateData: any = {};
    updateData[field] = value;
    updateGameSettings(updateData);
  }, [updateGameSettings]);

  // Handler for updating team settings
  const handleTeamChange = useCallback((team: 1 | 2, value: TeamColor) => {
    // Automatically set the name based on the color
    const newName = `Team ${value.charAt(0).toUpperCase() + value.slice(1)}`;
    const updateData: any = {};
    updateData[`team${team}`] = {
      ...gameSettings[`team${team}`],
      color: value,
      name: newName // Set the name automatically
    };
    updateGameSettings(updateData);
  }, [updateGameSettings, gameSettings]);

  // Copy the invite link to clipboard
  const copyInviteLink = useCallback(() => {
    if (!currentLobbyId) return;

    const link = getShareableLobbyLink(currentLobbyId);
    navigator.clipboard.writeText(link)
      .then(() => {
        alert('Invite link copied to clipboard!');
      })
      .catch(() => {
        alert(`Share this link: ${link}`);
      });
  }, [currentLobbyId]);

  // Go back to home
  const handleBack = useCallback(() => {
    leaveLobby();
    navigate('/');
  }, [leaveLobby, navigate]);

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="lobby-container">
        <h2>Loading...</h2>
      </div>
    );
  }

  // If no lobby ID, something went wrong
  if (!currentLobbyId) {
    return (
      <div className="lobby-container">
        <h2>Error</h2>
        <p>{error || "Couldn't create or join a lobby"}</p>
        <button onClick={handleBack} className="button primary">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="lobby-container">
      <header>
        <button onClick={handleBack} className="back-button">
          ← Back
        </button>
        <h1>{isHost ? 'Host Game' : 'Join Game'}</h1>
      </header>

      <div className="lobby-code-section">
        <h2>Lobby Code</h2>
        <div className="lobby-code">{currentLobbyId}</div>
        {isHost && (
          <div className="copy-link-container"> {/* Added a container */}
            <button onClick={copyInviteLink} className="button secondary">
              Copy Invite Link
            </button>
          </div>
        )}
      </div>

      <div className="connected-users-section">
        <h2>Connected Players ({connectedUsers.length})</h2>
        <ul className="users-list">
          {connectedUsers.map(user => (
            <li key={user.id} className={user.isHost ? 'host-user' : ''}>
              {user.name} {user.isHost ? '(Host)' : ''}
              {user.id === userName && ' (You)'}
            </li>
          ))}
        </ul>
      </div>

      {isHost ? (
        // Host view - can edit settings
        <div className="settings-section">
          <h2>Game Settings</h2>

          <div className="setting-group">
            <label htmlFor="scoreLimit">Score Limit:</label>
            <input
              type="number"
              id="scoreLimit"
              min="1"
              max="99"
              value={gameSettings.scoreLimit}
              onChange={(e) => handleSettingChange('scoreLimit', parseInt(e.target.value) || 21)}
            />
            <p className="setting-info">The score a team needs to reach to win the game.</p>
          </div>

          <div className="setting-group">
            <label htmlFor="bustRule">Bust Rule:</label>
            <input
              type="checkbox"
              id="bustRule"
              checked={gameSettings.bustRuleEnabled}
              onChange={(e) => handleSettingChange('bustRuleEnabled', e.target.checked)}
            />
            <span className="toggle-label">Enabled</span>
            <p className="setting-info">If enabled, exceeding the Score Limit resets a team's score to the defined 'Bust Reset Score'.</p>
            {gameSettings.bustRuleEnabled && (
              <div className="setting-group">
                <label htmlFor="bustResetScore">Bust Reset Score:</label>
                <input
                  type="number"
                  id="bustResetScore"
                  min="0"
                  max={gameSettings.scoreLimit - 1}
                  value={gameSettings.bustResetScore}
                  onChange={(e) => handleSettingChange('bustResetScore', parseInt(e.target.value) || 15)}
                />
                <p className="setting-info">The score a team resets to if they go over the Score Limit.</p>
              </div>
            )}
          </div>

          <div className="setting-group">
            <label htmlFor="allowOthersToEdit">Allow Others to Edit Score:</label>
            <input
              type="checkbox"
              id="allowOthersToEdit"
              checked={gameSettings.allowOthersToEditScore}
              onChange={(e) => handleSettingChange('allowOthersToEditScore', e.target.checked)}
            />
            <span className="toggle-label">Enabled</span>
            <div className="setting-info">
              When enabled, all players can update scores
            </div>
            <p className="setting-info">If enabled, anyone connected can update the score.</p>
          </div>

          <div className="teams-settings">
            <h3>Team Settings</h3>

            <div className="team-setting">
              <h4>Team 1</h4>
              <select
                value={gameSettings.team1.color}
                onChange={(e) => handleTeamChange(1, e.target.value as TeamColor)}
              >
                <option value="red">Red</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="orange">Orange</option>
                <option value="purple">Purple</option>
                <option value="yellow">Yellow</option>
              </select>
            </div>

            <div className="team-setting">
              <h4>Team 2</h4>
              <select
                value={gameSettings.team2.color}
                onChange={(e) => handleTeamChange(2, e.target.value as TeamColor)}
              >
                <option value="blue">Blue</option>
                <option value="red">Red</option>
                <option value="green">Green</option>
                <option value="orange">Orange</option>
                <option value="purple">Purple</option>
                <option value="yellow">Yellow</option>
              </select>
            </div>
          </div>

          <div className="action-buttons">
            <button
              onClick={handleStartGame}
              className="button primary start-button"
              disabled={isStarting || connectedUsers.length === 0}
            >
              {isStarting ? 'Starting...' : 'Start Game'}
            </button>
          </div>
        </div>
      ) : (
        // Joiner view - read-only settings
        <div className="joiner-settings">
          <h2>Game Settings</h2>

          <div className="setting-item">
            <strong>Score Limit:</strong> {gameSettings.scoreLimit}
          </div>

          <div className="setting-item">
            <strong>Bust Rule:</strong> {gameSettings.bustRuleEnabled ? 'Enabled' : 'Disabled'}
            {gameSettings.bustRuleEnabled && (
              <div>
                <strong>Bust Reset Score:</strong> {gameSettings.bustResetScore}
              </div>
            )}
          </div>

          <div className="setting-item">
            <strong>Team 1:</strong> {gameSettings.team1.name} ({gameSettings.team1.color})
          </div>

          <div className="setting-item">
            <strong>Team 2:</strong> {gameSettings.team2.name} ({gameSettings.team2.color})
          </div>

          <div className="waiting-message">
            Waiting for host to start the game...
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default LobbySetup;
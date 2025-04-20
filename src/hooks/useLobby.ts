import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { ref, set, onValue, update, off, remove } from 'firebase/database';
import { database } from '../firebase/config';
import {
  currentLobbyIdAtom,
  isHostAtom,
  gameSettingsAtom,
  gameStateAtom,
  connectedUsersAtom,
  userIdAtom,
  userNameAtom,
  isLoadingAtom,
  errorAtom
} from '../store/atoms';
import { GameSettings, GameState, ConnectedUser } from '../types';
import { generateUniqueLobbyId, getDefaultGameSettings, getDefaultGameState } from '../utils/lobbyUtils';

export const useLobby = () => {
  // Atoms
  const [currentLobbyId, setCurrentLobbyId] = useAtom(currentLobbyIdAtom);
  const [isHost, setIsHost] = useAtom(isHostAtom);
  const [gameSettings, setGameSettings] = useAtom(gameSettingsAtom);
  const [gameState, setGameState] = useAtom(gameStateAtom);
  const [connectedUsers, setConnectedUsers] = useAtom(connectedUsersAtom);
  const [userId] = useAtom(userIdAtom);
  const [userName] = useAtom(userNameAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [error, setError] = useAtom(errorAtom);

  // Create a new lobby
  const createLobby = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate a unique lobby ID
      const lobbyId = await generateUniqueLobbyId();

      // Default game settings
      const defaultSettings = getDefaultGameSettings();
      const defaultGameState = getDefaultGameState();

      // Create the user object
      const user: ConnectedUser = {
        id: userId,
        name: userName || 'Host',
        isHost: true,
        joinedAt: Date.now()
      };

      // Create the lobby data structure
      const lobbyData = {
        settings: defaultSettings,
        gameState: defaultGameState,
        connectedUsers: {
          [userId]: user
        },
        createdAt: Date.now()
      };

      // Save to Firebase
      const lobbyRef = ref(database, `lobbies/${lobbyId}`);
      await set(lobbyRef, lobbyData);

      // Update local state
      setCurrentLobbyId(lobbyId);
      setIsHost(true);
      setGameSettings(defaultSettings);
      setGameState(defaultGameState);
      setConnectedUsers([user]);

      return lobbyId;
    } catch (error) {
      console.error('Error creating lobby:', error);
      setError('Failed to create lobby. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, userName, setCurrentLobbyId, setIsHost, setGameSettings, setGameState, setConnectedUsers, setIsLoading, setError]);

  // Leave the current lobby
  const leaveLobby = useCallback(() => {
    if (!currentLobbyId) return;

    try {
      // Remove user from Firebase
      const userRef = ref(database, `lobbies/${currentLobbyId}/connectedUsers/${userId}`);
      remove(userRef);

      // Clean up listeners
      const lobbyRef = ref(database, `lobbies/${currentLobbyId}`);
      off(lobbyRef);

      // If host is leaving, remove the entire lobby
      if (isHost) {
        remove(lobbyRef);
      }

      // Reset local state
      setCurrentLobbyId(null);
      setIsHost(false);
      setGameSettings(getDefaultGameSettings());
      setGameState(getDefaultGameState());
      setConnectedUsers([]);

    } catch (error) {
      console.error('Error leaving lobby:', error);
    }
  }, [currentLobbyId, userId, isHost, setCurrentLobbyId, setIsHost, setGameSettings, setGameState, setConnectedUsers]);

  // Join an existing lobby
  const joinLobby = useCallback(async (lobbyId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Reference to the lobby
      const lobbyRef = ref(database, `lobbies/${lobbyId}`);

      // Create the user object
      const user: ConnectedUser = {
        id: userId,
        name: userName || 'Guest',
        isHost: false,
        joinedAt: Date.now()
      };

      // Add user to the lobby
      const userRef = ref(database, `lobbies/${lobbyId}/connectedUsers/${userId}`);
      await set(userRef, user);

      // Set up listeners
      onValue(lobbyRef, (snapshot) => {
        if (!snapshot.exists()) {
          setError('Lobby not found or has been closed');
          leaveLobby();
          return;
        }

        const lobbyData = snapshot.val();

        // Update settings and game state
        setGameSettings(lobbyData.settings);
        setGameState(lobbyData.gameState);

        // Extract and update connected users
        const usersData = lobbyData.connectedUsers || {};
        const usersList = Object.values(usersData) as ConnectedUser[];
        setConnectedUsers(usersList);
      });

      // Update local state
      setCurrentLobbyId(lobbyId);
      setIsHost(false);

      return true;
    } catch (error) {
      console.error('Error joining lobby:', error);
      setError('Failed to join lobby. Please check the code and try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, userName, setCurrentLobbyId, setIsHost, setGameSettings, setGameState, setConnectedUsers, setIsLoading, setError, leaveLobby]);

  // Update game settings (host only)
  const updateGameSettings = useCallback((newSettings: Partial<GameSettings>) => {
    if (!currentLobbyId || !isHost) return;

    try {
      const settingsRef = ref(database, `lobbies/${currentLobbyId}/settings`);
      const updatedSettings = { ...gameSettings, ...newSettings };

      // Update Firebase
      update(settingsRef, newSettings);

      // Update local state
      setGameSettings(updatedSettings);

    } catch (error) {
      console.error('Error updating game settings:', error);
      setError('Failed to update game settings');
    }
  }, [currentLobbyId, isHost, gameSettings, setGameSettings, setError]);

  // Update game state (host or if allowOthersToEditScore is enabled)
  const updateGameState = useCallback((newState: Partial<GameState>) => {
    if (!currentLobbyId) return;

    try {
      // Check if user has permission to update
      if (!isHost && !gameSettings.allowOthersToEditScore) {
        setError('You do not have permission to update the score');
        return;
      }

      const gameStateRef = ref(database, `lobbies/${currentLobbyId}/gameState`);
      const updatedState = { ...gameState, ...newState };

      // Update Firebase
      update(gameStateRef, newState);

      // Update local state
      setGameState(updatedState);

    } catch (error) {
      console.error('Error updating game state:', error);
      setError('Failed to update game state');
    }
  }, [currentLobbyId, isHost, gameSettings, gameState, setGameState, setError]);

  // Start the game (host only)
  const startGame = useCallback(() => {
    if (!currentLobbyId || !isHost) return false;

    try {
      // Update game state to indicate game has started
      const gameStateRef = ref(database, `lobbies/${currentLobbyId}/gameState`);
      const initialGameState = getDefaultGameState();

      // Update Firebase
      set(gameStateRef, initialGameState);

      // Update local state
      setGameState(initialGameState);

      return true;
    } catch (error) {
      console.error('Error starting game:', error);
      setError('Failed to start game');
      return false;
    }
  }, [currentLobbyId, isHost, setGameState, setError]);

  return {
    currentLobbyId,
    isHost,
    gameSettings,
    gameState,
    connectedUsers,
    isLoading,
    error,
    createLobby,
    joinLobby,
    leaveLobby,
    updateGameSettings,
    updateGameState,
    startGame
  };
};
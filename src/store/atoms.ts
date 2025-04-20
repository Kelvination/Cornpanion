import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { AppMode, GameSettings, GameState, ConnectedUser, Lobby } from '../types';
import { getDefaultGameSettings, getDefaultGameState } from '../utils/lobbyUtils';

// User information
export const userIdAtom = atomWithStorage<string>('cornpanion-userId', crypto.randomUUID());
export const userNameAtom = atomWithStorage<string>('cornpanion-userName', '');

// Current app mode (host, join, solo)
export const appModeAtom = atom<AppMode | null>(null);

// Current lobby information
export const currentLobbyIdAtom = atom<string | null>(null);
export const isHostAtom = atom<boolean>(false);

// Game settings
export const gameSettingsAtom = atomWithStorage<GameSettings>(
  'cornpanion-gameSettings',
  getDefaultGameSettings()
);

// Game state
export const gameStateAtom = atom<GameState>(getDefaultGameState());

// Connected users in the current lobby
export const connectedUsersAtom = atom<ConnectedUser[]>([]);

// Solo mode specific settings
export const soloGameSettingsAtom = atomWithStorage<GameSettings>(
  'cornpanion-soloSettings',
  getDefaultGameSettings()
);

// Solo mode specific game state
export const soloGameStateAtom = atomWithStorage<GameState>(
  'cornpanion-soloState',
  getDefaultGameState()
);

// Loading and error state
export const isLoadingAtom = atom<boolean>(false);
export const errorAtom = atom<string | null>(null);

// Derived atom for the full lobby data
export const currentLobbyAtom = atom<Lobby | null>(
  (get) => {
    const lobbyId = get(currentLobbyIdAtom);
    if (!lobbyId) return null;

    return {
      id: lobbyId,
      settings: get(gameSettingsAtom),
      gameState: get(gameStateAtom),
      connectedUsers: get(connectedUsersAtom),
      hostId: get(connectedUsersAtom).find(user => user.isHost)?.id || '',
      createdAt: Date.now()
    };
  }
);
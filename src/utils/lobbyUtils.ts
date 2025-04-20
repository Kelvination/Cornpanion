import { get, ref } from 'firebase/database';
import { database } from '../firebase/config';

// Generate a random 4-character alphanumeric lobby ID
export const generateLobbyId = (): string => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omitting confusing characters like O, 0, 1, I
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Check if a lobby ID already exists in Firebase
export const checkLobbyExists = async (lobbyId: string): Promise<boolean> => {
  const lobbyRef = ref(database, `lobbies/${lobbyId}`);
  try {
    const snapshot = await get(lobbyRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking lobby existence:', error);
    return false;
  }
};

// Generate a unique lobby ID that doesn't already exist
export const generateUniqueLobbyId = async (): Promise<string> => {
  let lobbyId = generateLobbyId();
  let attempts = 0;
  const maxAttempts = 10;

  while (await checkLobbyExists(lobbyId) && attempts < maxAttempts) {
    lobbyId = generateLobbyId();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate a unique lobby ID after multiple attempts');
  }

  return lobbyId;
};

// Get a shareable join link for a lobby
export const getShareableLobbyLink = (lobbyId: string): string => {
  return `${window.location.origin}?join=${lobbyId}`;
};

// Default game settings
export const getDefaultGameSettings = () => ({
  scoreLimit: 21,
  bustRuleEnabled: true,
  bustResetScore: 15,
  allowOthersToEditScore: false,
  team1: {
    name: 'Team Red',
    color: 'red',
    score: 0,
  },
  team2: {
    name: 'Team Blue',
    color: 'blue',
    score: 0,
  },
});

// Default game state
export const getDefaultGameState = () => ({
  team1Score: 0,
  team2Score: 0,
  roundNumber: 1,
  throwingTeam: 1 as const,
  isGameOver: false,
});
import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  API_KEY_EXPIRY_MS,
  decryptApiKey,
  encryptApiKey,
  isApiKeyExpired,
  StoredApiKey,
} from '@utils/encryption';
import { Player } from '@utils/xlsxParser';

interface AppState {
  players: Player[];
  teamA: Player[];
  teamB: Player[];
  bestPlayer: Player | null;
  showAbout: boolean;
  selectedPlayers: Player[];
  allPlayers: Player[];
  encryptedApiKey: StoredApiKey;
  teamExplanation: string;
  playerAssessments: Record<string, string>;
  setPlayers: (players: Player[]) => void;
  setTeams: (
    teamA: Player[],
    teamB: Player[],
    explanation?: string,
    assessments?: Record<string, string>,
  ) => void;
  setBestPlayer: (player: Player | null) => void;
  setShowAbout: (show: boolean) => void;
  setSelectedPlayers: (players: Player[]) => void;
  setAllPlayers: (players: Player[]) => void;
  setOpenAIKey: (key: string) => void;
  getOpenAIKey: () => string;
  isOpenAIKeyValid: () => boolean;
  reset: () => void;
  resetSelection: () => void;
}

export const useStore = create(
  persist<AppState>(
    (set, get) => ({
      players: [],
      teamA: [],
      teamB: [],
      bestPlayer: null,
      showAbout: false,
      selectedPlayers: [],
      allPlayers: [],
      encryptedApiKey: { key: '', timestamp: 0 },
      teamExplanation: '',
      playerAssessments: {},
      setPlayers: (players) => set({ players, allPlayers: players }),
      setTeams: (teamA, teamB, teamExplanation = '', playerAssessments = {}) =>
        set({ teamA, teamB, teamExplanation, playerAssessments }),
      setBestPlayer: (bestPlayer) => set({ bestPlayer }),
      setShowAbout: (showAbout) => set({ showAbout }),
      setSelectedPlayers: (selectedPlayers) => set({ selectedPlayers }),
      setAllPlayers: (allPlayers) => set({ allPlayers }),
      setOpenAIKey: (key) =>
        set({
          encryptedApiKey: {
            key: encryptApiKey(key),
            timestamp: Date.now(),
          },
        }),
      getOpenAIKey: () => {
        const { encryptedApiKey } = get();
        if (
          !encryptedApiKey.key ||
          isApiKeyExpired(encryptedApiKey.timestamp, API_KEY_EXPIRY_MS)
        ) {
          return '';
        }
        return decryptApiKey(encryptedApiKey.key);
      },
      isOpenAIKeyValid: () => {
        const { encryptedApiKey } = get();
        return (
          !!encryptedApiKey.key &&
          !isApiKeyExpired(encryptedApiKey.timestamp, API_KEY_EXPIRY_MS)
        );
      },
      reset: () =>
        set({
          teamA: [],
          teamB: [],
          bestPlayer: null,
          players: [],
          selectedPlayers: [],
          allPlayers: [],
          teamExplanation: '',
          playerAssessments: {},
        }),
      resetSelection: () =>
        set({
          selectedPlayers: [],
          teamA: [],
          teamB: [],
          teamExplanation: '',
          playerAssessments: {},
        }),
    }),
    {
      name: 'fairplay-storage',
      partialize: (state) =>
        ({
          players: state.players,
          allPlayers: state.allPlayers,
          selectedPlayers: state.selectedPlayers,
          bestPlayer: state.bestPlayer,
          teamA: state.teamA,
          teamB: state.teamB,
          encryptedApiKey: state.encryptedApiKey,
          teamExplanation: state.teamExplanation,
          playerAssessments: state.playerAssessments,
        }) as AppState,
    },
  ) as StateCreator<AppState>,
);

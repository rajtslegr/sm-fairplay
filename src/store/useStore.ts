import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

import { decryptApiKey, encryptApiKey, StoredApiKey } from '@utils/encryption';
import { Match, Player } from '@utils/xlsxParser';

interface AppState {
  players: Player[];
  teamA: Player[];
  teamB: Player[];
  showAbout: boolean;
  selectedPlayers: Player[];
  allPlayers: Player[];
  matchHistory: Match[];
  encryptedApiKey: StoredApiKey;
  teamExplanation: string;
  playerAssessments: Record<string, string>;
  setPlayers: (players: Player[]) => void;
  setMatchHistory: (matches: Match[]) => void;
  setTeams: (
    teamA: Player[],
    teamB: Player[],
    explanation?: string,
    assessments?: Record<string, string>,
  ) => void;
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
      showAbout: false,
      selectedPlayers: [],
      allPlayers: [],
      matchHistory: [],
      encryptedApiKey: { key: '', timestamp: 0 },
      teamExplanation: '',
      playerAssessments: {},
      setPlayers: (players) => set({ players, allPlayers: players }),
      setMatchHistory: (matchHistory) => set({ matchHistory }),
      setTeams: (teamA, teamB, teamExplanation = '', playerAssessments = {}) =>
        set({ teamA, teamB, teamExplanation, playerAssessments }),
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
        if (!encryptedApiKey.key) {
          return '';
        }
        return decryptApiKey(encryptedApiKey.key);
      },
      isOpenAIKeyValid: () => {
        const { encryptedApiKey } = get();
        return !!encryptedApiKey.key;
      },
      reset: () =>
        set({
          teamA: [],
          teamB: [],
          players: [],
          selectedPlayers: [],
          allPlayers: [],
          matchHistory: [],
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
          teamA: state.teamA,
          teamB: state.teamB,
          matchHistory: state.matchHistory,
          encryptedApiKey: state.encryptedApiKey,
          teamExplanation: state.teamExplanation,
          playerAssessments: state.playerAssessments,
        }) as AppState,
    },
  ) as StateCreator<AppState>,
);

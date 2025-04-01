import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

import { Match, Player } from '@utils/xlsxParser';

interface AppState {
  players: Player[];
  teamA: Player[];
  teamB: Player[];
  showAbout: boolean;
  selectedPlayers: Player[];
  allPlayers: Player[];
  matchHistory: Match[];
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
  reset: () => void;
  resetSelection: () => void;
}

export const useStore = create(
  persist<AppState>(
    (set) => ({
      players: [],
      teamA: [],
      teamB: [],
      showAbout: false,
      selectedPlayers: [],
      allPlayers: [],
      matchHistory: [],
      teamExplanation: '',
      playerAssessments: {},
      setPlayers: (players) => set({ players, allPlayers: players }),
      setMatchHistory: (matchHistory) => set({ matchHistory }),
      setTeams: (teamA, teamB, teamExplanation = '', playerAssessments = {}) =>
        set({ teamA, teamB, teamExplanation, playerAssessments }),
      setShowAbout: (showAbout) => set({ showAbout }),
      setSelectedPlayers: (selectedPlayers) => set({ selectedPlayers }),
      setAllPlayers: (allPlayers) => set({ allPlayers }),
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
          teamExplanation: state.teamExplanation,
          playerAssessments: state.playerAssessments,
        }) as AppState,
    },
  ) as StateCreator<AppState>,
);

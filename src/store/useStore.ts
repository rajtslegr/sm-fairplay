import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

import { SelectionStats } from '@utils/teamSelectionCore';
import { Match, Player } from '@utils/xlsxParser';

interface AppState {
  players: Player[];
  teamA: Player[];
  teamB: Player[];
  showAbout: boolean;
  selectedPlayers: Player[];
  allPlayers: Player[];
  matchHistory: Match[];
  debugInfo: SelectionStats | null;
  setPlayers: (players: Player[]) => void;
  setMatchHistory: (matches: Match[]) => void;
  setTeams: (
    teamA: Player[],
    teamB: Player[],
    debugInfo?: SelectionStats,
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
      debugInfo: null,
      setPlayers: (players) => set({ players, allPlayers: players }),
      setMatchHistory: (matchHistory) => set({ matchHistory }),
      setTeams: (teamA, teamB, debugInfo) => set({ teamA, teamB, debugInfo }),
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
          debugInfo: null,
        }),
      resetSelection: () =>
        set({
          selectedPlayers: [],
          teamA: [],
          teamB: [],
          debugInfo: null,
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
        }) as AppState,
    },
  ) as StateCreator<AppState>,
);

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
  setPlayers: (players: Player[]) => void;
  setMatchHistory: (matches: Match[]) => void;
  setTeams: (teamA: Player[], teamB: Player[]) => void;
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
      setPlayers: (players) => set({ players, allPlayers: players }),
      setMatchHistory: (matchHistory) => set({ matchHistory }),
      setTeams: (teamA, teamB) => set({ teamA, teamB }),
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
        }),
      resetSelection: () =>
        set({
          selectedPlayers: [],
          teamA: [],
          teamB: [],
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

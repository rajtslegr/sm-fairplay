import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

import { Player } from '@utils/xlsxParser';

interface AppState {
  players: Player[];
  teamA: Player[];
  teamB: Player[];
  bestPlayer: Player | null;
  showInfo: boolean;
  selectedPlayers: Player[];
  allPlayers: Player[];
  setPlayers: (players: Player[]) => void;
  setTeams: (teamA: Player[], teamB: Player[]) => void;
  setBestPlayer: (player: Player | null) => void;
  setShowInfo: (show: boolean) => void;
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
      bestPlayer: null,
      showInfo: false,
      selectedPlayers: [],
      allPlayers: [],
      setPlayers: (players) => set({ players, allPlayers: players }),
      setTeams: (teamA, teamB) => set({ teamA, teamB }),
      setBestPlayer: (bestPlayer) => set({ bestPlayer }),
      setShowInfo: (showInfo) => set({ showInfo }),
      setSelectedPlayers: (selectedPlayers) => set({ selectedPlayers }),
      setAllPlayers: (allPlayers) => set({ allPlayers }),
      reset: () =>
        set({
          teamA: [],
          teamB: [],
          bestPlayer: null,
          players: [],
          selectedPlayers: [],
          allPlayers: [],
        }),
      resetSelection: () =>
        set({
          selectedPlayers: [],
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
        }) as AppState,
    },
  ) as StateCreator<AppState>,
);

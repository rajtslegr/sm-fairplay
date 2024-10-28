import { create } from 'zustand';

import { Player } from '@utils/xlsxParser';

interface AppState {
  players: Player[];
  teamA: Player[];
  teamB: Player[];
  bestPlayer: Player | null;
  showInfo: boolean;
  setPlayers: (players: Player[]) => void;
  setTeams: (teamA: Player[], teamB: Player[]) => void;
  setBestPlayer: (player: Player | null) => void;
  setShowInfo: (show: boolean) => void;
  reset: () => void;
}

export const useStore = create<AppState>((set) => ({
  players: [],
  teamA: [],
  teamB: [],
  bestPlayer: null,
  showInfo: false,
  setPlayers: (players) => set({ players }),
  setTeams: (teamA, teamB) => set({ teamA, teamB }),
  setBestPlayer: (bestPlayer) => set({ bestPlayer }),
  setShowInfo: (showInfo) => set({ showInfo }),
  reset: () =>
    set({
      teamA: [],
      teamB: [],
      bestPlayer: null,
      players: [],
    }),
}));

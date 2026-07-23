import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

import { SelectionStats } from '@utils/teamSelection';
import { Match, ParsedData, Player } from '@utils/xlsxParser';

export interface UploadedFileInfo {
  name: string;
  playerCount: number;
  matchCount: number;
}

function mergePlayersFromFiles(
  fileDataMap: Record<string, ParsedData>,
): Player[] {
  const playerMap = new Map<string, Player>();

  for (const data of Object.values(fileDataMap)) {
    for (const player of data.players) {
      const existing = playerMap.get(player.name);
      if (existing) {
        existing.goals += player.goals;
        existing.assists += player.assists;
        existing.points += player.points;
        existing.matches += player.matches;
      } else {
        playerMap.set(player.name, { ...player });
      }
    }
  }

  return Array.from(playerMap.values()).map((player) => ({
    ...player,
    goalsPerMatch: player.matches > 0 ? player.goals / player.matches : 0,
    assistsPerMatch: player.matches > 0 ? player.assists / player.matches : 0,
    pointsPerMatch: player.matches > 0 ? player.points / player.matches : 0,
  }));
}

function mergeMatchesFromFiles(
  fileDataMap: Record<string, ParsedData>,
): Match[] {
  return Object.values(fileDataMap).flatMap((data) => data.matches);
}

function buildUploadedFilesList(
  fileDataMap: Record<string, ParsedData>,
): UploadedFileInfo[] {
  return Object.entries(fileDataMap).map(([name, data]) => ({
    name,
    playerCount: data.players.length,
    matchCount: data.matches.length,
  }));
}

interface AppState {
  players: Player[];
  teamA: Player[];
  teamB: Player[];
  showAbout: boolean;
  selectedPlayers: Player[];
  allPlayers: Player[];
  matchHistory: Match[];
  debugInfo: SelectionStats | null;
  uploadedFiles: UploadedFileInfo[];
  fileDataMap: Record<string, ParsedData>;
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
  addFileData: (fileName: string, data: ParsedData) => void;
  removeFileData: (fileName: string) => void;
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
      uploadedFiles: [],
      fileDataMap: {},
      setPlayers: (players) => set({ players, allPlayers: players }),
      setMatchHistory: (matchHistory) => set({ matchHistory }),
      setTeams: (teamA, teamB, debugInfo) => set({ teamA, teamB, debugInfo }),
      setShowAbout: (showAbout) => set({ showAbout }),
      setSelectedPlayers: (selectedPlayers) => set({ selectedPlayers }),
      setAllPlayers: (allPlayers) => set({ allPlayers }),
      addFileData: (fileName, data) =>
        set((state) => {
          const newFileDataMap = {
            ...state.fileDataMap,
            [fileName]: data,
          };
          const players = mergePlayersFromFiles(newFileDataMap);
          const matchHistory = mergeMatchesFromFiles(newFileDataMap);
          const uploadedFiles = buildUploadedFilesList(newFileDataMap);
          return {
            fileDataMap: newFileDataMap,
            players,
            allPlayers: players,
            matchHistory,
            uploadedFiles,
            selectedPlayers: [],
            teamA: [],
            teamB: [],
            debugInfo: null,
          };
        }),
      removeFileData: (fileName) =>
        set((state) => {
          const newFileDataMap = { ...state.fileDataMap };
          delete newFileDataMap[fileName];
          const newFileDataMapEmpty = Object.keys(newFileDataMap).length === 0;
          const players = newFileDataMapEmpty
            ? []
            : mergePlayersFromFiles(newFileDataMap);
          const matchHistory = newFileDataMapEmpty
            ? []
            : mergeMatchesFromFiles(newFileDataMap);
          const uploadedFiles = buildUploadedFilesList(newFileDataMap);
          return {
            fileDataMap: newFileDataMap,
            players,
            allPlayers: players,
            matchHistory,
            uploadedFiles,
            selectedPlayers: [],
            teamA: [],
            teamB: [],
            debugInfo: null,
          };
        }),
      reset: () =>
        set({
          teamA: [],
          teamB: [],
          players: [],
          selectedPlayers: [],
          allPlayers: [],
          matchHistory: [],
          debugInfo: null,
          uploadedFiles: [],
          fileDataMap: {},
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
          uploadedFiles: state.uploadedFiles,
          fileDataMap: state.fileDataMap,
        }) as AppState,
    },
  ) as StateCreator<AppState>,
);

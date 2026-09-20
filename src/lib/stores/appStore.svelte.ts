import type { Match, ParsedData, Player } from '$lib/utils/types';
import {
  normalizePlayerName,
  type SelectionStats,
} from '$lib/utils/teamSelectionCore';
import { SvelteMap } from 'svelte/reactivity';

const STORAGE_KEY = 'fairplay-storage';

export interface UploadedFileInfo {
  name: string;
  playerCount: number;
  matchCount: number;
}

interface PersistedState {
  players: Player[];
  allPlayers: Player[];
  selectedPlayers: Player[];
  teamA: Player[];
  teamB: Player[];
  matchHistory: Match[];
  uploadedFiles: UploadedFileInfo[];
  fileDataMap: Record<string, ParsedData>;
}

const emptyState = (): PersistedState => ({
  players: [],
  allPlayers: [],
  selectedPlayers: [],
  teamA: [],
  teamB: [],
  matchHistory: [],
  uploadedFiles: [],
  fileDataMap: {},
});

function loadPersisted(): PersistedState {
  if (typeof window === 'undefined') return emptyState();
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
}

function mergePlayers(fileDataMap: Record<string, ParsedData>): Player[] {
  const players = new SvelteMap<string, Player>();
  for (const data of Object.values(fileDataMap)) {
    for (const player of data.players) {
      const name = normalizePlayerName(player.name);
      const existing = players.get(name);
      if (existing) {
        existing.goals += player.goals;
        existing.assists += player.assists;
        existing.points += player.points;
        existing.matches += player.matches;
      } else {
        players.set(name, { ...player, name });
      }
    }
  }

  return [...players.values()].map((player) => ({
    ...player,
    goalsPerMatch: player.matches > 0 ? player.goals / player.matches : 0,
    assistsPerMatch: player.matches > 0 ? player.assists / player.matches : 0,
    pointsPerMatch: player.matches > 0 ? player.points / player.matches : 0,
  }));
}

function getUploadedFiles(
  fileDataMap: Record<string, ParsedData>,
): UploadedFileInfo[] {
  return Object.entries(fileDataMap).map(([name, data]) => ({
    name,
    playerCount: data.players.length,
    matchCount: data.matches.length,
  }));
}

class AppStore {
  players = $state<Player[]>(loadPersisted().players);
  allPlayers = $state<Player[]>(loadPersisted().allPlayers);
  selectedPlayers = $state<Player[]>(loadPersisted().selectedPlayers);
  teamA = $state<Player[]>(loadPersisted().teamA);
  teamB = $state<Player[]>(loadPersisted().teamB);
  matchHistory = $state<Match[]>(loadPersisted().matchHistory);
  uploadedFiles = $state<UploadedFileInfo[]>(loadPersisted().uploadedFiles);
  fileDataMap = $state<Record<string, ParsedData>>(loadPersisted().fileDataMap);
  debugInfo = $state<SelectionStats | null>(null);
  showAbout = $state(false);

  private save() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          players: this.players,
          allPlayers: this.allPlayers,
          selectedPlayers: this.selectedPlayers,
          teamA: this.teamA,
          teamB: this.teamB,
          matchHistory: this.matchHistory,
          uploadedFiles: this.uploadedFiles,
          fileDataMap: this.fileDataMap,
        }),
      );
    } catch {
      // Persistence is optional; app remains usable when storage is unavailable.
    }
  }

  setPlayers(players: Player[]) {
    this.players = players;
    this.allPlayers = players;
    this.save();
  }

  setMatchHistory(matchHistory: Match[]) {
    this.matchHistory = matchHistory;
    this.save();
  }

  addFileData(fileName: string, data: ParsedData) {
    const fileDataMap = { ...this.fileDataMap, [fileName]: data };
    this.fileDataMap = fileDataMap;
    this.players = mergePlayers(fileDataMap);
    this.allPlayers = this.players;
    this.matchHistory = Object.values(fileDataMap).flatMap(
      (file) => file.matches,
    );
    this.uploadedFiles = getUploadedFiles(fileDataMap);
    this.selectedPlayers = [];
    this.teamA = [];
    this.teamB = [];
    this.debugInfo = null;
    this.save();
  }

  removeFileData(fileName: string) {
    const fileDataMap = { ...this.fileDataMap };
    delete fileDataMap[fileName];
    this.fileDataMap = fileDataMap;
    this.players = mergePlayers(fileDataMap);
    this.allPlayers = this.players;
    this.matchHistory = Object.values(fileDataMap).flatMap(
      (file) => file.matches,
    );
    this.uploadedFiles = getUploadedFiles(fileDataMap);
    this.selectedPlayers = [];
    this.teamA = [];
    this.teamB = [];
    this.debugInfo = null;
    this.save();
  }

  setTeams(teamA: Player[], teamB: Player[], debugInfo?: SelectionStats) {
    this.teamA = teamA;
    this.teamB = teamB;
    this.debugInfo = debugInfo ?? null;
    this.save();
  }

  setSelectedPlayers(players: Player[]) {
    this.selectedPlayers = players;
    this.save();
  }

  setAllPlayers(players: Player[]) {
    this.allPlayers = players;
    this.save();
  }

  reset() {
    Object.assign(this, emptyState());
    this.debugInfo = null;
    this.save();
  }

  resetSelection() {
    this.selectedPlayers = [];
    this.teamA = [];
    this.teamB = [];
    this.debugInfo = null;
    this.save();
  }
}

export const appStore = new AppStore();

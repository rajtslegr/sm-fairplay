// App store using Svelte 5 runes with localStorage persistence
import type { Player, Match } from '$lib/utils/types';
import type { SelectionStats } from '$lib/utils/teamSelectionCore';

const STORAGE_KEY = 'fairplay-storage';

interface PersistedState {
	players: Player[];
	allPlayers: Player[];
	selectedPlayers: Player[];
	teamA: Player[];
	teamB: Player[];
	matchHistory: Match[];
}

function loadPersisted(): PersistedState {
	if (typeof window === 'undefined') {
		return { players: [], allPlayers: [], selectedPlayers: [], teamA: [], teamB: [], matchHistory: [] };
	}
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			return {
				players: parsed.players ?? [],
				allPlayers: parsed.allPlayers ?? [],
				selectedPlayers: parsed.selectedPlayers ?? [],
				teamA: parsed.teamA ?? [],
				teamB: parsed.teamB ?? [],
				matchHistory: parsed.matchHistory ?? []
			};
		}
	} catch {
		// ignore
	}
	return { players: [], allPlayers: [], selectedPlayers: [], teamA: [], teamB: [], matchHistory: [] };
}

function persist(state: PersistedState) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// ignore
	}
}

const initial = loadPersisted();

class AppStore {
	players = $state<Player[]>(initial.players);
	allPlayers = $state<Player[]>(initial.allPlayers);
	selectedPlayers = $state<Player[]>(initial.selectedPlayers);
	teamA = $state<Player[]>(initial.teamA);
	teamB = $state<Player[]>(initial.teamB);
	matchHistory = $state<Match[]>(initial.matchHistory);
	debugInfo = $state<SelectionStats | null>(null);
	showAbout = $state(false);

	private save() {
		persist({
			players: this.players,
			allPlayers: this.allPlayers,
			selectedPlayers: this.selectedPlayers,
			teamA: this.teamA,
			teamB: this.teamB,
			matchHistory: this.matchHistory
		});
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
		this.players = [];
		this.allPlayers = [];
		this.selectedPlayers = [];
		this.teamA = [];
		this.teamB = [];
		this.matchHistory = [];
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

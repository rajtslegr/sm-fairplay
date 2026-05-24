export interface Player {
	name: string;
	goals: number;
	assists: number;
	points: number;
	matches: number;
	goalsPerMatch: number;
	assistsPerMatch: number;
	pointsPerMatch: number;
}

export interface Match {
	date: Date;
	opponent: string;
	team1Goals: number;
	team2Goals: number;
	team1Players?: string[];
	team2Players?: string[];
}

export interface ParsedData {
	players: Player[];
	matches: Match[];
}

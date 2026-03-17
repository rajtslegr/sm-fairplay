/* eslint-disable @typescript-eslint/no-use-before-define */
import { PLAYER_SCORE_WEIGHTS, PLAYER_NAME_MAPPING } from './constants';
import { Match, Player } from './xlsxParser';

export interface PlayerScoreBreakdown {
  name: string;
  goalsContribution: number;
  assistsContribution: number;
  pointsContribution: number;
  totalScore: number;
  goalsPerMatch: number;
  assistsPerMatch: number;
  pointsPerMatch: number;
}

export interface TeamStats {
  players: PlayerScoreBreakdown[];
  totalScore: number;
  averageSkill: number;
  playerCount: number;
  synergy?: number;
  synergyDetails?: SynergyPairDetail[];
}

export interface SynergyPairDetail {
  player1: string;
  player2: string;
  gamesTogether: number;
  winsTogether: number;
  lossesTogether: number;
  winRate: number;
  lossRate: number;
  contribution: number;
}

export interface CombinationAttempt {
  teamA: string[];
  teamB: string[];
  teamAScore: number;
  teamBScore: number;
  skillDifference: number;
  teamASynergy: number;
  teamBSynergy: number;
  synergyDiff: number;
  normalizedSkillDiff: number;
  normalizedSynergyDiff: number;
  combinedScore: number;
  isBest: boolean;
}

export interface MatchHistoryStats {
  totalMatches: number;
  matchesWithPlayerData: number;
  uniquePlayerPairs: number;
}

export interface SelectionStats {
  algorithm: 'skill-only' | 'skill-and-synergy';
  weights: typeof PLAYER_SCORE_WEIGHTS;
  sortedPlayers: PlayerScoreBreakdown[];
  teamA: TeamStats;
  teamB: TeamStats;
  combinationsTried: number;
  bestCombinationIndex: number;
  topCombinations: CombinationAttempt[];
  skillWeight: number;
  synergyWeight: number;
  matchHistoryStats?: MatchHistoryStats;
}

export const calculatePlayerScoreBreakdown = (
  player: Player,
): PlayerScoreBreakdown => {
  const { goalWeight, assistWeight, pointWeight } = PLAYER_SCORE_WEIGHTS;

  const goalsContribution = player.goalsPerMatch * goalWeight;
  const assistsContribution = player.assistsPerMatch * assistWeight;
  const pointsContribution = player.pointsPerMatch * pointWeight;

  return {
    name: player.name,
    goalsContribution,
    assistsContribution,
    pointsContribution,
    totalScore: goalsContribution + assistsContribution + pointsContribution,
    goalsPerMatch: player.goalsPerMatch,
    assistsPerMatch: player.assistsPerMatch,
    pointsPerMatch: player.pointsPerMatch,
  };
};

interface SynergyCache {
  pairWins: Map<string, number>;
  pairLosses: Map<string, number>;
  pairGames: Map<string, number>;
}

const getPlayerPairKey = (name1: string, name2: string): string => {
  return [name1, name2].sort().join('|');
};

const normalizePlayerName = (name: string): string => {
  const trimmed = name.trim();
  return PLAYER_NAME_MAPPING[trimmed] ?? trimmed;
};

const shouldUseTotalScore = (teamA: Player[], teamB: Player[]): boolean => {
  const maxSize = Math.max(teamA.length, teamB.length);
  const sizeDiff = Math.abs(teamA.length - teamB.length);

  // For 3v4 (max 4 players, diff of 1), use total score
  // For 5v4 and higher, use average per player
  return maxSize <= 4 && sizeDiff === 1;
};

const buildSynergyCache = (matchHistory: Match[]): SynergyCache => {
  const pairWins = new Map<string, number>();
  const pairLosses = new Map<string, number>();
  const pairGames = new Map<string, number>();

  matchHistory.forEach((match) => {
    const team1Players = match.team1Players ?? [];
    const team2Players = match.team2Players ?? [];

    const team1Won = match.team1Goals > match.team2Goals;
    const team2Won = match.team2Goals > match.team1Goals;

    team1Players.forEach((p1, i) => {
      team1Players.slice(i + 1).forEach((p2) => {
        const name1 = normalizePlayerName(p1);
        const name2 = normalizePlayerName(p2);
        const key = getPlayerPairKey(name1, name2);
        pairGames.set(key, (pairGames.get(key) ?? 0) + 1);
        if (team1Won) {
          pairWins.set(key, (pairWins.get(key) ?? 0) + 1);
        } else if (team2Won) {
          pairLosses.set(key, (pairLosses.get(key) ?? 0) + 1);
        }
      });
    });

    team2Players.forEach((p1, i) => {
      team2Players.slice(i + 1).forEach((p2) => {
        const name1 = normalizePlayerName(p1);
        const name2 = normalizePlayerName(p2);
        const key = getPlayerPairKey(name1, name2);
        pairGames.set(key, (pairGames.get(key) ?? 0) + 1);
        if (team2Won) {
          pairWins.set(key, (pairWins.get(key) ?? 0) + 1);
        } else if (team1Won) {
          pairLosses.set(key, (pairLosses.get(key) ?? 0) + 1);
        }
      });
    });
  });

  return { pairWins, pairLosses, pairGames };
};

const calculateTeamSynergyWithDetails = (
  team: Player[],
  cache: SynergyCache,
): { synergy: number; details: SynergyPairDetail[] } => {
  let totalSynergy = 0;
  let pairCount = 0;
  const details: SynergyPairDetail[] = [];

  for (let i = 0; i < team.length; i += 1) {
    for (let j = i + 1; j < team.length; j += 1) {
      const player1Name = normalizePlayerName(team[i].name);
      const player2Name = normalizePlayerName(team[j].name);
      const key = getPlayerPairKey(player1Name, player2Name);
      const games = cache.pairGames.get(key) ?? 0;
      const wins = cache.pairWins.get(key) ?? 0;
      const losses = cache.pairLosses.get(key) ?? 0;
      const decisiveGames = wins + losses;

      const winRate = decisiveGames > 0 ? wins / decisiveGames : 0;
      const lossRate = decisiveGames > 0 ? losses / decisiveGames : 0;
      const contribution = decisiveGames > 0 ? winRate - lossRate : 0;

      if (games > 0) {
        totalSynergy += contribution;
        pairCount += 1;
      }

      details.push({
        player1: team[i].name,
        player2: team[j].name,
        gamesTogether: games,
        winsTogether: wins,
        lossesTogether: losses,
        winRate,
        lossRate,
        contribution,
      });
    }
  }

  return {
    synergy: pairCount === 0 ? 0 : totalSynergy / pairCount,
    details,
  };
};

const calculateMatchHistoryStats = (
  matchHistory: Match[],
): MatchHistoryStats => {
  const matchesWithPlayerData = matchHistory.filter(
    (m) =>
      (m.team1Players && m.team1Players.length > 0) ||
      (m.team2Players && m.team2Players.length > 0),
  );

  const cache = buildSynergyCache(matchHistory);
  const uniquePlayerPairs = cache.pairGames.size;

  return {
    totalMatches: matchHistory.length,
    matchesWithPlayerData: matchesWithPlayerData.length,
    uniquePlayerPairs,
  };
};

export const selectTeamsWithStats = (
  players: Player[],
  matchHistory: Match[] = [],
): { teams: [Player[], Player[]]; debugInfo: SelectionStats } => {
  const hasPlayerData = matchHistory.some(
    (m) =>
      (m.team1Players && m.team1Players.length > 0) ||
      (m.team2Players && m.team2Players.length > 0),
  );

  const sortedPlayers = [...players]
    .map(calculatePlayerScoreBreakdown)
    .sort((a, b) => b.totalScore - a.totalScore);

  const matchHistoryStats = calculateMatchHistoryStats(matchHistory);

  if (matchHistory.length === 0 || !hasPlayerData) {
    const result = selectTeamsWithoutHistoryWithDebug(players);
    return {
      teams: result.teams,
      debugInfo: {
        ...result.debugInfo,
        sortedPlayers,
        algorithm: 'skill-only',
        matchHistoryStats,
      },
    };
  }

  const result = selectTeamsWithHistoryWithDebug(players, matchHistory);
  return {
    teams: result.teams,
    debugInfo: {
      ...result.debugInfo,
      sortedPlayers,
      algorithm: 'skill-and-synergy',
      matchHistoryStats,
    },
  };
};

const selectTeamsWithoutHistoryWithDebug = (
  players: Player[],
): {
  teams: [Player[], Player[]];
  debugInfo: Omit<
    SelectionStats,
    'sortedPlayers' | 'algorithm' | 'matchHistoryStats'
  >;
} => {
  const sortedPlayers = [...players].sort(
    (a, b) =>
      calculatePlayerScoreBreakdown(b).totalScore -
      calculatePlayerScoreBreakdown(a).totalScore,
  );

  let bestTeamA: Player[] = [];
  let bestTeamB: Player[] = [];
  let minScoreDifference = Infinity;

  const combinations: CombinationAttempt[] = [];
  let combinationsTried = 0;

  const generateCombinations = (
    remainingPlayers: Player[],
    teamA: Player[],
    teamB: Player[],
  ) => {
    if (remainingPlayers.length === 0) {
      const teamAScore = teamA.reduce(
        (sum, p) => sum + calculatePlayerScoreBreakdown(p).totalScore,
        0,
      );
      const teamBScore = teamB.reduce(
        (sum, p) => sum + calculatePlayerScoreBreakdown(p).totalScore,
        0,
      );

      const useTotalScore = shouldUseTotalScore(teamA, teamB);
      let scoreA: number;
      let scoreB: number;
      if (useTotalScore) {
        scoreA = teamAScore;
        scoreB = teamBScore;
      } else {
        scoreA = teamA.length > 0 ? teamAScore / teamA.length : 0;
        scoreB = teamB.length > 0 ? teamBScore / teamB.length : 0;
      }
      const skillDifference = Math.abs(scoreA - scoreB);

      const isValid =
        skillDifference < minScoreDifference &&
        Math.abs(teamA.length - teamB.length) <= 1;

      if (isValid) {
        minScoreDifference = skillDifference;
        bestTeamA = [...teamA];
        bestTeamB = [...teamB];
      }

      combinations.push({
        teamA: teamA.map((p) => p.name),
        teamB: teamB.map((p) => p.name),
        teamAScore,
        teamBScore,
        skillDifference,
        teamASynergy: 0,
        teamBSynergy: 0,
        synergyDiff: 0,
        normalizedSkillDiff: 0,
        normalizedSynergyDiff: 0,
        combinedScore: skillDifference,
        isBest: isValid,
      });

      combinationsTried += 1;
      return;
    }

    const player = remainingPlayers[0];
    const newRemainingPlayers = remainingPlayers.slice(1);

    if (teamA.length < Math.ceil(players.length / 2)) {
      generateCombinations(newRemainingPlayers, [...teamA, player], teamB);
    }

    if (teamB.length < Math.ceil(players.length / 2)) {
      generateCombinations(newRemainingPlayers, teamA, [...teamB, player]);
    }
  };

  generateCombinations(sortedPlayers, [], []);

  const sortedCombinations = combinations
    .sort((a, b) => a.skillDifference - b.skillDifference)
    .slice(0, 10);

  const teamADebug: TeamStats = {
    players: bestTeamA.map(calculatePlayerScoreBreakdown),
    totalScore: bestTeamA.reduce(
      (sum, p) => sum + calculatePlayerScoreBreakdown(p).totalScore,
      0,
    ),
    averageSkill:
      bestTeamA.reduce(
        (sum, p) => sum + calculatePlayerScoreBreakdown(p).totalScore,
        0,
      ) / (bestTeamA.length || 1),
    playerCount: bestTeamA.length,
  };

  const teamBDebug: TeamStats = {
    players: bestTeamB.map(calculatePlayerScoreBreakdown),
    totalScore: bestTeamB.reduce(
      (sum, p) => sum + calculatePlayerScoreBreakdown(p).totalScore,
      0,
    ),
    averageSkill:
      bestTeamB.reduce(
        (sum, p) => sum + calculatePlayerScoreBreakdown(p).totalScore,
        0,
      ) / (bestTeamB.length || 1),
    playerCount: bestTeamB.length,
  };

  return {
    teams: [bestTeamA, bestTeamB],
    debugInfo: {
      weights: PLAYER_SCORE_WEIGHTS,
      teamA: teamADebug,
      teamB: teamBDebug,
      combinationsTried,
      bestCombinationIndex: combinations.findIndex((c) => c.isBest),
      topCombinations: sortedCombinations,
      skillWeight: 1,
      synergyWeight: 0,
    },
  };
};

const selectTeamsWithHistoryWithDebug = (
  players: Player[],
  matchHistory: Match[],
): {
  teams: [Player[], Player[]];
  debugInfo: Omit<
    SelectionStats,
    'sortedPlayers' | 'algorithm' | 'matchHistoryStats'
  >;
} => {
  const cache = buildSynergyCache(matchHistory);
  const sortedPlayers = [...players].sort(
    (a, b) =>
      calculatePlayerScoreBreakdown(b).totalScore -
      calculatePlayerScoreBreakdown(a).totalScore,
  );

  let bestTeamA: Player[] = [];
  let bestTeamB: Player[] = [];
  let bestScore = Infinity;

  const combinations: CombinationAttempt[] = [];
  let combinationsTried = 0;

  const maxPlayerScore = calculatePlayerScoreBreakdown(
    sortedPlayers[0],
  ).totalScore;

  const generateCombinations = (
    remainingPlayers: Player[],
    teamA: Player[],
    teamB: Player[],
  ) => {
    if (remainingPlayers.length === 0) {
      if (Math.abs(teamA.length - teamB.length) > 1) return;

      const teamAScore = teamA.reduce(
        (sum, p) => sum + calculatePlayerScoreBreakdown(p).totalScore,
        0,
      );
      const teamBScore = teamB.reduce(
        (sum, p) => sum + calculatePlayerScoreBreakdown(p).totalScore,
        0,
      );

      // For 3v4 prioritize total score (90% skill), for 5v4+ use 55/45 split
      const useTotalScore = shouldUseTotalScore(teamA, teamB);
      const skillWeight = useTotalScore ? 0.9 : 0.55;
      const synergyWeight = useTotalScore ? 0.1 : 0.45;

      let scoreA: number;
      let scoreB: number;
      if (useTotalScore) {
        scoreA = teamAScore;
        scoreB = teamBScore;
      } else {
        scoreA = teamA.length > 0 ? teamAScore / teamA.length : 0;
        scoreB = teamB.length > 0 ? teamBScore / teamB.length : 0;
      }
      const skillDiff = Math.abs(scoreA - scoreB);

      const teamASynergy = calculateTeamSynergyWithDetails(
        teamA,
        cache,
      ).synergy;
      const teamBSynergy = calculateTeamSynergyWithDetails(
        teamB,
        cache,
      ).synergy;

      const synergyDiff = Math.abs(teamASynergy - teamBSynergy);

      const normalizedSkillDiff =
        maxPlayerScore > 0 ? skillDiff / maxPlayerScore : 0;

      const maxPossibleSynergyDiff = 2;
      const normalizedSynergyDiff = synergyDiff / maxPossibleSynergyDiff;

      const combinedScore =
        skillWeight * normalizedSkillDiff +
        synergyWeight * normalizedSynergyDiff;

      const isBest = combinedScore < bestScore;

      if (isBest) {
        bestScore = combinedScore;
        bestTeamA = [...teamA];
        bestTeamB = [...teamB];
      }

      combinations.push({
        teamA: teamA.map((p) => p.name),
        teamB: teamB.map((p) => p.name),
        teamAScore,
        teamBScore,
        skillDifference: skillDiff,
        teamASynergy,
        teamBSynergy,
        synergyDiff,
        normalizedSkillDiff,
        normalizedSynergyDiff,
        combinedScore,
        isBest,
      });

      combinationsTried += 1;
      return;
    }

    const player = remainingPlayers[0];
    const newRemainingPlayers = remainingPlayers.slice(1);

    if (teamA.length < Math.ceil(players.length / 2)) {
      generateCombinations(newRemainingPlayers, [...teamA, player], teamB);
    }

    if (teamB.length < Math.ceil(players.length / 2)) {
      generateCombinations(newRemainingPlayers, teamA, [...teamB, player]);
    }
  };

  generateCombinations(sortedPlayers, [], []);

  const sortedCombinations = combinations
    .sort((a, b) => a.combinedScore - b.combinedScore)
    .slice(0, 10);

  const teamASynergyData = calculateTeamSynergyWithDetails(bestTeamA, cache);
  const teamBSynergyData = calculateTeamSynergyWithDetails(bestTeamB, cache);

  const teamADebug: TeamStats = {
    players: bestTeamA.map(calculatePlayerScoreBreakdown),
    totalScore: bestTeamA.reduce(
      (sum, p) => sum + calculatePlayerScoreBreakdown(p).totalScore,
      0,
    ),
    averageSkill:
      bestTeamA.reduce(
        (sum, p) => sum + calculatePlayerScoreBreakdown(p).totalScore,
        0,
      ) / (bestTeamA.length || 1),
    playerCount: bestTeamA.length,
    synergy: teamASynergyData.synergy,
    synergyDetails: teamASynergyData.details,
  };

  const teamBDebug: TeamStats = {
    players: bestTeamB.map(calculatePlayerScoreBreakdown),
    totalScore: bestTeamB.reduce(
      (sum, p) => sum + calculatePlayerScoreBreakdown(p).totalScore,
      0,
    ),
    averageSkill:
      bestTeamB.reduce(
        (sum, p) => sum + calculatePlayerScoreBreakdown(p).totalScore,
        0,
      ) / (bestTeamB.length || 1),
    playerCount: bestTeamB.length,
    synergy: teamBSynergyData.synergy,
    synergyDetails: teamBSynergyData.details,
  };

  // Determine weights used for the best teams
  const bestTeamsUseTotalScore = shouldUseTotalScore(bestTeamA, bestTeamB);
  const finalSkillWeight = bestTeamsUseTotalScore ? 0.9 : 0.55;
  const finalSynergyWeight = bestTeamsUseTotalScore ? 0.1 : 0.45;

  return {
    teams: [bestTeamA, bestTeamB],
    debugInfo: {
      weights: PLAYER_SCORE_WEIGHTS,
      teamA: teamADebug,
      teamB: teamBDebug,
      combinationsTried,
      bestCombinationIndex: combinations.findIndex((c) => c.isBest),
      topCombinations: sortedCombinations,
      skillWeight: finalSkillWeight,
      synergyWeight: finalSynergyWeight,
    },
  };
};

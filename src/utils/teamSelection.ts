import { PLAYER_SCORE_WEIGHTS } from './constants';
import { Match, Player } from './xlsxParser';

export const calculatePlayerScore = (player: Player): number => {
  const { goalWeight, assistWeight, pointWeight } = PLAYER_SCORE_WEIGHTS;

  return (
    player.goalsPerMatch * goalWeight +
    player.assistsPerMatch * assistWeight +
    player.pointsPerMatch * pointWeight
  );
};

const shouldUseTotalScore = (teamA: Player[], teamB: Player[]): boolean => {
  const maxSize = Math.max(teamA.length, teamB.length);
  const sizeDiff = Math.abs(teamA.length - teamB.length);

  // For 3v4 (max 4 players, diff of 1), use total score
  // For 5v4 and higher, use average per player
  return maxSize <= 4 && sizeDiff === 1;
};

export const calculateTeamScore = (team: Player[]): number =>
  team.reduce((sum, player) => sum + calculatePlayerScore(player), 0);

interface SynergyCache {
  pairWins: Map<string, number>;
  pairLosses: Map<string, number>;
  pairGames: Map<string, number>;
}

const getPlayerPairKey = (name1: string, name2: string): string => {
  return [name1, name2].sort().join('|');
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
        const key = getPlayerPairKey(p1, p2);
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
        const key = getPlayerPairKey(p1, p2);
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

const calculateTeamSynergy = (team: Player[], cache: SynergyCache): number => {
  let totalSynergy = 0;
  let pairCount = 0;

  for (let i = 0; i < team.length; i += 1) {
    for (let j = i + 1; j < team.length; j += 1) {
      const key = getPlayerPairKey(team[i].name, team[j].name);
      const wins = cache.pairWins.get(key) ?? 0;
      const losses = cache.pairLosses.get(key) ?? 0;
      const decisiveGames = wins + losses;

      if (decisiveGames > 0) {
        const winRate = wins / decisiveGames;
        const lossRate = losses / decisiveGames;
        totalSynergy += winRate - lossRate;
        pairCount += 1;
      }
    }
  }

  if (pairCount === 0) return 0;

  return totalSynergy / pairCount;
};

const selectTeamsWithoutHistory = (players: Player[]): [Player[], Player[]] => {
  const sortedPlayers = [...players].sort(
    (a, b) => calculatePlayerScore(b) - calculatePlayerScore(a),
  );

  let bestTeamA: Player[] = [];
  let bestTeamB: Player[] = [];
  let minScoreDifference = Infinity;

  const generateCombinations = (
    remainingPlayers: Player[],
    teamA: Player[],
    teamB: Player[],
  ) => {
    if (remainingPlayers.length === 0) {
      const teamAScore = calculateTeamScore(teamA);
      const teamBScore = calculateTeamScore(teamB);

      // For 3v4 use total score, for 5v4+ use average per player
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
      const scoreDifference = Math.abs(scoreA - scoreB);

      if (
        scoreDifference < minScoreDifference &&
        Math.abs(teamA.length - teamB.length) <= 1
      ) {
        minScoreDifference = scoreDifference;
        bestTeamA = [...teamA];
        bestTeamB = [...teamB];
      }
      return;
    }

    const player = remainingPlayers[0];
    const newRemainingPlayers = remainingPlayers.slice(1);

    // Try adding to team A if there's room
    if (teamA.length < Math.ceil(players.length / 2)) {
      generateCombinations(newRemainingPlayers, [...teamA, player], teamB);
    }

    // Try adding to team B if there's room
    if (teamB.length < Math.ceil(players.length / 2)) {
      generateCombinations(newRemainingPlayers, teamA, [...teamB, player]);
    }
  };

  generateCombinations(sortedPlayers, [], []);

  return [bestTeamA, bestTeamB];
};

const selectTeamsWithHistory = (
  players: Player[],
  matchHistory: Match[],
): [Player[], Player[]] => {
  const cache = buildSynergyCache(matchHistory);
  const sortedPlayers = [...players].sort(
    (a, b) => calculatePlayerScore(b) - calculatePlayerScore(a),
  );

  let bestTeamA: Player[] = [];
  let bestTeamB: Player[] = [];
  let bestScore = Infinity;

  const generateCombinations = (
    remainingPlayers: Player[],
    teamA: Player[],
    teamB: Player[],
  ) => {
    if (remainingPlayers.length === 0) {
      if (Math.abs(teamA.length - teamB.length) > 1) return;

      const teamAScore = teamA.reduce(
        (sum, p) => sum + calculatePlayerScore(p),
        0,
      );
      const teamBScore = teamB.reduce(
        (sum, p) => sum + calculatePlayerScore(p),
        0,
      );

      // For 3v4 prioritize total score (90% skill), for 5v4+ use 55/45 split
      const useTotalScore = shouldUseTotalScore(teamA, teamB);
      const SKILL_WEIGHT = useTotalScore ? 0.9 : 0.55;
      const SYNERGY_WEIGHT = useTotalScore ? 0.1 : 0.45;

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

      const teamASynergy = calculateTeamSynergy(teamA, cache);
      const teamBSynergy = calculateTeamSynergy(teamB, cache);

      const synergyDiff = Math.abs(teamASynergy - teamBSynergy);

      const maxPlayerScore = calculatePlayerScore(sortedPlayers[0]);
      const normalizedSkillDiff =
        maxPlayerScore > 0 ? skillDiff / maxPlayerScore : 0;

      const maxPossibleSynergyDiff = 2;
      const normalizedSynergyDiff = synergyDiff / maxPossibleSynergyDiff;

      const combinedScore =
        SKILL_WEIGHT * normalizedSkillDiff +
        SYNERGY_WEIGHT * normalizedSynergyDiff;

      if (combinedScore < bestScore) {
        bestScore = combinedScore;
        bestTeamA = [...teamA];
        bestTeamB = [...teamB];
      }
      return;
    }

    const player = remainingPlayers[0];
    const newRemainingPlayers = remainingPlayers.slice(1);

    // Try adding to team A if there's room
    if (teamA.length < Math.ceil(players.length / 2)) {
      generateCombinations(newRemainingPlayers, [...teamA, player], teamB);
    }

    // Try adding to team B if there's room
    if (teamB.length < Math.ceil(players.length / 2)) {
      generateCombinations(newRemainingPlayers, teamA, [...teamB, player]);
    }
  };

  generateCombinations(sortedPlayers, [], []);

  return [bestTeamA, bestTeamB];
};

export const selectTeams = (
  players: Player[],
  matchHistory: Match[] = [],
): [Player[], Player[]] => {
  if (matchHistory.length === 0) {
    return selectTeamsWithoutHistory(players);
  }

  const hasPlayerData = matchHistory.some(
    (m) =>
      (m.team1Players && m.team1Players.length > 0) ||
      (m.team2Players && m.team2Players.length > 0),
  );

  if (!hasPlayerData) {
    return selectTeamsWithoutHistory(players);
  }

  return selectTeamsWithHistory(players, matchHistory);
};

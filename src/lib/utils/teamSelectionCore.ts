import {
  MAX_SYNERGY_DIFF,
  NEAR_OPTIMAL_SCORE_TOLERANCE,
  PLAYER_NAME_MAPPING,
  PLAYER_SCORE_WEIGHTS,
  SKILL_ONLY_WEIGHTS,
  SMALL_TEAM_MAX_SIZE,
  SYNERGY_SMOOTHING_GAMES,
  TEAM_BALANCE_WEIGHTS,
  TOP_COMBINATIONS_LIMIT,
} from './constants';
import type { Match, Player } from './types';

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

export interface TeamStats {
  players: PlayerScoreBreakdown[];
  totalScore: number;
  averageSkill: number;
  playerCount: number;
  synergy?: number;
  synergyDetails?: SynergyPairDetail[];
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

export interface TeamSelectionOptions {
  random?: () => number;
}

export interface TeamSelectionResult {
  teams: [Player[], Player[]];
  debugInfo: SelectionStats;
}

export const normalizePlayerName = (name: string): string => {
  const trimmed = name.trim();
  return PLAYER_NAME_MAPPING[trimmed] ?? trimmed;
};

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

export const calculatePlayerScore = (player: Player): number =>
  calculatePlayerScoreBreakdown(player).totalScore;

export const calculateTeamScore = (team: Player[]): number =>
  team.reduce((sum, player) => sum + calculatePlayerScore(player), 0);

interface PairRecord {
  wins: number;
  losses: number;
  games: number;
}

type PairRecords = Map<string, PairRecord>;

const getPairKey = (name1: string, name2: string): string =>
  [name1, name2].sort().join('|');

const recordPairs = (
  players: string[],
  won: boolean,
  pairs: PairRecords,
): void => {
  players.forEach((player1, index) => {
    players.slice(index + 1).forEach((player2) => {
      const key = getPairKey(
        normalizePlayerName(player1),
        normalizePlayerName(player2),
      );
      const record = pairs.get(key) ?? { wins: 0, losses: 0, games: 0 };
      record.games += 1;
      if (won) record.wins += 1;
      else record.losses += 1;
      pairs.set(key, record);
    });
  });
};

const buildPairRecords = (history: Match[]): PairRecords => {
  const pairs: PairRecords = new Map();
  history.forEach((match) => {
    const team1Won = match.team1Goals > match.team2Goals;
    const team2Won = match.team2Goals > match.team1Goals;
    if (!team1Won && !team2Won) return;
    recordPairs(match.team1Players ?? [], team1Won, pairs);
    recordPairs(match.team2Players ?? [], team2Won, pairs);
  });
  return pairs;
};

const pairContribution = ({ wins, losses }: PairRecord): number =>
  (wins - losses) / (wins + losses + SYNERGY_SMOOTHING_GAMES);

const teamSynergy = (names: string[], pairs: PairRecords): number => {
  let total = 0;
  let knownPairs = 0;
  for (let i = 0; i < names.length; i += 1) {
    for (let j = i + 1; j < names.length; j += 1) {
      const record = pairs.get(getPairKey(names[i], names[j]));
      if (record) {
        total += pairContribution(record);
        knownPairs += 1;
      }
    }
  }
  return knownPairs ? total / knownPairs : 0;
};

const teamSynergyData = (team: Player[], pairs: PairRecords) => {
  const details: SynergyPairDetail[] = [];
  for (let i = 0; i < team.length; i += 1) {
    for (let j = i + 1; j < team.length; j += 1) {
      const key = getPairKey(
        normalizePlayerName(team[i].name),
        normalizePlayerName(team[j].name),
      );
      const record = pairs.get(key) ?? { wins: 0, losses: 0, games: 0 };
      const decisiveGames = record.wins + record.losses;
      details.push({
        player1: team[i].name,
        player2: team[j].name,
        gamesTogether: record.games,
        winsTogether: record.wins,
        lossesTogether: record.losses,
        winRate: decisiveGames ? record.wins / decisiveGames : 0,
        lossRate: decisiveGames ? record.losses / decisiveGames : 0,
        contribution: pairContribution(record),
      });
    }
  }
  return {
    synergy: teamSynergy(
      team.map((player) => normalizePlayerName(player.name)),
      pairs,
    ),
    details,
  };
};

interface TeamSizes {
  larger: number;
  smaller: number;
}

const getTeamSizes = (count: number): TeamSizes => ({
  larger: Math.ceil(count / 2),
  smaller: Math.floor(count / 2),
});

const isSmallUneven = ({ larger, smaller }: TeamSizes): boolean =>
  larger !== smaller && larger <= SMALL_TEAM_MAX_SIZE;

interface SearchContext {
  players: Player[];
  scores: number[];
  suffixScores: number[];
  normalizedNames: string[];
  pairs: PairRecords;
  weights: { skillWeight: number; synergyWeight: number };
  sizes: TeamSizes;
  useTotalScore: boolean;
  grandTotalScore: number;
}

const buildSearchContext = (
  players: Player[],
  pairs: PairRecords,
  weights: { skillWeight: number; synergyWeight: number },
  sizes: TeamSizes,
): SearchContext => {
  const sorted = [...players].sort(
    (a, b) => calculatePlayerScore(b) - calculatePlayerScore(a),
  );
  const scores = sorted.map(calculatePlayerScore);
  const suffixScores = new Array<number>(scores.length + 1).fill(0);
  for (let i = scores.length - 1; i >= 0; i -= 1) {
    suffixScores[i] = suffixScores[i + 1] + scores[i];
  }
  return {
    players: sorted,
    scores,
    suffixScores,
    normalizedNames: sorted.map((player) => normalizePlayerName(player.name)),
    pairs,
    weights,
    sizes,
    useTotalScore: isSmallUneven(sizes),
    grandTotalScore: suffixScores[0],
  };
};

interface CombinationCollector {
  insert: (attempt: CombinationAttempt) => void;
  worstScore: () => number;
  items: () => CombinationAttempt[];
}

const createCollector = (limit: number): CombinationCollector => {
  const kept: CombinationAttempt[] = [];
  const insert = (attempt: CombinationAttempt): void => {
    let index = kept.length;
    while (index > 0 && kept[index - 1].combinedScore > attempt.combinedScore)
      index -= 1;
    kept.splice(index, 0, attempt);
    if (kept.length > limit) kept.pop();
  };
  return {
    insert,
    worstScore: () =>
      kept.length < limit ? Infinity : kept[kept.length - 1].combinedScore,
    items: () => kept,
  };
};

const minAbsoluteOverRange = (
  start: number,
  slope: number,
  range: number,
): number => {
  const end = start + slope * range;
  return (start <= 0 && end >= 0) || (start >= 0 && end <= 0)
    ? 0
    : Math.min(Math.abs(start), Math.abs(end));
};

const lowerBoundSkillDiff = (
  context: SearchContext,
  teamAScore: number,
  teamBScore: number,
  remainingScore: number,
): number => {
  if (context.useTotalScore) {
    return minAbsoluteOverRange(
      teamAScore - teamBScore - remainingScore,
      2,
      remainingScore,
    );
  }
  const bound = (sizeA: number, sizeB: number): number =>
    minAbsoluteOverRange(
      teamAScore / sizeA - (teamBScore + remainingScore) / sizeB,
      1 / sizeA + 1 / sizeB,
      remainingScore,
    );
  const { larger, smaller } = context.sizes;
  return larger === smaller
    ? bound(larger, smaller)
    : Math.min(bound(larger, smaller), bound(smaller, larger));
};

const shouldPrune = (
  context: SearchContext,
  collector: CombinationCollector,
  teamAScore: number,
  teamBScore: number,
  remainingScore: number,
): boolean => {
  if (context.sizes.smaller === 0 || context.grandTotalScore <= 0) return false;
  const maxScoreSum = context.useTotalScore
    ? context.grandTotalScore
    : context.grandTotalScore / context.sizes.smaller;
  const bound =
    lowerBoundSkillDiff(context, teamAScore, teamBScore, remainingScore) /
    maxScoreSum;
  return context.weights.skillWeight * bound > collector.worstScore();
};

const evaluate = (
  context: SearchContext,
  teamA: number[],
  teamB: number[],
  teamAScore: number,
  teamBScore: number,
): CombinationAttempt => {
  const scoreA = context.useTotalScore
    ? teamAScore
    : teamAScore / (teamA.length || 1);
  const scoreB = context.useTotalScore
    ? teamBScore
    : teamBScore / (teamB.length || 1);
  const skillDifference = Math.abs(scoreA - scoreB);
  const scoreSum = scoreA + scoreB;
  const normalizedSkillDiff = scoreSum ? skillDifference / scoreSum : 0;
  const teamASynergy = teamSynergy(
    teamA.map((i) => context.normalizedNames[i]),
    context.pairs,
  );
  const teamBSynergy = teamSynergy(
    teamB.map((i) => context.normalizedNames[i]),
    context.pairs,
  );
  const synergyDiff = Math.abs(teamASynergy - teamBSynergy);
  const normalizedSynergyDiff = synergyDiff / MAX_SYNERGY_DIFF;
  return {
    teamA: teamA.map((i) => context.players[i].name),
    teamB: teamB.map((i) => context.players[i].name),
    teamAScore,
    teamBScore,
    skillDifference,
    teamASynergy,
    teamBSynergy,
    synergyDiff,
    normalizedSkillDiff,
    normalizedSynergyDiff,
    combinedScore:
      context.weights.skillWeight * normalizedSkillDiff +
      context.weights.synergyWeight * normalizedSynergyDiff,
    isBest: false,
  };
};

const search = (context: SearchContext) => {
  const collector = createCollector(TOP_COMBINATIONS_LIMIT);
  const teamA: number[] = [];
  const teamB: number[] = [];
  let combinationsTried = 0;
  const explore = (
    index: number,
    teamAScore: number,
    teamBScore: number,
  ): void => {
    if (index === context.players.length) {
      combinationsTried += 1;
      collector.insert(evaluate(context, teamA, teamB, teamAScore, teamBScore));
      return;
    }
    if (
      shouldPrune(
        context,
        collector,
        teamAScore,
        teamBScore,
        context.suffixScores[index],
      )
    )
      return;
    const score = context.scores[index];
    if (teamA.length < context.sizes.larger) {
      teamA.push(index);
      explore(index + 1, teamAScore + score, teamBScore);
      teamA.pop();
    }
    if (index > 0 && teamB.length < context.sizes.larger) {
      teamB.push(index);
      explore(index + 1, teamAScore, teamBScore + score);
      teamB.pop();
    }
  };
  explore(0, 0, 0);
  return { combinationsTried, topCombinations: collector.items() };
};

const buildTeamStats = (
  team: Player[],
  synergyData?: ReturnType<typeof teamSynergyData>,
): TeamStats => {
  const players = team.map(calculatePlayerScoreBreakdown);
  const totalScore = players.reduce(
    (sum, player) => sum + player.totalScore,
    0,
  );
  return {
    players,
    totalScore,
    averageSkill: totalScore / (team.length || 1),
    playerCount: team.length,
    ...(synergyData && {
      synergy: synergyData.synergy,
      synergyDetails: synergyData.details,
    }),
  };
};

const pickCombination = (
  combinations: CombinationAttempt[],
  random: () => number,
): number => {
  const bestScore = combinations[0].combinedScore;
  const candidates = combinations.filter(
    ({ combinedScore }) =>
      combinedScore <= bestScore + NEAR_OPTIMAL_SCORE_TOLERANCE,
  ).length;
  return Math.min(Math.floor(random() * candidates), candidates - 1);
};

export const selectTeamsWithStats = (
  players: Player[],
  matchHistory: Match[] = [],
  options: TeamSelectionOptions = {},
): TeamSelectionResult => {
  const pairs = buildPairRecords(matchHistory);
  const useSynergy = pairs.size > 0;
  const sizes = getTeamSizes(players.length);
  const weights = useSynergy
    ? isSmallUneven(sizes)
      ? TEAM_BALANCE_WEIGHTS.smallUnevenTeams
      : TEAM_BALANCE_WEIGHTS.standardTeams
    : SKILL_ONLY_WEIGHTS;
  const context = buildSearchContext(players, pairs, weights, sizes);
  const { combinationsTried, topCombinations } = search(context);
  const bestCombinationIndex = pickCombination(
    topCombinations,
    options.random ?? Math.random,
  );
  const chosen = topCombinations[bestCombinationIndex];
  chosen.isBest = true;
  const playersByName = new Map(players.map((player) => [player.name, player]));
  const teamA = chosen.teamA
    .map((name) => playersByName.get(name))
    .filter((player): player is Player => player !== undefined);
  const teamB = chosen.teamB
    .map((name) => playersByName.get(name))
    .filter((player): player is Player => player !== undefined);
  const matchHistoryStats: MatchHistoryStats = {
    totalMatches: matchHistory.length,
    matchesWithPlayerData: matchHistory.filter(
      (match) =>
        (match.team1Players?.length ?? 0) > 0 ||
        (match.team2Players?.length ?? 0) > 0,
    ).length,
    uniquePlayerPairs: pairs.size,
  };

  return {
    teams: [teamA, teamB],
    debugInfo: {
      algorithm: useSynergy ? 'skill-and-synergy' : 'skill-only',
      weights: PLAYER_SCORE_WEIGHTS,
      sortedPlayers: players
        .map(calculatePlayerScoreBreakdown)
        .sort((a, b) => b.totalScore - a.totalScore),
      teamA: buildTeamStats(
        teamA,
        useSynergy ? teamSynergyData(teamA, pairs) : undefined,
      ),
      teamB: buildTeamStats(
        teamB,
        useSynergy ? teamSynergyData(teamB, pairs) : undefined,
      ),
      combinationsTried,
      bestCombinationIndex,
      topCombinations: topCombinations,
      skillWeight: weights.skillWeight,
      synergyWeight: weights.synergyWeight,
      matchHistoryStats,
    },
  };
};

export const selectTeams = (
  players: Player[],
  matchHistory: Match[] = [],
  options: TeamSelectionOptions = {},
): [Player[], Player[]] =>
  selectTeamsWithStats(players, matchHistory, options).teams;

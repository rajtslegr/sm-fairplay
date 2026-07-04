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

const normalizePlayerName = (name: string): string => {
  const trimmed = name.trim();
  return PLAYER_NAME_MAPPING[trimmed] ?? trimmed;
};

const getPlayerPairKey = (name1: string, name2: string): string =>
  [name1, name2].sort().join('|');

const recordTeamPairs = (
  teamPlayers: string[],
  won: boolean,
  pairs: PairRecords,
): void => {
  teamPlayers.forEach((player1, index) => {
    teamPlayers.slice(index + 1).forEach((player2) => {
      const key = getPlayerPairKey(
        normalizePlayerName(player1),
        normalizePlayerName(player2),
      );
      const record = pairs.get(key) ?? { wins: 0, losses: 0, games: 0 };
      record.games += 1;
      if (won) {
        record.wins += 1;
      } else {
        record.losses += 1;
      }
      pairs.set(key, record);
    });
  });
};

const buildPairRecords = (matchHistory: Match[]): PairRecords => {
  const pairs: PairRecords = new Map();

  matchHistory.forEach((match) => {
    const team1Won = match.team1Goals > match.team2Goals;
    const team2Won = match.team2Goals > match.team1Goals;

    if (!team1Won && !team2Won) {
      return;
    }

    recordTeamPairs(match.team1Players ?? [], team1Won, pairs);
    recordTeamPairs(match.team2Players ?? [], team2Won, pairs);
  });

  return pairs;
};

const calculatePairContribution = ({ wins, losses }: PairRecord): number =>
  (wins - losses) / (wins + losses + SYNERGY_SMOOTHING_GAMES);

const calculateTeamSynergy = (
  normalizedNames: string[],
  pairs: PairRecords,
): number => {
  let totalContribution = 0;
  let knownPairCount = 0;

  for (let i = 0; i < normalizedNames.length; i += 1) {
    for (let j = i + 1; j < normalizedNames.length; j += 1) {
      const record = pairs.get(
        getPlayerPairKey(normalizedNames[i], normalizedNames[j]),
      );
      if (record) {
        totalContribution += calculatePairContribution(record);
        knownPairCount += 1;
      }
    }
  }

  return knownPairCount === 0 ? 0 : totalContribution / knownPairCount;
};

const buildSynergyPairDetail = (
  player1: Player,
  player2: Player,
  pairs: PairRecords,
): SynergyPairDetail => {
  const key = getPlayerPairKey(
    normalizePlayerName(player1.name),
    normalizePlayerName(player2.name),
  );
  const record = pairs.get(key) ?? { wins: 0, losses: 0, games: 0 };
  const decisiveGames = record.wins + record.losses;

  return {
    player1: player1.name,
    player2: player2.name,
    gamesTogether: record.games,
    winsTogether: record.wins,
    lossesTogether: record.losses,
    winRate: decisiveGames > 0 ? record.wins / decisiveGames : 0,
    lossRate: decisiveGames > 0 ? record.losses / decisiveGames : 0,
    contribution: calculatePairContribution(record),
  };
};

interface TeamSynergyData {
  synergy: number;
  details: SynergyPairDetail[];
}

const buildTeamSynergyData = (
  team: Player[],
  pairs: PairRecords,
): TeamSynergyData => {
  const details: SynergyPairDetail[] = [];

  for (let i = 0; i < team.length; i += 1) {
    for (let j = i + 1; j < team.length; j += 1) {
      details.push(buildSynergyPairDetail(team[i], team[j], pairs));
    }
  }

  const normalizedNames = team.map((player) =>
    normalizePlayerName(player.name),
  );

  return { synergy: calculateTeamSynergy(normalizedNames, pairs), details };
};

interface TeamSizes {
  larger: number;
  smaller: number;
}

const getFinalTeamSizes = (playerCount: number): TeamSizes => ({
  larger: Math.ceil(playerCount / 2),
  smaller: Math.floor(playerCount / 2),
});

const isSmallUnevenMatch = ({ larger, smaller }: TeamSizes): boolean =>
  larger !== smaller && larger <= SMALL_TEAM_MAX_SIZE;

interface BalanceWeights {
  skillWeight: number;
  synergyWeight: number;
}

const getBalanceWeights = (sizes: TeamSizes): BalanceWeights =>
  isSmallUnevenMatch(sizes)
    ? TEAM_BALANCE_WEIGHTS.smallUnevenTeams
    : TEAM_BALANCE_WEIGHTS.standardTeams;

interface SearchContext {
  playerCount: number;
  playerNames: string[];
  normalizedNames: string[];
  scores: number[];
  suffixScores: number[];
  pairs: PairRecords;
  weights: BalanceWeights;
  useTotalScore: boolean;
  sizes: TeamSizes;
  grandTotalScore: number;
}

interface SearchContextInput {
  players: Player[];
  pairs: PairRecords;
  weights: BalanceWeights;
  sizes: TeamSizes;
}

const buildSearchContext = ({
  players,
  pairs,
  weights,
  sizes,
}: SearchContextInput): SearchContext => {
  const sortedPlayers = [...players].sort(
    (a, b) => calculatePlayerScore(b) - calculatePlayerScore(a),
  );
  const scores = sortedPlayers.map(calculatePlayerScore);

  const suffixScores = new Array<number>(scores.length + 1).fill(0);
  for (let i = scores.length - 1; i >= 0; i -= 1) {
    suffixScores[i] = suffixScores[i + 1] + scores[i];
  }

  return {
    playerCount: sortedPlayers.length,
    playerNames: sortedPlayers.map((player) => player.name),
    normalizedNames: sortedPlayers.map((player) =>
      normalizePlayerName(player.name),
    ),
    scores,
    suffixScores,
    pairs,
    weights,
    useTotalScore: isSmallUnevenMatch(sizes),
    sizes,
    grandTotalScore: suffixScores[0],
  };
};

interface CombinationCollector {
  insert: (attempt: CombinationAttempt) => void;
  worstKeptScore: () => number;
  items: () => CombinationAttempt[];
}

const createCombinationCollector = (limit: number): CombinationCollector => {
  const kept: CombinationAttempt[] = [];

  const insert = (attempt: CombinationAttempt): void => {
    let index = kept.length;
    while (index > 0 && kept[index - 1].combinedScore > attempt.combinedScore) {
      index -= 1;
    }
    kept.splice(index, 0, attempt);
    if (kept.length > limit) {
      kept.pop();
    }
  };

  const worstKeptScore = (): number =>
    kept.length < limit ? Infinity : kept[kept.length - 1].combinedScore;

  return { insert, worstKeptScore, items: () => kept };
};

const minAbsoluteValueOverRange = (
  start: number,
  slope: number,
  range: number,
): number => {
  const end = start + slope * range;
  const crossesZero = (start <= 0 && end >= 0) || (start >= 0 && end <= 0);
  return crossesZero ? 0 : Math.min(Math.abs(start), Math.abs(end));
};

const lowerBoundSkillDiff = (
  context: SearchContext,
  teamAScore: number,
  teamBScore: number,
  remainingScore: number,
): number => {
  if (context.useTotalScore) {
    return minAbsoluteValueOverRange(
      teamAScore - teamBScore - remainingScore,
      2,
      remainingScore,
    );
  }

  const { larger, smaller } = context.sizes;
  const boundForSizes = (sizeA: number, sizeB: number): number =>
    minAbsoluteValueOverRange(
      teamAScore / sizeA - (teamBScore + remainingScore) / sizeB,
      1 / sizeA + 1 / sizeB,
      remainingScore,
    );

  if (larger === smaller) {
    return boundForSizes(larger, smaller);
  }
  return Math.min(
    boundForSizes(larger, smaller),
    boundForSizes(smaller, larger),
  );
};

const shouldPruneBranch = (
  context: SearchContext,
  collector: CombinationCollector,
  teamAScore: number,
  teamBScore: number,
  remainingScore: number,
): boolean => {
  if (context.sizes.smaller === 0 || context.grandTotalScore <= 0) {
    return false;
  }

  const maxScoreSum = context.useTotalScore
    ? context.grandTotalScore
    : context.grandTotalScore / context.sizes.smaller;
  const skillDiffBound =
    lowerBoundSkillDiff(context, teamAScore, teamBScore, remainingScore) /
    maxScoreSum;

  return (
    context.weights.skillWeight * skillDiffBound > collector.worstKeptScore()
  );
};

const averageOrZero = (total: number, count: number): number =>
  count > 0 ? total / count : 0;

const evaluateCombination = (
  context: SearchContext,
  teamAIndices: number[],
  teamBIndices: number[],
  teamAScore: number,
  teamBScore: number,
): CombinationAttempt => {
  const scoreA = context.useTotalScore
    ? teamAScore
    : averageOrZero(teamAScore, teamAIndices.length);
  const scoreB = context.useTotalScore
    ? teamBScore
    : averageOrZero(teamBScore, teamBIndices.length);

  const skillDifference = Math.abs(scoreA - scoreB);
  const scoreSum = scoreA + scoreB;
  const normalizedSkillDiff = scoreSum > 0 ? skillDifference / scoreSum : 0;

  const teamASynergy = calculateTeamSynergy(
    teamAIndices.map((index) => context.normalizedNames[index]),
    context.pairs,
  );
  const teamBSynergy = calculateTeamSynergy(
    teamBIndices.map((index) => context.normalizedNames[index]),
    context.pairs,
  );
  const synergyDiff = Math.abs(teamASynergy - teamBSynergy);
  const normalizedSynergyDiff = synergyDiff / MAX_SYNERGY_DIFF;

  const combinedScore =
    context.weights.skillWeight * normalizedSkillDiff +
    context.weights.synergyWeight * normalizedSynergyDiff;

  return {
    teamA: teamAIndices.map((index) => context.playerNames[index]),
    teamB: teamBIndices.map((index) => context.playerNames[index]),
    teamAScore,
    teamBScore,
    skillDifference,
    teamASynergy,
    teamBSynergy,
    synergyDiff,
    normalizedSkillDiff,
    normalizedSynergyDiff,
    combinedScore,
    isBest: false,
  };
};

interface SearchResult {
  combinationsTried: number;
  topCombinations: CombinationAttempt[];
}

const searchBalancedCombinations = (context: SearchContext): SearchResult => {
  const collector = createCombinationCollector(TOP_COMBINATIONS_LIMIT);
  const teamAIndices: number[] = [];
  const teamBIndices: number[] = [];
  const maxTeamSize = context.sizes.larger;
  let combinationsTried = 0;

  const explore = (
    index: number,
    teamAScore: number,
    teamBScore: number,
  ): void => {
    if (index === context.playerCount) {
      combinationsTried += 1;
      collector.insert(
        evaluateCombination(
          context,
          teamAIndices,
          teamBIndices,
          teamAScore,
          teamBScore,
        ),
      );
      return;
    }

    const remainingScore = context.suffixScores[index];
    if (
      shouldPruneBranch(
        context,
        collector,
        teamAScore,
        teamBScore,
        remainingScore,
      )
    ) {
      return;
    }

    const score = context.scores[index];

    if (teamAIndices.length < maxTeamSize) {
      teamAIndices.push(index);
      explore(index + 1, teamAScore + score, teamBScore);
      teamAIndices.pop();
    }

    // The first player always stays in team A, which skips the mirrored
    // duplicate of every partition and halves the search space.
    if (index > 0 && teamBIndices.length < maxTeamSize) {
      teamBIndices.push(index);
      explore(index + 1, teamAScore, teamBScore + score);
      teamBIndices.pop();
    }
  };

  explore(0, 0, 0);

  return { combinationsTried, topCombinations: collector.items() };
};

const pickNearOptimalCombination = (
  topCombinations: CombinationAttempt[],
  random: () => number,
): number => {
  const bestScore = topCombinations[0].combinedScore;
  const candidateCount = topCombinations.filter(
    (attempt) =>
      attempt.combinedScore <= bestScore + NEAR_OPTIMAL_SCORE_TOLERANCE,
  ).length;

  return Math.min(Math.floor(random() * candidateCount), candidateCount - 1);
};

const resolvePlayers = (
  names: string[],
  playersByName: Map<string, Player>,
): Player[] =>
  names
    .map((name) => playersByName.get(name))
    .filter((player): player is Player => player !== undefined);

const buildTeamStats = (
  team: Player[],
  synergyData?: TeamSynergyData,
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

const buildMatchHistoryStats = (
  matchHistory: Match[],
  pairs: PairRecords,
): MatchHistoryStats => ({
  totalMatches: matchHistory.length,
  matchesWithPlayerData: matchHistory.filter(
    (match) =>
      (match.team1Players?.length ?? 0) > 0 ||
      (match.team2Players?.length ?? 0) > 0,
  ).length,
  uniquePlayerPairs: pairs.size,
});

const sortPlayersByScore = (players: Player[]): PlayerScoreBreakdown[] =>
  players
    .map(calculatePlayerScoreBreakdown)
    .sort((a, b) => b.totalScore - a.totalScore);

export const selectTeamsWithStats = (
  players: Player[],
  matchHistory: Match[] = [],
  options: TeamSelectionOptions = {},
): TeamSelectionResult => {
  const random = options.random ?? Math.random;
  const pairs = buildPairRecords(matchHistory);
  const useSynergy = pairs.size > 0;

  const sizes = getFinalTeamSizes(players.length);
  const weights = useSynergy ? getBalanceWeights(sizes) : SKILL_ONLY_WEIGHTS;
  const context = buildSearchContext({ players, pairs, weights, sizes });

  const { combinationsTried, topCombinations } =
    searchBalancedCombinations(context);

  const bestCombinationIndex = pickNearOptimalCombination(
    topCombinations,
    random,
  );
  const chosen = topCombinations[bestCombinationIndex];
  chosen.isBest = true;

  const playersByName = new Map(players.map((player) => [player.name, player]));
  const teamA = resolvePlayers(chosen.teamA, playersByName);
  const teamB = resolvePlayers(chosen.teamB, playersByName);

  return {
    teams: [teamA, teamB],
    debugInfo: {
      algorithm: useSynergy ? 'skill-and-synergy' : 'skill-only',
      weights: PLAYER_SCORE_WEIGHTS,
      sortedPlayers: sortPlayersByScore(players),
      teamA: buildTeamStats(
        teamA,
        useSynergy ? buildTeamSynergyData(teamA, pairs) : undefined,
      ),
      teamB: buildTeamStats(
        teamB,
        useSynergy ? buildTeamSynergyData(teamB, pairs) : undefined,
      ),
      combinationsTried,
      bestCombinationIndex,
      topCombinations,
      skillWeight: weights.skillWeight,
      synergyWeight: weights.synergyWeight,
      matchHistoryStats: buildMatchHistoryStats(matchHistory, pairs),
    },
  };
};

export const selectTeams = (
  players: Player[],
  matchHistory: Match[] = [],
  options: TeamSelectionOptions = {},
): [Player[], Player[]] =>
  selectTeamsWithStats(players, matchHistory, options).teams;

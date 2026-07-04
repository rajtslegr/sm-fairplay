import {
  NEAR_OPTIMAL_SCORE_TOLERANCE,
  PLAYER_SCORE_WEIGHTS,
} from './constants';
import {
  calculatePlayerScore,
  calculateTeamScore,
  selectTeams,
  selectTeamsWithStats,
} from './teamSelection';
import { Match, Player } from './xlsxParser';

describe('Team Selection', () => {
  const createMockPlayer = (
    name: string,
    goalsPerMatch: number,
    assistsPerMatch: number,
    pointsPerMatch: number,
    matches: number,
  ): Player => ({
    name,
    goals: goalsPerMatch * matches,
    assists: assistsPerMatch * matches,
    points: pointsPerMatch * matches,
    matches,
    goalsPerMatch,
    assistsPerMatch,
    pointsPerMatch,
  });

  const createDecisiveMatch = (
    team1Players: string[],
    team2Players: string[],
    team1Won: boolean,
  ): Match => ({
    date: new Date(),
    opponent: 'Team 2',
    team1Goals: team1Won ? 5 : 1,
    team2Goals: team1Won ? 1 : 5,
    team1Players,
    team2Players,
  });

  const pickFirstCandidate = { random: () => 0 };

  const teamOf = (name: string, [teamA]: [Player[], Player[]]): 'A' | 'B' =>
    teamA.some((player) => player.name === name) ? 'A' : 'B';

  describe('calculatePlayerScore', () => {
    it('should calculate player score correctly', () => {
      const player = createMockPlayer('Test Player', 1, 2, 3, 10);
      const expectedScore =
        1 * PLAYER_SCORE_WEIGHTS.goalWeight +
        2 * PLAYER_SCORE_WEIGHTS.assistWeight +
        3 * PLAYER_SCORE_WEIGHTS.pointWeight;

      expect(calculatePlayerScore(player)).toBeCloseTo(expectedScore);
    });
  });

  describe('calculateTeamScore', () => {
    it('should sum the scores of all players', () => {
      const players = [
        createMockPlayer('Player 1', 1, 1, 1, 10),
        createMockPlayer('Player 2', 2, 2, 2, 10),
      ];

      expect(calculateTeamScore(players)).toBeCloseTo(
        calculatePlayerScore(players[0]) + calculatePlayerScore(players[1]),
      );
    });
  });

  describe('selectTeams', () => {
    it('should split players into two teams', () => {
      const players = [
        createMockPlayer('Player 1', 1, 1, 1, 10),
        createMockPlayer('Player 2', 2, 2, 2, 10),
        createMockPlayer('Player 3', 3, 3, 3, 10),
        createMockPlayer('Player 4', 4, 4, 4, 10),
      ];
      const [teamA, teamB] = selectTeams(players);

      expect(teamA.length + teamB.length).toBe(players.length);
      expect(Math.abs(teamA.length - teamB.length)).toBeLessThanOrEqual(1);
    });

    it('should balance teams based on player scores', () => {
      const players = [
        createMockPlayer('Player 1', 1, 1, 1, 10),
        createMockPlayer('Player 2', 2, 2, 2, 10),
        createMockPlayer('Player 3', 3, 3, 3, 10),
        createMockPlayer('Player 4', 4, 4, 4, 10),
      ];
      const [teamA, teamB] = selectTeams(players);

      expect(
        Math.abs(calculateTeamScore(teamA) - calculateTeamScore(teamB)),
      ).toBeLessThan(calculatePlayerScore(players[3]));
    });

    it('should handle an odd number of players', () => {
      const players = [
        createMockPlayer('Player 1', 1, 1, 1, 10),
        createMockPlayer('Player 2', 2, 2, 2, 10),
        createMockPlayer('Player 3', 3, 3, 3, 10),
        createMockPlayer('Player 4', 4, 4, 4, 10),
        createMockPlayer('Player 5', 5, 5, 5, 10),
      ];
      const [teamA, teamB] = selectTeams(players);

      expect(Math.abs(teamA.length - teamB.length)).toBe(1);
    });

    it('should handle empty input', () => {
      const [teamA, teamB] = selectTeams([]);

      expect(teamA).toEqual([]);
      expect(teamB).toEqual([]);
    });

    it('should handle a single player', () => {
      const players = [createMockPlayer('Player 1', 1, 1, 1, 10)];
      const [teamA, teamB] = selectTeams(players);

      expect(teamA.length + teamB.length).toBe(1);
    });

    it('should find the optimal skill split (verified against brute force)', () => {
      const goalsPerMatch = [0.5, 1.1, 1.7, 2.3, 2.9, 3.4, 3.9, 4.5];
      const players = goalsPerMatch.map((goals, index) =>
        createMockPlayer(`Player ${index}`, goals, 0, 0, 10),
      );
      const [teamA, teamB] = selectTeams(players, [], pickFirstCandidate);

      const half = players.length / 2;
      const averageDiff = Math.abs(
        calculateTeamScore(teamA) / half - calculateTeamScore(teamB) / half,
      );

      expect(averageDiff).toBeCloseTo(
        bruteForceMinAverageDiff(players.map(calculatePlayerScore)),
        8,
      );
    });

    it('should be deterministic with an injected random source', () => {
      const players = [
        createMockPlayer('Player 1', 1, 2, 3, 10),
        createMockPlayer('Player 2', 2, 1, 4, 10),
        createMockPlayer('Player 3', 3, 3, 1, 10),
        createMockPlayer('Player 4', 4, 1, 2, 10),
        createMockPlayer('Player 5', 2, 4, 3, 10),
      ];

      const firstRun = selectTeams(players, [], pickFirstCandidate);
      const secondRun = selectTeams(players, [], pickFirstCandidate);

      expect(firstRun[0].map((p) => p.name)).toEqual(
        secondRun[0].map((p) => p.name),
      );
      expect(firstRun[1].map((p) => p.name)).toEqual(
        secondRun[1].map((p) => p.name),
      );
    });
  });

  describe('selectTeams with match history', () => {
    it('should split up pairs that dominate together', () => {
      const players = [
        createMockPlayer('Player A', 2, 2, 2, 10),
        createMockPlayer('Player B', 2, 2, 2, 10),
        createMockPlayer('Player C', 2, 2, 2, 10),
        createMockPlayer('Player D', 2, 2, 2, 10),
      ];

      const matchHistory: Match[] = [
        createDecisiveMatch(
          ['Player A', 'Player B'],
          ['Player C', 'Player D'],
          true,
        ),
        createDecisiveMatch(
          ['Player A', 'Player B'],
          ['Player C', 'Player D'],
          true,
        ),
      ];

      const teams = selectTeams(players, matchHistory, pickFirstCandidate);
      const [teamA, teamB] = teams;

      expect(teamA).toHaveLength(2);
      expect(teamB).toHaveLength(2);
      expect(teamOf('Player A', teams)).not.toBe(teamOf('Player B', teams));
      expect(teamOf('Player C', teams)).not.toBe(teamOf('Player D', teams));
    });

    it('should resolve nicknames from match history to roster names', () => {
      const players = [
        createMockPlayer('Osička Jan', 2, 2, 2, 10),
        createMockPlayer('Tuček Jan', 2, 2, 2, 10),
        createMockPlayer('Frič David', 2, 2, 2, 10),
        createMockPlayer('Hurtík Milan', 2, 2, 2, 10),
      ];

      const matchHistory: Match[] = [
        createDecisiveMatch(['Honza O.', 'Honza T.'], ['David', 'Milan'], true),
        createDecisiveMatch(['Honza O.', 'Honza T.'], ['David', 'Milan'], true),
      ];

      const { teams, debugInfo } = selectTeamsWithStats(
        players,
        matchHistory,
        pickFirstCandidate,
      );

      expect(debugInfo.algorithm).toBe('skill-and-synergy');
      expect(debugInfo.matchHistoryStats?.uniquePlayerPairs).toBe(2);
      expect(teamOf('Osička Jan', teams)).not.toBe(teamOf('Tuček Jan', teams));
    });

    it('should fall back to skill-only selection when no player data in matches', () => {
      const players = [
        createMockPlayer('Player 1', 1, 1, 1, 10),
        createMockPlayer('Player 2', 2, 2, 2, 10),
        createMockPlayer('Player 3', 3, 3, 3, 10),
        createMockPlayer('Player 4', 4, 4, 4, 10),
      ];

      const matchHistory: Match[] = [
        {
          date: new Date(),
          opponent: 'Team 2',
          team1Goals: 5,
          team2Goals: 2,
        },
      ];

      const { teams, debugInfo } = selectTeamsWithStats(
        players,
        matchHistory,
        pickFirstCandidate,
      );

      expect(debugInfo.algorithm).toBe('skill-only');
      expect(
        Math.abs(calculateTeamScore(teams[0]) - calculateTeamScore(teams[1])),
      ).toBeLessThan(calculatePlayerScore(players[3]));
    });

    it('should ignore drawn matches when building synergy', () => {
      const players = [
        createMockPlayer('Player A', 2, 2, 2, 10),
        createMockPlayer('Player B', 2, 2, 2, 10),
        createMockPlayer('Player C', 2, 2, 2, 10),
        createMockPlayer('Player D', 2, 2, 2, 10),
      ];

      const matchHistory: Match[] = [
        {
          date: new Date(),
          opponent: 'Team 2',
          team1Goals: 3,
          team2Goals: 3,
          team1Players: ['Player A', 'Player B'],
          team2Players: ['Player C', 'Player D'],
        },
      ];

      const { debugInfo } = selectTeamsWithStats(
        players,
        matchHistory,
        pickFirstCandidate,
      );

      expect(debugInfo.algorithm).toBe('skill-only');
      expect(debugInfo.matchHistoryStats?.uniquePlayerPairs).toBe(0);
    });
  });

  describe('selectTeamsWithStats debug info', () => {
    const players = [
      createMockPlayer('Player 1', 1, 2, 3, 10),
      createMockPlayer('Player 2', 2, 1, 4, 10),
      createMockPlayer('Player 3', 3, 3, 1, 10),
      createMockPlayer('Player 4', 4, 1, 2, 10),
    ];

    it('should mark exactly one combination as best and point to it', () => {
      const { teams, debugInfo } = selectTeamsWithStats(
        players,
        [],
        pickFirstCandidate,
      );
      const chosen = debugInfo.topCombinations[debugInfo.bestCombinationIndex];

      expect(chosen.isBest).toBe(true);
      expect(debugInfo.topCombinations.filter((c) => c.isBest)).toHaveLength(1);
      expect([...chosen.teamA].sort()).toEqual(
        teams[0].map((p) => p.name).sort(),
      );
      expect([...chosen.teamB].sort()).toEqual(
        teams[1].map((p) => p.name).sort(),
      );
    });

    it('should evaluate each partition only once (no mirrored duplicates)', () => {
      const equalPlayers = [
        createMockPlayer('Player 1', 2, 2, 2, 10),
        createMockPlayer('Player 2', 2, 2, 2, 10),
        createMockPlayer('Player 3', 2, 2, 2, 10),
        createMockPlayer('Player 4', 2, 2, 2, 10),
      ];
      const { debugInfo } = selectTeamsWithStats(
        equalPlayers,
        [],
        pickFirstCandidate,
      );

      // 4 players, player 1 fixed in team A => C(3, 1) = 3 unique 2v2 splits
      expect(debugInfo.combinationsTried).toBe(3);
    });

    it('should only pick combinations within the near-optimal tolerance', () => {
      const pickLastCandidate = { random: () => 0.999 };
      const { debugInfo } = selectTeamsWithStats(
        players,
        [],
        pickLastCandidate,
      );
      const chosen = debugInfo.topCombinations[debugInfo.bestCombinationIndex];

      expect(chosen.combinedScore).toBeLessThanOrEqual(
        debugInfo.topCombinations[0].combinedScore +
          NEAR_OPTIMAL_SCORE_TOLERANCE,
      );
    });

    it('should stay fast for a 14-player roster', () => {
      const roster = Array.from({ length: 14 }, (_, index) =>
        createMockPlayer(
          `Player ${index}`,
          (index % 5) + index * 0.13,
          index % 3,
          index % 4,
          10,
        ),
      );
      const { teams, debugInfo } = selectTeamsWithStats(
        roster,
        [],
        pickFirstCandidate,
      );

      expect(teams[0]).toHaveLength(7);
      expect(teams[1]).toHaveLength(7);
      // C(13, 6) = 1716 canonical partitions; pruning may evaluate fewer
      expect(debugInfo.combinationsTried).toBeLessThanOrEqual(1716);
    });
  });
});

function bruteForceMinAverageDiff(scores: number[]): number {
  const half = scores.length / 2;
  let best = Infinity;

  const explore = (
    index: number,
    teamACount: number,
    teamAScore: number,
    teamBScore: number,
  ): void => {
    if (index === scores.length) {
      if (teamACount === half) {
        best = Math.min(best, Math.abs(teamAScore / half - teamBScore / half));
      }
      return;
    }
    explore(index + 1, teamACount + 1, teamAScore + scores[index], teamBScore);
    explore(index + 1, teamACount, teamAScore, teamBScore + scores[index]);
  };

  explore(0, 0, 0, 0);
  return best;
}

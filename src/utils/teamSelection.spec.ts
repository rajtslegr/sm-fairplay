import { PLAYER_SCORE_WEIGHTS } from './constants';
import { selectTeams, calculatePlayerScore } from './teamSelection';
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
      const teamAScore = teamA.reduce(
        (sum, player) => sum + calculatePlayerScore(player),
        0,
      );
      const teamBScore = teamB.reduce(
        (sum, player) => sum + calculatePlayerScore(player),
        0,
      );

      expect(Math.abs(teamAScore - teamBScore)).toBeLessThan(
        calculatePlayerScore(players[0]),
      );
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
  });

  describe('selectTeams with match history', () => {
    it('should consider synergy when match history is provided', () => {
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
          team1Goals: 5,
          team2Goals: 2,
          team1Players: ['Player A', 'Player B'],
          team2Players: ['Player C', 'Player D'],
        },
        {
          date: new Date(),
          opponent: 'Team 2',
          team1Goals: 4,
          team2Goals: 1,
          team1Players: ['Player A', 'Player B'],
          team2Players: ['Player C', 'Player D'],
        },
      ];

      const [teamA, teamB] = selectTeams(players, matchHistory);

      const teamANames = teamA.map((p) => p.name).sort();
      const teamBNames = teamB.map((p) => p.name).sort();

      const aAndBTogether =
        (teamANames.includes('Player A') && teamANames.includes('Player B')) ||
        (teamBNames.includes('Player A') && teamBNames.includes('Player B'));

      expect(aAndBTogether).toBe(true);
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

      const [teamA, teamB] = selectTeams(players, matchHistory);
      const teamAScore = teamA.reduce(
        (sum, player) => sum + calculatePlayerScore(player),
        0,
      );
      const teamBScore = teamB.reduce(
        (sum, player) => sum + calculatePlayerScore(player),
        0,
      );

      expect(Math.abs(teamAScore - teamBScore)).toBeLessThan(
        calculatePlayerScore(players[0]),
      );
    });
  });
});

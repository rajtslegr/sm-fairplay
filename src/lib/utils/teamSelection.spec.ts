import { describe, expect, it } from 'vitest';
import {
  calculatePlayerScore,
  calculateTeamScore,
  selectTeams,
  selectTeamsWithStats,
} from './teamSelection';
import type { Match, Player } from './types';

const player = (name: string, score: number): Player => ({
  name,
  goals: score,
  assists: 0,
  points: 0,
  matches: 1,
  goalsPerMatch: score,
  assistsPerMatch: 0,
  pointsPerMatch: 0,
});

const match = (team1Players: string[], team2Players: string[]): Match => ({
  date: new Date(),
  opponent: 'Team 2',
  team1Goals: 5,
  team2Goals: 1,
  team1Players,
  team2Players,
});

describe('team selection', () => {
  it('calculates weighted player and team scores', () => {
    const players = [player('A', 2), player('B', 3)];

    expect(calculatePlayerScore(players[0])).toBe(12);
    expect(calculateTeamScore(players)).toBe(30);
  });

  it('returns balanced teams and handles empty input', () => {
    const players = [
      player('A', 1),
      player('B', 2),
      player('C', 3),
      player('D', 4),
    ];
    const [teamA, teamB] = selectTeams(players, [], { random: () => 0 });

    expect(teamA.length + teamB.length).toBe(4);
    expect(
      Math.abs(calculateTeamScore(teamA) - calculateTeamScore(teamB)),
    ).toBe(0);
    expect(selectTeams([])).toEqual([[], []]);
  });

  it('uses smoothed synergy and resolves history aliases', () => {
    const players = [
      player('Osička Jan', 2),
      player('Tuček Jan', 2),
      player('Frič David', 2),
      player('Hurtík Milan', 2),
    ];
    const history = [match(['Honza O.', 'Honza T.'], ['David', 'Milan'])];
    const result = selectTeamsWithStats(players, history, { random: () => 0 });

    expect(result.debugInfo.algorithm).toBe('skill-and-synergy');
    expect(result.debugInfo.matchHistoryStats?.uniquePlayerPairs).toBe(2);
    expect(
      result.debugInfo.topCombinations.some(
        (combination) =>
          combination.teamASynergy === 1 / 3 ||
          combination.teamBSynergy === 1 / 3,
      ),
    ).toBe(true);
  });

  it('ignores draws and avoids mirrored partitions', () => {
    const players = [
      player('A', 2),
      player('B', 2),
      player('C', 2),
      player('D', 2),
    ];
    const draw: Match = {
      ...match(['A', 'B'], ['C', 'D']),
      team1Goals: 2,
      team2Goals: 2,
    };
    const result = selectTeamsWithStats(players, [draw], { random: () => 0 });

    expect(result.debugInfo.algorithm).toBe('skill-only');
    expect(result.debugInfo.matchHistoryStats?.uniquePlayerPairs).toBe(0);
    expect(result.debugInfo.combinationsTried).toBe(3);
  });
});

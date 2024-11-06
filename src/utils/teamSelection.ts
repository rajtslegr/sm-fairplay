import { PLAYER_SCORE_WEIGHTS } from './constants';
import { Player } from './xlsxParser';

export const calculatePlayerScore = (player: Player): number => {
  const { goalWeight, assistWeight, pointWeight } = PLAYER_SCORE_WEIGHTS;

  return (
    player.goalsPerMatch * goalWeight +
    player.assistsPerMatch * assistWeight +
    player.pointsPerMatch * pointWeight
  );
};

export const calculateTeamScore = (team: Player[]): number =>
  team.reduce((sum, player) => sum + calculatePlayerScore(player), 0);

export const selectTeams = (players: Player[]): [Player[], Player[]] => {
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
      const scoreDifference = Math.abs(teamAScore - teamBScore);

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

    if (
      teamA.length <= teamB.length &&
      teamA.length < Math.ceil(players.length / 2)
    ) {
      generateCombinations(newRemainingPlayers, [...teamA, player], teamB);
    }

    if (
      teamB.length <= teamA.length &&
      teamB.length < Math.ceil(players.length / 2)
    ) {
      generateCombinations(newRemainingPlayers, teamA, [...teamB, player]);
    }
  };

  generateCombinations(sortedPlayers, [], []);

  return [bestTeamA, bestTeamB];
};

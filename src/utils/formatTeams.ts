import { calculatePlayerScore } from './teamSelection';
import { Player } from './xlsxParser';

export const formatTeamsForEmail = (
  teamA: Player[],
  teamB: Player[],
  teamAScore: number,
  teamBScore: number,
): string => {
  const formatTeam = (players: Player[]): string =>
    players
      .map(
        (player) =>
          `${player.name} (Score: ${calculatePlayerScore(player).toFixed(
            2,
          )}, Goals: ${player.goalsPerMatch.toFixed(
            2,
          )}, Assists: ${player.assistsPerMatch.toFixed(
            2,
          )}, Points: ${player.pointsPerMatch.toFixed(2)})`,
      )
      .join('\n');

  return `Team A (Total Score: ${teamAScore.toFixed(2)})\n${formatTeam(
    teamA,
  )}\n\nTeam B (Total Score: ${teamBScore.toFixed(2)})\n${formatTeam(teamB)}`;
};

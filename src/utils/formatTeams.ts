import { calculatePlayerScore } from './teamSelection';
import { Player } from './xlsxParser';

export const formatTeamsForEmail = (
  teamA: Player[],
  teamB: Player[],
  teamAScore: number,
  teamBScore: number,
): string => {
  const formatPlayerStats = (player: Player): string => {
    const stats = [
      `Score: ${calculatePlayerScore(player).toFixed(2)}`,
      `Goals: ${player.goalsPerMatch.toFixed(2)}`,
      `Assists: ${player.assistsPerMatch.toFixed(2)}`,
      `Points: ${player.pointsPerMatch.toFixed(2)}`,
    ];
    return stats.join(' | ');
  };

  const formatTeam = (players: Player[]): string =>
    players
      .map((player) => `• ${player.name}\n  ${formatPlayerStats(player)}`)
      .join('\n\n');

  return `🟢 Total Score: ${teamAScore.toFixed(2)}\n\n${formatTeam(
    teamA,
  )}\n\n🔴 Total Score: ${teamBScore.toFixed(2)}\n\n${formatTeam(teamB)}`;
};

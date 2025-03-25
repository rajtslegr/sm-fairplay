import { calculatePlayerScore } from './teamSelection';
import { Player } from './xlsxParser';

export const formatTeamsForEmail = (
  teamA: Player[],
  teamB: Player[],
  teamAScore: number,
  teamBScore: number,
  teamExplanation?: string,
  playerAssessments?: Record<string, string>,
): string => {
  const formatPlayerStats = (player: Player): string => {
    const stats = [
      `Score: ${calculatePlayerScore(player).toFixed(2)}`,
      `Goals: ${player.goalsPerMatch.toFixed(2)}`,
      `Assists: ${player.assistsPerMatch.toFixed(2)}`,
      `Points: ${player.pointsPerMatch.toFixed(2)}`,
    ];

    let formattedStats = stats.join(' | ');

    if (playerAssessments && playerAssessments[player.name]) {
      formattedStats += `\n  Assessment: ${playerAssessments[player.name]}`;
    }

    return formattedStats;
  };

  const formatTeam = (players: Player[]): string =>
    players
      .map((player) => `• ${player.name}\n  ${formatPlayerStats(player)}`)
      .join('\n\n');

  let output = '';

  if (teamExplanation) {
    output += `🤖 AI TEAM SELECTION STRATEGY 🤖\n${teamExplanation}\n\n`;
  }

  output += `🟢 Total Score: ${teamAScore.toFixed(2)}\n\n${formatTeam(
    teamA,
  )}\n\n🔴 Total Score: ${teamBScore.toFixed(2)}\n\n${formatTeam(teamB)}`;

  return output;
};

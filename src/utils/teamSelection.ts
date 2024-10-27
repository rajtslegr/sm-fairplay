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

export const calculateTeamScore = (team: Player[]) =>
  team.reduce((sum, player) => sum + calculatePlayerScore(player), 0);

export const selectTeams = (players: Player[]): [Player[], Player[]] => {
  const sortedPlayers = [...players].sort(
    (a, b) => calculatePlayerScore(b) - calculatePlayerScore(a),
  );
  const teamA: Player[] = [];
  const teamB: Player[] = [];
  let teamAScore = 0;
  let teamBScore = 0;
  let teamACount = 0;
  let teamBCount = 0;

  sortedPlayers.forEach((player) => {
    const playerScore = calculatePlayerScore(player);
    if (
      teamAScore <= teamBScore ||
      (teamAScore > teamBScore && teamACount < teamBCount)
    ) {
      teamA.push(player);
      teamAScore += playerScore;
      teamACount += 1;
    } else {
      teamB.push(player);
      teamBScore += playerScore;
      teamBCount += 1;
    }
  });

  while (Math.abs(teamACount - teamBCount) > 1) {
    if (teamACount > teamBCount) {
      const player = teamA.pop();
      if (player) {
        teamB.push(player);
        teamACount -= 1;
        teamBCount += 1;
        teamAScore -= calculatePlayerScore(player);
        teamBScore += calculatePlayerScore(player);
      }
    } else {
      const player = teamB.pop();
      if (player) {
        teamA.push(player);
        teamBCount -= 1;
        teamACount += 1;
        teamBScore -= calculatePlayerScore(player);
        teamAScore += calculatePlayerScore(player);
      }
    }
  }

  return [teamA, teamB];
};

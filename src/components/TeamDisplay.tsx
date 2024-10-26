import { calculatePlayerScore } from '@utils/teamSelection';
import { Player } from '@utils/xlsxParser';

interface TeamDisplayProps {
  teamA: Player[];
  teamB: Player[];
}

const TeamDisplay: React.FC<TeamDisplayProps> = ({ teamA, teamB }) => {
  const renderPlayerStats = (player: Player) => (
    <div className="text-sm">
      <p>Goals/Match: {player.goalsPerMatch.toFixed(2)}</p>
      <p>Assists/Match: {player.assistsPerMatch.toFixed(2)}</p>
      <p>Points/Match: {player.pointsPerMatch.toFixed(2)}</p>
      <p>Player Score: {calculatePlayerScore(player).toFixed(2)}</p>
    </div>
  );

  const calculateTeamScore = (team: Player[]): number => {
    return team.reduce((sum, player) => sum + calculatePlayerScore(player), 0);
  };

  const teamAScore = calculateTeamScore(teamA);
  const teamBScore = calculateTeamScore(teamB);

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-4 flex justify-between">
        <h3 className="text-lg font-bold">
          Team A (Score: {teamAScore.toFixed(2)})
        </h3>
        <h3 className="text-lg font-bold">
          Team B (Score: {teamBScore.toFixed(2)})
        </h3>
      </div>
      <div className="flex">
        <div className="w-1/2 pr-2">
          <ul className="space-y-2">
            {teamA.map((player) => (
              <li key={player.name} className="rounded border p-2">
                <p className="font-semibold">{player.name}</p>
                {renderPlayerStats(player)}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-1/2 pl-2">
          <ul className="space-y-2">
            {teamB.map((player) => (
              <li key={player.name} className="rounded border p-2">
                <p className="font-semibold">{player.name}</p>
                {renderPlayerStats(player)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TeamDisplay;

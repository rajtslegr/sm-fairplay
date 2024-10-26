import { calculatePlayerScore } from '@utils/teamSelection';
import { Player } from '@utils/xlsxParser';

interface TeamDisplayProps {
  teamA: Player[];
  teamB: Player[];
}

const TeamDisplay = ({ teamA, teamB }: TeamDisplayProps) => {
  const renderPlayerStats = (player: Player) => (
    <div className="text-xs">
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

  const renderPlayer = (player: Player, teamColor: string) => (
    <li
      key={player.name}
      className={`hover:border-[ mb-2 overflow-hidden rounded-lg border border-solid border-transparent bg-[#1a1a1a] p-3 text-base font-medium text-gray-50 transition-colors${teamColor}]`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold">{player.name}</span>
        <span className="text-3xl">⚽</span>
      </div>
      <div className="mt-2 border-t border-gray-600 pt-2">
        {renderPlayerStats(player)}
      </div>
    </li>
  );

  return (
    <div className="w-full max-w-4xl">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="w-full sm:w-1/2">
          <h3 className="mb-4 rounded-lg bg-gradient-to-r from-[#689820] to-[#4d7118] px-4 py-2 text-lg font-bold text-white shadow-md sm:text-xl">
            Team A (Score: {teamAScore.toFixed(2)})
          </h3>
          <ul className="space-y-4">
            {teamA.map((player) => renderPlayer(player, '#689820'))}
          </ul>
        </div>
        <div className="w-full sm:w-1/2">
          <h3 className="mb-4 rounded-lg bg-gradient-to-r from-[#982020] to-[#721818] px-4 py-2 text-lg font-bold text-white shadow-md sm:text-xl">
            Team B (Score: {teamBScore.toFixed(2)})
          </h3>
          <ul className="space-y-4">
            {teamB.map((player) => renderPlayer(player, '#982020'))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TeamDisplay;

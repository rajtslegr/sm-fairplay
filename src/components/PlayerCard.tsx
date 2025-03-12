import clsx from 'clsx';

import { calculatePlayerScore } from '@utils/teamSelection';
import { Player } from '@utils/xlsxParser';

interface PlayerCardProps {
  player: Player;
  teamColor: string;
}

interface StatItemProps {
  label: string;
  value: string;
  total: number;
  color: string;
}

const StatItem = ({ label, value, total, color }: StatItemProps) => (
  <div className="flex flex-col items-center rounded-md bg-gray-800/50 p-2 text-center">
    <span className="text-xs text-gray-400">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className={clsx('text-lg font-bold', `text-[${color}]`)}>
        {value}
      </span>
      <span className="text-xs text-gray-500">/ match</span>
    </div>
    <span className="mt-1 text-xs text-gray-400">Total: {total}</span>
  </div>
);

const PlayerCard = ({ player, teamColor }: PlayerCardProps) => {
  const playerScore = calculatePlayerScore(player);

  return (
    <li className="relative mb-2 overflow-hidden rounded-lg bg-gradient-to-br from-background-card to-background-card/80 p-4 text-base shadow-md transition-all duration-300">
      <div
        className={clsx(
          'font-mono absolute right-4 top-0 flex size-12 items-center justify-center rounded-bl-lg text-lg font-bold',
          `bg-[${teamColor}]/90 text-white`,
        )}
      >
        {playerScore.toFixed(2)}
      </div>

      <div className="mb-3 pr-10">
        <h3 className="text-xl font-bold text-white">{player.name}</h3>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 border-t border-gray-700 pt-3">
        <StatItem
          label="Goals"
          value={player.goalsPerMatch.toFixed(2)}
          total={player.goals}
          color={teamColor}
        />
        <StatItem
          label="Assists"
          value={player.assistsPerMatch.toFixed(2)}
          total={player.assists}
          color={teamColor}
        />
        <StatItem
          label="Points"
          value={player.pointsPerMatch.toFixed(2)}
          total={player.points}
          color={teamColor}
        />
      </div>

      <div className="mt-3 flex items-center justify-end text-xs text-gray-400">
        <span className="mr-1">Matches:</span>
        <span className="font-medium text-gray-300">{player.matches}</span>
      </div>
    </li>
  );
};

export default PlayerCard;

import clsx from 'clsx';

import { calculatePlayerScore } from '@utils/teamSelection';
import { Player } from '@utils/xlsxParser';

interface PlayerCardProps {
  player: Player;
  teamColor: string;
}

const PlayerCard = ({ player, teamColor }: PlayerCardProps) => (
  <li
    key={player.name}
    className={clsx(
      'mb-2 overflow-hidden rounded-lg border border-solid border-transparent bg-[#1a1a1a] p-3 text-base font-medium text-gray-50 transition-colors',
      `hover:border-[${teamColor}]`,
    )}
  >
    <div className="flex items-center justify-between">
      <span className="text-xl font-bold">{player.name}</span>
      <span className="text-3xl">
        {calculatePlayerScore(player).toFixed(2)}
      </span>
    </div>
    <div className="mt-2 border-t border-gray-600 pt-2">
      <div className="text-xs">
        <p>Goals/Match: {player.goalsPerMatch.toFixed(2)}</p>
        <p>Assists/Match: {player.assistsPerMatch.toFixed(2)}</p>
        <p>Points/Match: {player.pointsPerMatch.toFixed(2)}</p>
      </div>
    </div>
  </li>
);

export default PlayerCard;

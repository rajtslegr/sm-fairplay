import clsx from 'clsx';

import { calculatePlayerScore } from '@utils/teamSelection';
import { Player } from '@utils/xlsxParser';

interface PlayerCardProps {
  player: Player;
  teamColor: string;
  assessment?: string;
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

const PlayerCard = ({ player, teamColor, assessment }: PlayerCardProps) => {
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

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-gray-400">
          <span className="mr-1">Matches:</span>
          <span className="font-medium text-gray-300">{player.matches}</span>
        </span>
      </div>

      <div className="mt-3 h-44 border-t border-gray-700 pt-3">
        {assessment ? (
          <div className="flex items-start gap-1.5">
            <svg
              className="mt-0.5 size-5 shrink-0 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="relative flex-1">
              <p className="cursor-pointer text-sm italic text-gray-400">
                {assessment}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-xs italic text-gray-500">
            No AI assessment available
          </div>
        )}
      </div>
    </li>
  );
};

export default PlayerCard;

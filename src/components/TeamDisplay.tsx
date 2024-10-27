import { useMemo } from 'react';

import PlayerCard from './PlayerCard';
import { getRandomQuote } from '@utils/onFirePlayer';
import { calculateTeamScore } from '@utils/teamSelection';
import { Player } from '@utils/xlsxParser';

interface TeamDisplayProps {
  teamA: Player[];
  teamB: Player[];
  bestPlayer: Player | null;
}

const TeamDisplay = ({ teamA, teamB, bestPlayer }: TeamDisplayProps) => {
  const [teamAScore, teamBScore] = useMemo(
    () => [calculateTeamScore(teamA), calculateTeamScore(teamB)],
    [teamA, teamB],
  );

  const onFireQuote = useMemo(() => getRandomQuote(), []);

  const switchNameOrder = (name: string) => {
    const nameParts = name.split(' ');
    return `${nameParts.pop()} ${nameParts.join(' ')}`.trim();
  };

  return (
    <div className="w-full max-w-4xl">
      {bestPlayer && (
        <div className="mb-6 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 p-4 text-center text-black shadow-md">
          <p className="text-lg font-bold">
            🔥 {switchNameOrder(bestPlayer.name)} {onFireQuote} 🔥
          </p>
        </div>
      )}
      {teamA.length > 0 && teamB.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="w-full sm:w-1/2">
            <h3 className="mb-4 rounded-lg bg-gradient-to-r from-[#689820] to-[#4d7118] px-4 py-2 text-center text-lg font-bold text-white shadow-md sm:text-xl">
              {teamAScore.toFixed(2)}
            </h3>
            <ul className="space-y-4">
              {teamA.map((player) => (
                <PlayerCard
                  key={player.name}
                  player={player}
                  teamColor="#689820"
                />
              ))}
            </ul>
          </div>
          <div className="w-full sm:w-1/2">
            <h3 className="mb-4 rounded-lg bg-gradient-to-r from-[#982020] to-[#721818] px-4 py-2 text-center text-lg font-bold text-white shadow-md sm:text-xl">
              {teamBScore.toFixed(2)}
            </h3>
            <ul className="space-y-4">
              {teamB.map((player) => (
                <PlayerCard
                  key={player.name}
                  player={player}
                  teamColor="#982020"
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDisplay;

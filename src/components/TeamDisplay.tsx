import { useMemo } from 'react';

import { toast } from 'sonner';

import Button from './Button';
import PlayerCard from './PlayerCard';
import { useStore } from '@store/useStore';
import { formatTeamsForEmail } from '@utils/formatTeams';
import { calculateTeamScore } from '@utils/teamSelection';
import { Player } from '@utils/xlsxParser';

interface TeamDisplayProps {
  teamA: Player[];
  teamB: Player[];
}

const TeamDisplay = ({ teamA, teamB }: TeamDisplayProps) => {
  const { teamExplanation, playerAssessments } = useStore();

  const [teamAScore, teamBScore] = useMemo(
    () => [calculateTeamScore(teamA), calculateTeamScore(teamB)],
    [teamA, teamB],
  );

  const handleCopyToClipboard = async () => {
    const formattedTeams = formatTeamsForEmail(
      teamA,
      teamB,
      teamAScore,
      teamBScore,
      teamExplanation,
      playerAssessments,
    );

    try {
      await navigator.clipboard.writeText(formattedTeams);
      toast.success('Teams copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy teams:', error);
      toast.error('Failed to copy teams to clipboard');
    }
  };

  return (
    <div className="w-full max-w-4xl">
      {teamExplanation && (
        <div className="mb-6 rounded-lg bg-gradient-to-r from-indigo-900 to-blue-800 p-4 text-white shadow-md">
          <p className="text-sm">{teamExplanation}</p>
        </div>
      )}
      {teamA.length > 0 && teamB.length > 0 && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="w-full sm:w-1/2">
              <h3 className="mb-4 rounded-lg bg-gradient-to-r from-secondary to-secondary-dark px-4 py-2 text-center text-lg font-bold text-white shadow-md sm:text-xl">
                {teamAScore.toFixed(2)}
              </h3>
              <ul className="space-y-4">
                {teamA.map((player) => (
                  <PlayerCard
                    key={player.name}
                    player={player}
                    teamColor="#689820"
                    assessment={playerAssessments[player.name]}
                  />
                ))}
              </ul>
            </div>
            <div className="w-full sm:w-1/2">
              <h3 className="mb-4 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 py-2 text-center text-lg font-bold text-white shadow-md sm:text-xl">
                {teamBScore.toFixed(2)}
              </h3>
              <ul className="space-y-4">
                {teamB.map((player) => (
                  <PlayerCard
                    key={player.name}
                    player={player}
                    teamColor="#982020"
                    assessment={playerAssessments[player.name]}
                  />
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Button onClick={handleCopyToClipboard}>
              <div className="flex items-center gap-2">
                <svg
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
                Copy Teams
              </div>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TeamDisplay;

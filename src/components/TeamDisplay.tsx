import { useMemo } from 'react';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from './Button';
import PlayerCard from './PlayerCard';
import { Card, CardHeader, CardTitle } from '@components/ui/card';
import { formatTeamsForEmail } from '@utils/formatTeams';
import { calculateTeamScore } from '@utils/teamSelection';
import { Player } from '@utils/xlsxParser';

interface TeamDisplayProps {
  teamA: Player[];
  teamB: Player[];
}

const TeamDisplay = ({ teamA, teamB }: TeamDisplayProps) => {
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
    <div className="w-full max-w-6xl">
      {teamA.length > 0 && teamB.length > 0 && (
        <>
          <div className="flex flex-col gap-8 sm:flex-row">
            <div className="w-full sm:w-1/2">
              <Card className="mb-6 border-secondary/30 bg-secondary/15 shadow-sm">
                <CardHeader className="px-6 py-4">
                  <CardTitle
                    className="text-center text-2xl font-semibold text-white sm:text-3xl"
                    style={{ color: 'hsl(var(--secondary-foreground))' }}
                  >
                    {teamAScore.toFixed(2)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <ul className="space-y-4">
                {teamA.map((player) => (
                  <PlayerCard
                    key={player.name}
                    player={player}
                    teamColor="hsl(var(--secondary))"
                  />
                ))}
              </ul>
            </div>
            <div className="w-full sm:w-1/2">
              <Card className="mb-6 border-primary/30 bg-primary/15 shadow-sm">
                <CardHeader className="px-6 py-4">
                  <CardTitle
                    className="text-center text-2xl font-semibold text-white sm:text-3xl"
                    style={{ color: 'hsl(var(--primary-foreground))' }}
                  >
                    {teamBScore.toFixed(2)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <ul className="space-y-4">
                {teamB.map((player) => (
                  <PlayerCard
                    key={player.name}
                    player={player}
                    teamColor="hsl(var(--primary))"
                  />
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 flex justify-center">
            <Button onClick={handleCopyToClipboard} size="lg">
              <Copy className="size-4" />
              Copy Teams
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TeamDisplay;

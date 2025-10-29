import { Info } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@components/ui/card';
import { cn } from '@utils/cn';
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
  <div className="flex flex-col items-center rounded-md border border-border bg-muted/60 p-3 text-center transition-colors hover:bg-muted/80">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <div className="mt-1 flex items-baseline gap-1">
      <span className="text-lg font-semibold" style={{ color }}>
        {value}
      </span>
      <span className="text-xs text-muted-foreground">/ match</span>
    </div>
    <span className="mt-1 text-xs text-muted-foreground">Total: {total}</span>
  </div>
);

const PlayerCard = ({ player, teamColor, assessment }: PlayerCardProps) => {
  const playerScore = calculatePlayerScore(player);

  return (
    <li className="mb-4">
      <Card className="group transition-all hover:shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <h3 className="pr-2 text-lg font-semibold text-card-foreground">
              {player.name}
            </h3>
            <div
              className={cn(
                'font-mono flex size-12 shrink-0 items-center justify-center rounded-md text-base font-semibold text-white shadow-sm',
              )}
              style={{ backgroundColor: teamColor }}
            >
              {playerScore.toFixed(2)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
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

          <div className="flex items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">
              <span className="mr-1">Matches:</span>
              <span className="font-medium text-foreground">
                {player.matches}
              </span>
            </span>
          </div>

          <div className="min-h-[80px] rounded-md border border-border bg-muted/50 p-3">
            {assessment ? (
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 size-4 shrink-0 text-blue-500" />
                <div className="relative flex-1">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {assessment}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs italic text-muted-foreground">
                No AI assessment available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </li>
  );
};

export default PlayerCard;

import { Card, CardContent, CardHeader } from '@components/ui/card';
import { cn, getSynergyColorClass } from '@utils/cn';
import { calculatePlayerScore } from '@utils/teamSelection';
import { TeamStats } from '@utils/teamSelectionCore';
import { Player } from '@utils/xlsxParser';

interface PlayerCardProps {
  player: Player;
  teamColor: string;
  teamStats?: TeamStats;
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

const PlayerCard = ({ player, teamColor, teamStats }: PlayerCardProps) => {
  const playerScore = calculatePlayerScore(player);

  // Find this player's synergy info from team stats
  const playerSynergies = teamStats?.synergyDetails?.filter(
    (detail) =>
      detail.player1 === player.name || detail.player2 === player.name,
  );

  const synergiesWithHistory = playerSynergies?.filter(
    (s) => s.gamesTogether > 0,
  );

  // Calculate average synergy with teammates
  const avgSynergy =
    synergiesWithHistory && synergiesWithHistory.length > 0
      ? synergiesWithHistory.reduce((sum, s) => sum + s.contribution, 0) /
        synergiesWithHistory.length
      : null;

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
                'font-mono flex px-2 shrink-0 items-center justify-center rounded-md text-base font-semibold text-white shadow-sm',
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

          {/* Player Synergy Section */}
          {synergiesWithHistory && synergiesWithHistory.length > 0 && (
            <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">
                  Teammate History
                </span>
                {avgSynergy !== null && (
                  <span
                    className={`font-mono font-semibold ${getSynergyColorClass(
                      avgSynergy,
                    )}`}
                  >
                    Avg: {avgSynergy > 0 ? '+' : ''}
                    {avgSynergy.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {synergiesWithHistory.map((synergy) => {
                  const otherPlayer =
                    synergy.player1 === player.name
                      ? synergy.player2
                      : synergy.player1;
                  return (
                    <div
                      key={`${player.name}-${otherPlayer}`}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-muted-foreground">
                        vs {otherPlayer}
                      </span>
                      <span
                        className={`font-mono ${getSynergyColorClass(
                          synergy.contribution,
                        )}`}
                      >
                        {synergy.contribution > 0 ? '+' : ''}
                        {synergy.contribution.toFixed(2)}
                        <span className="ml-1 text-muted-foreground">
                          ({synergy.winsTogether}W/{synergy.lossesTogether}L)
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </li>
  );
};

export default PlayerCard;

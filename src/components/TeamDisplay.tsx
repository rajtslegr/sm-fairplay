import { useMemo } from 'react';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from './Button';
import PlayerCard from './PlayerCard';
import { Card, CardHeader, CardTitle } from '@components/ui/card';
import {
  calculateTeamScore,
  SelectionStats,
  TeamStats,
} from '@utils/teamSelection';
import { Player } from '@utils/xlsxParser';

interface TeamDisplayProps {
  teamA: Player[];
  teamB: Player[];
  selectionStats?: SelectionStats | null;
}

interface TeamBlock {
  emoji: string;
  label: string;
  players: Player[];
  score: number;
  synergy?: number;
  teamStats?: TeamStats;
}

function formatPlayerLines(
  player: Player,
  teammates: Player[],
  teamStats?: TeamStats,
): string {
  const teammateNames = new Set(teammates.map((p) => p.name));
  const synergies =
    teamStats?.synergyDetails?.filter(
      (detail) =>
        (detail.player1 === player.name && teammateNames.has(detail.player2)) ||
        (detail.player2 === player.name && teammateNames.has(detail.player1)),
    ) ?? [];

  const lines = [
    `${player.name} — ${calculateTeamScore([player]).toFixed(2)}`,
    `Goals ${player.goalsPerMatch.toFixed(2)} · Assists ${player.assistsPerMatch.toFixed(2)} · Points ${player.pointsPerMatch.toFixed(2)}`,
  ];

  const playedTogether = synergies.filter((s) => s.gamesTogether > 0);
  if (playedTogether.length > 0) {
    const pairs = playedTogether.map((s) => {
      const other = s.player1 === player.name ? s.player2 : s.player1;
      const sign = s.contribution > 0 ? '+' : '';
      return `${other} ${sign}${s.contribution.toFixed(2)} (${s.winsTogether}W/${s.lossesTogether}L)`;
    });
    lines.push(`Synergy: ${pairs.join(', ')}`);
  }

  return lines.join('\n');
}

function formatTeamBlock({
  emoji,
  label,
  players,
  score,
  synergy,
  teamStats,
}: TeamBlock): string {
  const synergyNote =
    synergy !== undefined
      ? ` | Synergy: ${synergy > 0 ? '+' : ''}${synergy.toFixed(3)}`
      : '';

  const playerLines = players
    .map((player) => formatPlayerLines(player, players, teamStats))
    .join('\n\n');

  return `${emoji} ${label} — Total Score: ${score.toFixed(2)}${synergyNote}\n\n${playerLines}`;
}

function formatFooterLines(stats: SelectionStats): string[] {
  const lines: string[] = [];

  if (stats.algorithm === 'skill-and-synergy') {
    lines.push(
      `Algorithm: Skill + Synergy (${(stats.skillWeight * 100).toFixed(0)}% skill / ${(stats.synergyWeight * 100).toFixed(0)}% synergy)`,
    );
  } else {
    lines.push('Algorithm: Skill Only');
  }

  if (stats.matchHistoryStats) {
    const { matchesWithPlayerData, uniquePlayerPairs } =
      stats.matchHistoryStats;
    lines.push(
      `Match history: ${matchesWithPlayerData} matches with player data, ${uniquePlayerPairs} unique player pairs`,
    );
  }

  return lines;
}

function formatTeamsForEmail(
  teamA: Player[],
  teamB: Player[],
  teamAScore: number,
  teamBScore: number,
  stats?: SelectionStats,
): string {
  const sections = [
    '⚽ Team Generation Results',
    formatTeamBlock({
      emoji: '🟢',
      label: 'Team A',
      players: teamA,
      score: teamAScore,
      synergy: stats?.teamA.synergy,
      teamStats: stats?.teamA,
    }),
    formatTeamBlock({
      emoji: '🔴',
      label: 'Team B',
      players: teamB,
      score: teamBScore,
      synergy: stats?.teamB.synergy,
      teamStats: stats?.teamB,
    }),
    stats ? formatFooterLines(stats).join('\n') : '',
  ];

  return sections.filter(Boolean).join('\n\n');
}

const TeamDisplay = ({ teamA, teamB, selectionStats }: TeamDisplayProps) => {
  const [teamAScore, teamBScore] = useMemo(
    () => [calculateTeamScore(teamA), calculateTeamScore(teamB)],
    [teamA, teamB],
  );

  const teamASynergy = selectionStats?.teamA.synergy;
  const teamBSynergy = selectionStats?.teamB.synergy;

  const formattedTeams = useMemo(
    () =>
      formatTeamsForEmail(
        teamA,
        teamB,
        teamAScore,
        teamBScore,
        selectionStats ?? undefined,
      ),
    [teamA, teamB, teamAScore, teamBScore, selectionStats],
  );

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formattedTeams);
      toast.success('Teams copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy teams:', error);
      toast.error('Failed to copy teams to clipboard');
    }
  };

  if (teamA.length === 0 || teamB.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl">
      <div className="flex flex-col gap-8 sm:flex-row">
        {/* Team A */}
        <div className="w-full sm:w-1/2">
          <Card className="mb-6 border-secondary/30 bg-secondary/15 shadow-sm">
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-center text-2xl font-semibold text-secondary sm:text-3xl dark:text-secondary-foreground">
                {teamAScore.toFixed(2)}
              </CardTitle>
              {teamASynergy !== undefined && teamASynergy !== 0 && (
                <div
                  className={`mt-2 text-center text-sm font-medium ${
                    teamASynergy > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  Synergy: {teamASynergy > 0 ? '+' : ''}
                  {teamASynergy.toFixed(3)}
                </div>
              )}
            </CardHeader>
          </Card>
          <ul className="space-y-4">
            {teamA.map((player) => (
              <PlayerCard
                key={player.name}
                player={player}
                teamColor="hsl(var(--secondary))"
                teamStats={selectionStats?.teamA}
              />
            ))}
          </ul>
        </div>

        {/* Team B */}
        <div className="w-full sm:w-1/2">
          <Card className="mb-6 border-primary/30 bg-primary/15 shadow-sm">
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-center text-2xl font-semibold text-primary sm:text-3xl dark:text-primary-foreground">
                {teamBScore.toFixed(2)}
              </CardTitle>
              {teamBSynergy !== undefined && teamBSynergy !== 0 && (
                <div
                  className={`mt-2 text-center text-sm font-medium ${
                    teamBSynergy > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  Synergy: {teamBSynergy > 0 ? '+' : ''}
                  {teamBSynergy.toFixed(3)}
                </div>
              )}
            </CardHeader>
          </Card>
          <ul className="space-y-4">
            {teamB.map((player) => (
              <PlayerCard
                key={player.name}
                player={player}
                teamColor="hsl(var(--primary))"
                teamStats={selectionStats?.teamB}
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
    </div>
  );
};

export default TeamDisplay;

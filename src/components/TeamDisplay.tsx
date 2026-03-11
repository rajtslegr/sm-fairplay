import { useMemo } from 'react';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from './Button';
import PlayerCard from './PlayerCard';
import { Card, CardHeader, CardTitle } from '@components/ui/card';
import { calculateTeamScore } from '@utils/teamSelection';
import { SelectionStats } from '@utils/teamSelectionCore';
import { Player } from '@utils/xlsxParser';

interface TeamDisplayProps {
  teamA: Player[];
  teamB: Player[];
  selectionStats?: SelectionStats | null;
}

function formatTeamsForEmail(
  teamA: Player[],
  teamB: Player[],
  teamAScore: number,
  teamBScore: number,
): string {
  const formatPlayerStats = (player: Player): string => {
    const stats = [
      `Score: ${calculateTeamScore([player]).toFixed(2)}`,
      `Goals: ${player.goalsPerMatch.toFixed(2)}`,
      `Assists: ${player.assistsPerMatch.toFixed(2)}`,
      `Points: ${player.pointsPerMatch.toFixed(2)}`,
    ];

    return stats.join(' | ');
  };

  const formatTeam = (players: Player[]): string =>
    players
      .map((player) => `• ${player.name}\n  ${formatPlayerStats(player)}`)
      .join('\n\n');

  return `🟢 Team A - Total Score: ${teamAScore.toFixed(2)}\n\n${formatTeam(
    teamA,
  )}\n\n🔴 Team B - Total Score: ${teamBScore.toFixed(2)}\n\n${formatTeam(
    teamB,
  )}`;
}

function formatTeamsForEmailWithSynergy(
  teamA: Player[],
  teamB: Player[],
  teamAScore: number,
  teamBScore: number,
  stats: SelectionStats,
): string {
  const formatPlayerStats = (player: Player, team: 'A' | 'B'): string => {
    const playerScore = calculateTeamScore([player]).toFixed(2);
    const playerBreakdown = stats.sortedPlayers.find(
      (p) => p.name === player.name,
    );

    const lines = [
      `Score: ${playerScore}`,
      `  Goals: ${player.goalsPerMatch.toFixed(2)}`,
      `  Assists: ${player.assistsPerMatch.toFixed(2)}`,
      `  Points: ${player.pointsPerMatch.toFixed(2)}`,
    ];

    if (playerBreakdown) {
      lines.push(
        `  └ G:${playerBreakdown.goalsContribution.toFixed(1)} A:${playerBreakdown.assistsContribution.toFixed(1)} P:${playerBreakdown.pointsContribution.toFixed(1)}`,
      );
    }

    // Add synergy with teammates
    const teamStats = team === 'A' ? stats.teamA : stats.teamB;
    const teamPlayerNames = new Set(
      (team === 'A' ? teamA : teamB).map((p) => p.name),
    );

    const synergies = teamStats.synergyDetails?.filter(
      (detail) =>
        (detail.player1 === player.name &&
          teamPlayerNames.has(detail.player2)) ||
        (detail.player2 === player.name && teamPlayerNames.has(detail.player1)),
    );

    if (synergies && synergies.length > 0) {
      const synergyWithHistory = synergies.filter((s) => s.gamesTogether > 0);
      if (synergyWithHistory.length > 0) {
        lines.push('');
        lines.push('  Synergy with teammates:');
        synergyWithHistory.forEach((s) => {
          const otherPlayer = s.player1 === player.name ? s.player2 : s.player1;
          const sign = s.contribution > 0 ? '+' : '';
          lines.push(
            `  • ${otherPlayer}: ${sign}${s.contribution.toFixed(2)} (${s.winsTogether}W/${s.lossesTogether}L/${s.gamesTogether}G)`,
          );
        });
      }
    }

    return lines.join('\n');
  };

  const formatTeam = (players: Player[], team: 'A' | 'B'): string =>
    players
      .map((player) => `• ${player.name}\n  ${formatPlayerStats(player, team)}`)
      .join('\n\n');

  const teamASynergy = stats.teamA.synergy;
  const teamBSynergy = stats.teamB.synergy;

  let result = '          🏆 TEAM GENERATION RESULTS 🏆\n';
  result += `${'═'.repeat(50)}\n\n`;

  result += '🟢 TEAM A\n';
  result += `Total Score: ${teamAScore.toFixed(2)}`;
  if (teamASynergy !== undefined) {
    result += ` | Synergy: ${teamASynergy > 0 ? '+' : ''}${teamASynergy.toFixed(3)}`;
  }
  result += `\n\n${formatTeam(teamA, 'A')}\n\n`;

  result += '🔴 TEAM B\n';
  result += `Total Score: ${teamBScore.toFixed(2)}`;
  if (teamBSynergy !== undefined) {
    result += ` | Synergy: ${teamBSynergy > 0 ? '+' : ''}${teamBSynergy.toFixed(3)}`;
  }
  result += `\n\n${formatTeam(teamB, 'B')}\n\n`;

  if (stats.algorithm === 'skill-and-synergy') {
    result += '📊 Algorithm: Skill + Synergy\n';
    result += `Skill Weight: ${(stats.skillWeight * 100).toFixed(0)}% | `;
    result += `Synergy Weight: ${(stats.synergyWeight * 100).toFixed(0)}%\n`;
  } else {
    result += '📊 Algorithm: Skill Only\n';
  }

  if (stats.matchHistoryStats) {
    result += `\n📈 Match History: ${stats.matchHistoryStats.matchesWithPlayerData} matches with player data`;
    result += `, ${stats.matchHistoryStats.uniquePlayerPairs} unique pairs\n`;
  }

  return result;
}

const TeamDisplay = ({ teamA, teamB, selectionStats }: TeamDisplayProps) => {
  const [teamAScore, teamBScore] = useMemo(
    () => [calculateTeamScore(teamA), calculateTeamScore(teamB)],
    [teamA, teamB],
  );

  const teamASynergy = selectionStats?.teamA.synergy;
  const teamBSynergy = selectionStats?.teamB.synergy;

  const formattedTeams = useMemo(() => {
    if (!selectionStats) {
      return formatTeamsForEmail(teamA, teamB, teamAScore, teamBScore);
    }
    return formatTeamsForEmailWithSynergy(
      teamA,
      teamB,
      teamAScore,
      teamBScore,
      selectionStats,
    );
  }, [teamA, teamB, teamAScore, teamBScore, selectionStats]);

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
              <CardTitle className="text-center text-2xl font-semibold text-secondary dark:text-secondary-foreground sm:text-3xl">
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
              <CardTitle className="text-center text-2xl font-semibold text-primary dark:text-primary-foreground sm:text-3xl">
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

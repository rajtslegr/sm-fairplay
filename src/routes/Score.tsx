import { useMemo } from 'react';

import PlayerPerformanceChart from '@components/PlayerPerformanceChart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { useStore } from '@store/useStore';
import { calculatePlayerScore } from '@utils/teamSelection';
import { Player } from '@utils/xlsxParser';

const calculateAverages = (players: Player[]) => {
  if (players.length === 0) return { goals: 0, assists: 0, points: 0 };

  const totals = players.reduce(
    (acc, player) => ({
      goals: acc.goals + player.goalsPerMatch,
      assists: acc.assists + player.assistsPerMatch,
      points: acc.points + player.pointsPerMatch,
    }),
    { goals: 0, assists: 0, points: 0 },
  );

  return {
    goals: totals.goals / players.length,
    assists: totals.assists / players.length,
    points: totals.points / players.length,
  };
};

const StatCard = ({ title, value }: { title: string; value: string }) => (
  <Card className="transition-all hover:shadow-md">
    <CardHeader className="pb-3">
      <CardDescription className="text-sm font-medium">{title}</CardDescription>
    </CardHeader>
    <CardContent>
      <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
    </CardContent>
  </Card>
);

const PlayerStatRow = ({ player }: { player: Player }) => (
  <tr className="border-b border-border transition-colors hover:bg-muted/50">
    <td className="px-6 py-4 font-medium">{player.name}</td>
    <td className="px-6 py-4 text-center">{player.goalsPerMatch.toFixed(2)}</td>
    <td className="px-6 py-4 text-center">
      {player.assistsPerMatch.toFixed(2)}
    </td>
    <td className="px-6 py-4 text-center">
      {player.pointsPerMatch.toFixed(2)}
    </td>
    <td className="px-6 py-4 text-center">
      <span className="font-semibold">
        {calculatePlayerScore(player).toFixed(2)}
      </span>
    </td>
  </tr>
);

export const Score = () => {
  const { players } = useStore();

  const averages = useMemo(() => calculateAverages(players), [players]);
  const sortedPlayers = useMemo(
    () =>
      [...players].sort(
        (a, b) => calculatePlayerScore(b) - calculatePlayerScore(a),
      ),
    [players],
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-24">
      <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Average Goals per Match"
          value={averages.goals.toFixed(2)}
        />
        <StatCard
          title="Average Assists per Match"
          value={averages.assists.toFixed(2)}
        />
        <StatCard
          title="Average Points per Match"
          value={averages.points.toFixed(2)}
        />
      </div>

      <div className="mb-12">
        <PlayerPerformanceChart players={sortedPlayers} />
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Player Statistics</CardTitle>
          <CardDescription>
            Complete performance breakdown for all players
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm font-medium">
                    Player
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium">
                    Goals/Match
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium">
                    Assists/Match
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium">
                    Points/Match
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((player) => (
                  <PlayerStatRow key={player.name} player={player} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

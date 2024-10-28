import { useMemo } from 'react';

import PlayerPerformanceChart from '@components/PlayerPerformanceChart';
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
  <div className="rounded-lg bg-background-card p-4 text-center">
    <h3 className="mb-2 text-sm font-semibold text-gray-400">{title}</h3>
    <p className="text-2xl font-bold text-gray-50">{value}</p>
  </div>
);

const PlayerStatRow = ({ player }: { player: Player }) => (
  <tr className="border-b border-gray-700">
    <td className="px-4 py-2">{player.name}</td>
    <td className="px-4 py-2 text-center">{player.goalsPerMatch.toFixed(2)}</td>
    <td className="px-4 py-2 text-center">
      {player.assistsPerMatch.toFixed(2)}
    </td>
    <td className="px-4 py-2 text-center">
      {player.pointsPerMatch.toFixed(2)}
    </td>
    <td className="px-4 py-2 text-center">
      {calculatePlayerScore(player).toFixed(2)}
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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      <div className="mb-8">
        <PlayerPerformanceChart players={sortedPlayers} />
      </div>

      <div className="overflow-x-auto rounded-lg bg-background-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700 bg-background text-left">
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3 text-center">Goals/Match</th>
              <th className="px-4 py-3 text-center">Assists/Match</th>
              <th className="px-4 py-3 text-center">Points/Match</th>
              <th className="px-4 py-3 text-center">Score</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player) => (
              <PlayerStatRow key={player.name} player={player} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

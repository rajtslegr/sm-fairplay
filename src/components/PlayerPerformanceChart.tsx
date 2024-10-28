import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Player } from '@utils/xlsxParser';

interface PlayerPerformanceChartProps {
  players: Player[];
}

const PlayerPerformanceChart = ({ players }: PlayerPerformanceChartProps) => {
  const data = players.map((player) => ({
    name: player.name,
    goals: Number(player.goalsPerMatch.toFixed(2)),
    assists: Number(player.assistsPerMatch.toFixed(2)),
    points: Number(player.pointsPerMatch.toFixed(2)),
  }));

  return (
    <div className="h-[400px] w-full rounded-lg bg-background-card p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            stroke="#999"
            interval={0}
          />
          <YAxis stroke="#999" tickFormatter={(value) => value.toFixed(2)} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#fff',
            }}
            formatter={(value: number) => value.toFixed(2)}
            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
          />
          <Legend />
          <Bar dataKey="goals" name="Goals/Match" fill="#689820" />
          <Bar dataKey="assists" name="Assists/Match" fill="#982054" />
          <Bar dataKey="points" name="Points/Match" fill="#206498" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlayerPerformanceChart;

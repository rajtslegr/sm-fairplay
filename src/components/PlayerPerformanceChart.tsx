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

import { Card, CardContent } from '@components/ui/card';
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
    <Card>
      <CardContent className="h-[400px] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              className="stroke-muted-foreground"
              interval={0}
            />
            <YAxis
              className="stroke-muted-foreground"
              tickFormatter={(value) => value.toFixed(2)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'calc(var(--radius) - 2px)',
                color: 'hsl(var(--card-foreground))',
              }}
              formatter={(value) =>
                typeof value === 'number' ? value.toFixed(2) : value
              }
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            />
            <Legend />
            <Bar
              dataKey="goals"
              name="Goals/Match"
              fill="hsl(var(--secondary))"
            />
            <Bar
              dataKey="assists"
              name="Assists/Match"
              fill="hsl(var(--primary))"
            />
            <Bar
              dataKey="points"
              name="Points/Match"
              fill="hsl(var(--muted-foreground))"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PlayerPerformanceChart;

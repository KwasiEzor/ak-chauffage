import { SimpleLineChart } from './SimpleCharts';

interface DashboardVisitorsChartProps {
  dailyViews: { date: string; views: number }[];
}

export default function DashboardVisitorsChart({ dailyViews }: DashboardVisitorsChartProps) {
  return (
    <div className="h-48">
      <SimpleLineChart data={dailyViews.map((entry) => ({ label: entry.date, value: entry.views }))} height={192} />
    </div>
  );
}

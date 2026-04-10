import { SimpleBarChart, SimpleDonutChart, SimpleLineChart } from './SimpleCharts';

interface AnalyticsStats {
  dailyViews: { date: string; views: number }[];
  popularPages: { page_path: string; views: number }[];
  trafficSources: { name: string; value: number }[];
  deviceBreakdown: { name: string; value: number }[];
}

interface AnalyticsChartsProps {
  stats: AnalyticsStats;
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function AnalyticsCharts({ stats }: AnalyticsChartsProps) {
  return (
    <>
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Vues Quotidiennes</h2>
        <div className="h-[300px]">
          <SimpleLineChart
            data={stats.dailyViews.map((entry) => ({ label: entry.date, value: entry.views }))}
            height={300}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Pages Populaires</h2>
          <div className="h-[300px]">
            <SimpleBarChart
              data={stats.popularPages.slice(0, 5).map((entry) => ({
                label: entry.page_path,
                value: entry.views,
              }))}
              height={300}
            />
          </div>
        </div>

        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Sources de Trafic</h2>
          <SimpleDonutChart
            data={stats.trafficSources.map((entry) => ({
              label: entry.name,
              value: entry.value,
            }))}
            colors={COLORS}
          />
        </div>

        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 md:col-span-2">
          <h2 className="text-xl font-bold text-white mb-4">Appareils Utilisés</h2>
          <SimpleDonutChart
            data={stats.deviceBreakdown.map((entry) => ({
              label: entry.name,
              value: entry.value,
            }))}
            colors={COLORS}
          />
        </div>
      </div>
    </>
  );
}

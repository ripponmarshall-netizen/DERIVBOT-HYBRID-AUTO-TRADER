export default function StatsPanel({ stats, trades }) {
  const line = trades.slice(0, 30).map((t, idx) => ({ x: idx, y: t.profit }));
  const min = Math.min(0, ...line.map((p) => p.y));
  const max = Math.max(1, ...line.map((p) => p.y));

  return (
    <section className="space-y-3 animate-fadeIn">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Win rate" value={`${stats.winRate}%`} />
        <StatCard label="Total trades" value={stats.total} />
        <StatCard label="Profit/Loss" value={stats.pnl.toFixed(2)} cls={stats.pnl >= 0 ? 'text-mars-profit' : 'text-mars-loss'} />
      </div>
      <div className="card p-4">
        <h3 className="mb-3 text-sm font-semibold">Simple line chart</h3>
        <svg viewBox="0 0 300 120" className="h-32 w-full">
          {line.length > 1 && (
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              points={line.map((p, i) => `${(i / (line.length - 1)) * 300},${110 - ((p.y - min) / (max - min || 1)) * 90}`).join(' ')}
            />
          )}
        </svg>
      </div>
    </section>
  );
}

function StatCard({ label, value, cls = '' }) {
  return <div className="card p-4"><div className="text-xs text-mars-muted">{label}</div><div className={`text-xl font-bold ${cls}`}>{value}</div></div>;
}

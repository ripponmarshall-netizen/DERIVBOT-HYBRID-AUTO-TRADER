export default function Dashboard({ signal, logs, prices, onManualTrade }) {
  return (
    <section className="space-y-4 animate-fadeIn">
      <div className="card p-4">
        <h2 className="mb-2 text-sm font-semibold text-mars-muted">Chart Area</h2>
        <div className="h-48 rounded-xl border border-mars-border bg-gradient-to-br from-mars-surface to-mars-card p-3">
          <div className="mb-2 text-xs text-mars-muted">Simple sparkline placeholder ({prices.length} ticks)</div>
          <div className="flex h-32 items-end gap-1">
            {prices.slice(-50).map((p, i, arr) => {
              const min = Math.min(...arr);
              const max = Math.max(...arr);
              const h = ((p - min) / ((max - min) || 1)) * 100;
              return <div key={i} className="w-1 rounded bg-blue-400/70" style={{ height: `${Math.max(6, h)}%` }} />;
            })}
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Smart Feedback</h3>
          <span className="text-xs text-mars-muted">{signal.strength}% confidence</span>
        </div>
        <p className="mb-3 text-sm text-mars-muted">{signal.message}</p>
        <div className="h-2 overflow-hidden rounded bg-mars-surface">
          <div className="h-full bg-mars-ai transition-all" style={{ width: `${signal.strength}%` }} />
        </div>
        <div className="mt-3 flex gap-2">
          <button className="btn-success" onClick={() => onManualTrade('CALL')}>▲ Up</button>
          <button className="btn-danger" onClick={() => onManualTrade('PUT')}>▼ Down</button>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="mb-2 text-sm font-semibold">Live activity feed</h3>
        <div className="max-h-56 space-y-2 overflow-auto">
          {logs.length === 0 ? <SkeletonRows /> : logs.slice(0, 20).map((l) => (
            <div key={l.id} className="rounded-lg border border-mars-border bg-mars-surface px-3 py-2 text-xs">
              <span className="text-mars-muted">{l.time}</span> — {l.msg}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {[...Array(4)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded bg-mars-surface" />)}
    </div>
  );
}

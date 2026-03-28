export default function TradePanel({ trades, onReplay }) {
  return (
    <section className="card p-4 animate-fadeIn">
      <h3 className="mb-3 text-sm font-semibold">Trade History</h3>
      <div className="max-h-[420px] space-y-2 overflow-auto">
        {trades.length === 0 ? <div className="text-sm text-mars-muted">No trades yet</div> : trades.map((t) => (
          <button key={t.id} onClick={() => onReplay(t)} className="w-full rounded-xl border border-mars-border bg-mars-surface p-3 text-left text-sm transition hover:border-mars-ai">
            <div className="flex justify-between">
              <span>Entry: {t.entry ?? '—'}</span>
              <span className={t.outcome === 'win' ? 'text-mars-profit' : 'text-mars-loss'}>{t.outcome.toUpperCase()}</span>
            </div>
            <div className="text-xs text-mars-muted">{t.timestamp}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

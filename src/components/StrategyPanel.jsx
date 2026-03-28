const cards = [
  { id: 'RSI', title: 'RSI', desc: 'Overbought/oversold momentum filter.' },
  { id: 'MACD', title: 'MACD', desc: 'Trend momentum crossover signal.' },
  { id: 'AI_ADAPTIVE', title: 'AI Adaptive Mode', desc: 'Simulated dynamic strategy switching.' },
];

export default function StrategyPanel({ prefs, updatePref, signal }) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 animate-fadeIn">
      {cards.map((c) => {
        const active = prefs.strategy === c.id;
        return (
          <article key={c.id} className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">{c.title}</h3>
              <button className={`btn ${active ? 'bg-mars-ai text-white' : 'bg-mars-surface text-mars-muted'}`} onClick={() => updatePref('strategy', c.id)}>
                {active ? 'ON' : 'OFF'}
              </button>
            </div>
            <p className="mb-2 text-sm text-mars-muted">{c.desc}</p>
            <div className="text-xs text-mars-muted">Confidence: {signal.strength}%</div>
          </article>
        );
      })}
    </section>
  );
}

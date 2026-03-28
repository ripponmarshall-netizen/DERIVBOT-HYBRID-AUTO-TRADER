export default function SettingsPanel({ prefs, updatePref, durations, applyProfile }) {
  return (
    <section className="card space-y-3 p-4 animate-fadeIn">
      <div>
        <label className="mb-1 block text-xs text-mars-muted">API Token</label>
        <input className="input" type="password" value={prefs.token} onChange={(e) => updatePref('token', e.target.value)} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Trade duration">
          <select className="input" value={prefs.duration} onChange={(e) => updatePref('duration', e.target.value)}>
            {durations.map((d) => <option key={`${d.value}|${d.unit}`} value={`${d.value}|${d.unit}`}>{d.label}</option>)}
          </select>
        </Field>
        <Field label="Risk level">
          <select className="input" value={prefs.risk} onChange={(e) => updatePref('risk', e.target.value)}>
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
        </Field>
        <Field label="Amount per trade ($)">
          <input className="input" type="number" min="0.35" step="0.01" value={prefs.stake} onChange={(e) => updatePref('stake', e.target.value)} />
        </Field>
        <Field label="Min confidence">
          <input className="input" type="number" min="30" max="95" value={prefs.minStrength} onChange={(e) => updatePref('minStrength', Number(e.target.value))} />
        </Field>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        {['Aggressive', 'Safe', 'Custom'].map((p) => (
          <button key={p} className={`btn ${prefs.profile === p ? 'bg-mars-ai text-white' : 'bg-mars-surface text-mars-muted'}`} onClick={() => applyProfile(p)}>{p}</button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Toggle label="AI Mode (Beta)" checked={prefs.aiMode} onChange={(v) => updatePref('aiMode', v)} />
        <Toggle label="Auto-adjust strategies" checked={prefs.autoAdjust} onChange={(v) => updatePref('autoAdjust', v)} />
        <Toggle label="Auto trading" checked={prefs.autoMode} onChange={(v) => updatePref('autoMode', v)} />
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return <div><label className="mb-1 block text-xs text-mars-muted">{label}</label>{children}</div>;
}

function Toggle({ label, checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center justify-between rounded-xl border border-mars-border bg-mars-surface p-3 text-sm">
      <span>{label}</span>
      <span className={`rounded-full px-2 py-1 text-xs ${checked ? 'bg-mars-ai text-white' : 'bg-mars-card text-mars-muted'}`}>{checked ? 'ON' : 'OFF'}</span>
    </button>
  );
}

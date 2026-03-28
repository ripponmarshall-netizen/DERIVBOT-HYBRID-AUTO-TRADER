export default function TopBar({ running, setRunning, conn, balance, onConnect, onDisconnect }) {
  return (
    <header className="card mb-4 flex items-center justify-between p-4 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold tracking-tight">MarsBot</h1>
        <p className="text-xs text-mars-muted">{running ? 'Running' : 'Stopped'} • {conn}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="rounded-xl border border-mars-border bg-mars-surface px-3 py-2 text-sm">
          Balance: <span className="font-semibold">{balance == null ? '—' : `$${balance.toFixed(2)}`}</span>
        </div>
        {conn === 'connected' ? (
          <button className="btn-danger" onClick={onDisconnect}>Disconnect</button>
        ) : (
          <button className="btn-primary" onClick={onConnect}>Connect</button>
        )}
        <button className={running ? 'btn-danger' : 'btn-success'} onClick={() => setRunning((v) => !v)}>
          {running ? 'Stop' : 'Start'}
        </button>
      </div>
    </header>
  );
}

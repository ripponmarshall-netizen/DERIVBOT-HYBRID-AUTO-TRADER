import { useState } from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TradePanel from './components/TradePanel';
import StrategyPanel from './components/StrategyPanel';
import SettingsPanel from './components/SettingsPanel';
import StatsPanel from './components/StatsPanel';
import { useMarsBot } from './hooks/useMarsBot';

const mobileTabs = ['Dashboard', 'Trades', 'Strategies', 'Settings', 'Stats'];

export default function App() {
  const bot = useMarsBot();
  const [active, setActive] = useState('Dashboard');
  const [mobile, setMobile] = useState('Dashboard');

  const renderPanel = (view) => {
    switch (view) {
      case 'Strategies': return <StrategyPanel prefs={bot.prefs} updatePref={bot.updatePref} signal={bot.signal} />;
      case 'Settings': return <SettingsPanel prefs={bot.prefs} updatePref={bot.updatePref} durations={bot.durations} applyProfile={bot.applyProfile} />;
      case 'Stats': return <StatsPanel stats={bot.stats} trades={bot.trades} />;
      case 'Trades': return <TradePanel trades={bot.trades} onReplay={bot.setSelectedTrade} />;
      default: return <Dashboard signal={bot.signal} logs={bot.logs} prices={bot.prices} onManualTrade={bot.placeTrade} />;
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-[1440px] p-4 pb-24 lg:pb-4">
      <TopBar
        running={bot.running}
        setRunning={bot.setRunning}
        conn={bot.conn}
        balance={bot.balance}
        onConnect={bot.connect}
        onDisconnect={bot.disconnect}
      />

      {/* Desktop: sidebar + center + aside */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-[220px_1fr_320px]">
        <Sidebar active={active} onChange={setActive} />
        <main>{renderPanel(active)}</main>
        <aside className="space-y-4">
          <TradePanel trades={bot.trades} onReplay={bot.setSelectedTrade} />
          <StatsPanel stats={bot.stats} trades={bot.trades} />
        </aside>
      </div>

      {/* Mobile: single panel switched by bottom nav */}
      <div className="lg:hidden">
        {renderPanel(mobile)}
      </div>

      {/* Trade detail modal */}
      {bot.selectedTrade && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="card w-full max-w-md p-4">
            <h3 className="mb-2 text-lg font-semibold">Trade replay</h3>
            <pre className="max-h-72 overflow-auto rounded-lg bg-mars-surface p-3 text-xs">{JSON.stringify(bot.selectedTrade, null, 2)}</pre>
            <button className="btn-primary mt-3 w-full" onClick={() => bot.setSelectedTrade(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-mars-border bg-mars-surface/95 p-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {mobileTabs.map((t) => (
            <button key={t} className={`rounded-lg px-1 py-2 text-xs ${mobile === t ? 'bg-mars-ai text-white' : 'text-mars-muted'}`} onClick={() => setMobile(t)}>{t}</button>
          ))}
        </div>
      </nav>

      {/* Toast notifications */}
      <div className="fixed right-4 top-20 z-50 space-y-2">
        {bot.toasts.map((t) => (
          <div key={t.id} className={`animate-fadeIn rounded-lg border px-3 py-2 text-sm shadow-lg ${
            t.level === 'error' ? 'border-red-700 bg-red-950 text-red-100'
            : t.level === 'success' ? 'border-green-700 bg-green-950 text-green-100'
            : t.level === 'warn' ? 'border-amber-700 bg-amber-950 text-amber-100'
            : 'border-blue-700 bg-blue-950 text-blue-100'
          }`}>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const WS_URL = 'wss://ws.binaryws.com/websockets/v3?app_id=1089';
const PREF_KEY = 'marsbot_frontend_prefs_v2';
const TRADES_KEY = 'marsbot_frontend_trades_v2';

const defaultPrefs = {
  symbol: 'R_50',
  duration: '7|t',
  stake: '1',
  risk: 'Medium',
  strategy: 'HYBRID',
  minStrength: 70,
  autoMode: false,
  aiMode: false,
  autoAdjust: true,
  profile: 'Custom',
  token: '',
};

const durations = [
  { value: 1, unit: 't', label: '1 Tick' },
  { value: 3, unit: 't', label: '3 Ticks' },
  { value: 7, unit: 't', label: '7 Ticks' },
  { value: 15, unit: 's', label: '15 Sec' },
  { value: 60, unit: 's', label: '1 Min' },
];

const strategies = ['HYBRID', 'RSI', 'MACD', 'EMA', 'BB', 'AI_ADAPTIVE'];

const parseDur = (key) => durations.find((d) => `${d.value}|${d.unit}` === key) || durations[2];

export function useMarsBot() {
  const [prefs, setPrefs] = useState(() => {
    try {
      return { ...defaultPrefs, ...JSON.parse(localStorage.getItem(PREF_KEY) || '{}') };
    } catch {
      return defaultPrefs;
    }
  });
  const [conn, setConn] = useState('disconnected');
  const [running, setRunning] = useState(false);
  const [balance, setBalance] = useState(null);
  const [prices, setPrices] = useState([]);
  const [logs, setLogs] = useState([]);
  const [signal, setSignal] = useState({ direction: null, strength: 0, message: 'Analyzing market...' });
  const [trades, setTrades] = useState(() => {
    try { return JSON.parse(localStorage.getItem(TRADES_KEY) || '[]'); } catch { return []; }
  });
  const [openContract, setOpenContract] = useState(null);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [toasts, setToasts] = useState([]);

  const wsRef = useRef(null);
  const tickSubId = useRef(null);
  const contractSubId = useRef(null);
  const buyingRef = useRef(false);

  useEffect(() => { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); }, [prefs]);
  useEffect(() => { localStorage.setItem(TRADES_KEY, JSON.stringify(trades.slice(0, 200))); }, [trades]);

  const pushLog = useCallback((msg, level = 'info') => {
    const entry = { id: Date.now() + Math.random(), msg, level, time: new Date().toLocaleTimeString() };
    setLogs((prev) => [entry, ...prev].slice(0, 200));
  }, []);

  const toast = useCallback((msg, level = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, level }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500);
  }, []);

  const updatePref = useCallback((key, value) => setPrefs((p) => ({ ...p, [key]: value })), []);

  const extractBalance = useCallback((payload) => {
    if (payload == null) return null;
    const v = typeof payload === 'object' ? payload.balance : payload;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }, []);

  const wsSend = useCallback((msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify(msg));
  }, []);

  const evaluateSignal = useCallback((arr) => {
    if (arr.length < 10) return { direction: null, strength: 0, message: 'Analyzing market...' };
    const recent = arr.slice(-10);
    const slope = recent[recent.length - 1] - recent[0];
    const strength = Math.min(99, Math.max(35, Math.round(Math.abs(slope) * 10)));
    const direction = strength >= prefs.minStrength ? (slope >= 0 ? 'CALL' : 'PUT') : null;
    if (!direction) return { direction: null, strength, message: 'Trade skipped (low confidence)' };
    return { direction, strength, message: prefs.aiMode ? 'Strategy switched by AI Mode' : 'Trade signal ready' };
  }, [prefs.aiMode, prefs.minStrength]);

  const placeTrade = useCallback((dir) => {
    if (!wsRef.current || conn !== 'connected' || buyingRef.current) return;
    buyingRef.current = true;
    const dur = parseDur(prefs.duration);
    wsSend({
      buy: 1,
      price: parseFloat(prefs.stake) || 1,
      parameters: {
        contract_type: dir,
        symbol: prefs.symbol,
        duration: dur.value,
        duration_unit: dur.unit,
        basis: 'stake',
        amount: parseFloat(prefs.stake) || 1,
        currency: 'USD',
      },
    });
    pushLog(`Trade executed: ${dir}`);
    toast('Trade executed', 'success');
  }, [conn, prefs.duration, prefs.stake, prefs.symbol, pushLog, toast, wsSend]);

  const connect = useCallback(() => {
    if (!prefs.token.trim()) { toast('Enter API token first', 'warn'); return; }
    if (wsRef.current) wsRef.current.close();
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    setConn('connecting');

    ws.onopen = () => {
      ws.send(JSON.stringify({ authorize: prefs.token.trim() }));
      pushLog('Connected, authorizing...');
    };

    ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.error) {
        buyingRef.current = false;
        pushLog(data.error.message, 'error');
        toast(data.error.message, 'error');
        return;
      }
      if (data.msg_type === 'authorize') {
        setConn('connected');
        const b = extractBalance(data.authorize);
        if (b !== null) setBalance(b);
        wsSend({ balance: 1, subscribe: 1 });
        wsSend({ ticks: prefs.symbol, subscribe: 1 });
      }
      if (data.msg_type === 'balance') {
        const b = extractBalance(data.balance);
        if (b !== null) setBalance(b);
      }
      if (data.msg_type === 'tick') {
        if (data.subscription?.id) tickSubId.current = data.subscription.id;
        const q = parseFloat(data.tick.quote);
        setPrices((prev) => {
          const next = [...prev, q].slice(-200);
          const s = evaluateSignal(next);
          setSignal(s);
          if (running && prefs.autoMode && s.direction && !openContract && !buyingRef.current) placeTrade(s.direction);
          return next;
        });
      }
      if (data.msg_type === 'buy') {
        wsSend({ proposal_open_contract: 1, contract_id: data.buy.contract_id, subscribe: 1 });
        wsSend({ balance: 1 });
      }
      if (data.msg_type === 'proposal_open_contract') {
        if (data.subscription?.id) contractSubId.current = data.subscription.id;
        const c = data.proposal_open_contract;
        const terminal = c.is_sold || c.status === 'won' || c.status === 'lost' || c.status === 'sold';
        if (terminal) {
          const profit = parseFloat(c.profit) || 0;
          const record = {
            id: c.contract_id,
            entry: c.entry_spot,
            outcome: profit >= 0 ? 'win' : 'loss',
            profit,
            direction: c.contract_type,
            timestamp: new Date().toLocaleString(),
            strategy: prefs.strategy,
          };
          setTrades((prev) => [record, ...prev.filter((t) => t.id !== record.id)].slice(0, 200));
          setOpenContract(null);
          buyingRef.current = false;
          wsSend({ balance: 1 });
        } else {
          setOpenContract(c);
        }
      }
    };

    ws.onclose = () => {
      setConn('disconnected');
      buyingRef.current = false;
      setOpenContract(null);
      pushLog('Disconnected', 'warn');
    };
  }, [evaluateSignal, extractBalance, openContract, placeTrade, prefs.autoMode, prefs.strategy, prefs.symbol, prefs.token, pushLog, running, toast, wsSend]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    tickSubId.current = null;
    contractSubId.current = null;
    buyingRef.current = false;
    setConn('disconnected');
    setRunning(false);
    setOpenContract(null);
  }, []);

  useEffect(() => {
    if (conn !== 'connected') return;
    if (tickSubId.current) wsSend({ forget: tickSubId.current });
    setPrices([]);
    wsSend({ ticks: prefs.symbol, subscribe: 1 });
    pushLog(`Strategy switched: symbol ${prefs.symbol}`);
  }, [conn, prefs.symbol, pushLog, wsSend]);

  const stats = useMemo(() => {
    const total = trades.length;
    const wins = trades.filter((t) => t.outcome === 'win').length;
    const pnl = trades.reduce((sum, t) => sum + t.profit, 0);
    return { total, wins, winRate: total ? Math.round((wins / total) * 100) : 0, pnl };
  }, [trades]);

  const applyProfile = useCallback((profile) => {
    if (profile === 'Aggressive') {
      setPrefs((p) => ({ ...p, profile, minStrength: 55, risk: 'High', stake: '2' }));
    } else if (profile === 'Safe') {
      setPrefs((p) => ({ ...p, profile, minStrength: 80, risk: 'Low', stake: '0.5' }));
    } else {
      setPrefs((p) => ({ ...p, profile }));
    }
    toast(`Profile saved: ${profile}`, 'success');
  }, [toast]);

  return {
    prefs,
    conn,
    running,
    setRunning,
    balance,
    prices,
    logs,
    signal,
    trades,
    stats,
    openContract,
    selectedTrade,
    setSelectedTrade,
    toasts,
    strategies,
    durations,
    updatePref,
    applyProfile,
    connect,
    disconnect,
    placeTrade,
  };
}

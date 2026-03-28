const items = ['Dashboard', 'Trades', 'Strategies', 'Settings', 'Stats'];

export default function Sidebar({ active, onChange }) {
  return (
    <aside className="card hidden h-fit w-56 p-3 lg:block">
      {items.map((item) => (
        <button
          key={item}
          className={`mb-2 w-full rounded-xl px-3 py-2 text-left text-sm transition ${active === item ? 'bg-mars-ai text-white shadow-glow' : 'bg-mars-surface text-mars-muted hover:text-mars-text'}`}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
    </aside>
  );
}

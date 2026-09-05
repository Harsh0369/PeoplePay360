/** Simple tab bar for modules with sub-views (Config, Time Off). */
export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="mb-5 flex gap-1 border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`relative px-4 py-2.5 text-sm font-medium transition ${
            active === t.key ? 'text-brand' : 'text-muted hover:text-ink'
          }`}
        >
          {t.label}
          {active === t.key && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand" />
          )}
        </button>
      ))}
    </div>
  );
}

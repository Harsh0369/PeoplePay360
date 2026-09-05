import { Search, Plus, LayoutList, LayoutGrid } from 'lucide-react';

/**
 * Standard toolbar for every module page: search box, optional view switch
 * (list/kanban), and a primary "New" action.
 */
export default function PageToolbar({
  search,
  onSearch,
  searchPlaceholder = 'Search…',
  view,
  onView, // if provided, shows list/kanban switch
  onNew,
  newLabel = 'New',
  children,
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-2.5 text-muted" />
        <input
          className="input w-72 pl-9"
          placeholder={searchPlaceholder}
          value={search ?? ''}
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>

      {children}

      <div className="ml-auto flex items-center gap-2">
        {onView && (
          <div className="flex overflow-hidden rounded-lg border border-line bg-white">
            <button
              className={`p-2 ${view === 'list' ? 'bg-brand-light text-brand' : 'text-muted hover:bg-black/5'}`}
              onClick={() => onView('list')}
              title="List view"
            >
              <LayoutList size={18} />
            </button>
            <button
              className={`p-2 ${view === 'kanban' ? 'bg-brand-light text-brand' : 'text-muted hover:bg-black/5'}`}
              onClick={() => onView('kanban')}
              title="Kanban view"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        )}
        {onNew && (
          <button className="btn-primary" onClick={onNew}>
            <Plus size={16} /> {newLabel}
          </button>
        )}
      </div>
    </div>
  );
}

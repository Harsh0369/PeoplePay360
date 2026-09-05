import { Inbox, Loader2 } from 'lucide-react';

/**
 * Reusable list view.
 * @param {Array}  columns  [{ key, label, render?(row), className? }]
 * @param {Array}  rows
 * @param {Function} [onRowClick]
 * @param {boolean} [loading]
 * @param {string}  [empty]  empty-state message
 */
export default function DataTable({ columns, rows = [], onRowClick, loading, empty = 'No records yet.' }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-slate-50/60 text-left text-xs uppercase tracking-wide text-muted">
              {columns.map((c) => (
                <th key={c.key} className={`px-4 py-3 font-medium ${c.className || ''}`}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-muted">
                  <Loader2 className="mx-auto mb-2 animate-spin" size={22} />
                  Loading…
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-muted">
                  <Inbox className="mx-auto mb-2" size={26} />
                  {empty}
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((row) => (
                <tr
                  key={row._id}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-line last:border-0 ${
                    onRowClick ? 'cursor-pointer hover:bg-brand-light/40' : ''
                  }`}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 ${c.className || ''}`}>
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { Construction } from 'lucide-react';

export default function Placeholder({ title }) {
  return (
    <div className="card grid place-items-center p-16 text-center">
      <Construction size={40} className="mb-4 text-muted" />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted">
        This module is scaffolded and on-theme. List / Form / Kanban views come next as we
        wire it to the API.
      </p>
    </div>
  );
}

import { X } from 'lucide-react';

/** Slide-over panel used as the Form view for every module. */
export default function FormDrawer({ open, title, subtitle, onClose, footer, children, width = 'max-w-2xl' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className={`absolute right-0 top-0 flex h-full w-full ${width} flex-col bg-canvas shadow-pop`}>
        <div className="flex items-start justify-between border-b border-line bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          </div>
          <button className="btn-ghost p-2" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-line bg-white px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Labeled form controls used across all forms. */
export function Field({ label, children, hint, required }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function TextInput(props) {
  return <input {...props} className={`input ${props.className || ''}`} />;
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={`input ${props.className || ''}`}>
      {children}
    </select>
  );
}

export function FormGrid({ children }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

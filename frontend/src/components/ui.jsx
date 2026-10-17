export function PageHeader({ title, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function Button({ children, tone = 'primary', className = '', ...props }) {
  const tones = {
    primary: 'bg-stone-900 text-white hover:bg-stone-700',
    secondary: 'border border-stone-300 bg-white hover:bg-stone-100',
    danger: 'bg-red-800 text-white hover:bg-red-700',
  };
  return (
    <button className={`rounded-md px-3 py-2 text-sm font-medium disabled:opacity-50 ${tones[tone]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-stone-700">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-700">{error}</span> : null}
    </label>
  );
}

export const controlClass = 'w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-800';

export function StatusBadge({ status }) {
  const tones = {
    Draft: 'bg-stone-200 text-stone-800',
    Sent: 'bg-sky-100 text-sky-900',
    Accepted: 'bg-emerald-100 text-emerald-900',
    Issued: 'bg-sky-100 text-sky-900',
    'Partially Paid': 'bg-amber-100 text-amber-950',
    Paid: 'bg-emerald-100 text-emerald-900',
    Rejected: 'bg-red-100 text-red-900',
    Expired: 'bg-stone-300 text-stone-800',
    Converted: 'bg-violet-100 text-violet-950',
    Overdue: 'bg-red-100 text-red-900',
    Cancelled: 'bg-stone-300 text-stone-700',
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tones[status] || 'bg-stone-100'}`}>{status}</span>;
}

export function Notice({ error, message }) {
  if (!error && !message) return null;
  return (
    <div className={`mb-4 rounded-md px-3 py-2 text-sm ${error ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-900'}`}>
      {error || message}
    </div>
  );
}

export function Empty({ children }) {
  return <div className="rounded-lg border border-dashed border-stone-300 bg-white px-4 py-10 text-center text-sm text-stone-500">{children}</div>;
}

export function Panel({ children, className = '' }) {
  return <section className={`rounded-xl border border-stone-200 bg-white p-4 shadow-sm ${className}`}>{children}</section>;
}

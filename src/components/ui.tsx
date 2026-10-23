import type { ReactNode } from 'react';

export const Link = ({ to, children, className = '' }: { to: string; children: ReactNode; className?: string }) => (
  <a href={`#${to}`} className={className}>{children}</a>
);

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}>{children}</section>
);

export const H2 = ({ children }: { children: ReactNode }) => <h2 className="mb-3 text-lg font-semibold text-slate-900">{children}</h2>;

export const PageTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <header className="mb-6">
    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
    {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
  </header>
);

type Tone = 'primary' | 'secondary' | 'danger';
const tones: Record<Tone, string> = {
  primary: 'bg-indigo-700 text-white hover:bg-indigo-800 disabled:bg-slate-300',
  secondary: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 disabled:text-slate-400',
  danger: 'bg-red-700 text-white hover:bg-red-800',
};
export const buttonClass = (tone: Tone = 'primary') =>
  `inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${tones[tone]}`;

export const Button = ({ tone = 'primary', className = '', ...rest }: { tone?: Tone } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={`${buttonClass(tone)} ${className}`} {...rest} />
);

export const LinkButton = ({ to, tone = 'primary', children }: { to: string; tone?: Tone; children: ReactNode }) => (
  <a href={`#${to}`} className={buttonClass(tone)}>{children}</a>
);

export const ProgressBar = ({ value, label, color = 'bg-indigo-600' }: { value: number; label: string; color?: string }) => (
  <div role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
    <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </div>
);

export const Stat = ({ label, value, hint, tone = 'text-slate-900' }: { label: string; value: ReactNode; hint?: ReactNode; tone?: string }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
    <p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p>
    {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
  </div>
);

export const Badge = ({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'green' | 'amber' | 'red' | 'indigo' }) => {
  const c = { slate: 'bg-slate-100 text-slate-700', green: 'bg-emerald-100 text-emerald-800', amber: 'bg-amber-100 text-amber-900', red: 'bg-red-100 text-red-800', indigo: 'bg-indigo-100 text-indigo-800' }[tone];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${c}`}>{children}</span>;
};

export const Alert = ({ tone, title, children }: { tone: 'red' | 'amber' | 'green' | 'blue'; title?: string; children: ReactNode }) => {
  const c = { red: 'border-red-300 bg-red-50 text-red-900', amber: 'border-amber-300 bg-amber-50 text-amber-900', green: 'border-emerald-300 bg-emerald-50 text-emerald-900', blue: 'border-sky-300 bg-sky-50 text-sky-900' }[tone];
  return (
    <div role={tone === 'red' ? 'alert' : 'status'} className={`rounded-lg border p-3 text-sm ${c}`}>
      {title && <p className="font-semibold">{title}</p>}
      <div>{children}</div>
    </div>
  );
};

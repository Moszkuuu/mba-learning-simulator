export type Unit = 'usd' | 'pct' | 'days' | 'units' | 'x' | 'years' | 'months' | 'num';

/** Parses user input like "$1,234.50", "35%", " 60 days". Returns null when not a valid finite number. */
export function parseNumericInput(raw: string): number | null {
  if (typeof raw !== 'string') return null;
  let s = raw.trim().replace(/[$,\s]/g, '').replace(/%$/, '').replace(/(days?|years?|yrs?|months?|x|units?|วัน|ปี|เดือน|หน่วย)$/i, '');
  if (s === '') return null;
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
}

export interface Tolerance {
  abs?: number;
  rel?: number;
}

export const DEFAULT_TOLERANCE: Record<Unit, Tolerance> = {
  usd: { abs: 1, rel: 0.01 },
  pct: { abs: 0.1 },
  days: { abs: 0.5 },
  units: { abs: 1, rel: 0.005 },
  x: { abs: 0.05 },
  years: { abs: 0.05 },
  months: { abs: 0.1 },
  num: { abs: 0.05, rel: 0.005 },
};

/** True when `given` is within the allowed rounding tolerance of `correct`. */
export function isWithinTolerance(given: number, correct: number, unit: Unit, tol?: Tolerance): boolean {
  const t = tol ?? DEFAULT_TOLERANCE[unit];
  const allowed = Math.max(t.abs ?? 0, (t.rel ?? 0) * Math.abs(correct));
  return Math.abs(given - correct) <= allowed + 1e-9;
}

export function formatValue(value: number, unit: Unit, lang: 'en' | 'th' = 'en'): string {
  const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  switch (unit) {
    case 'usd':
      return `${value < 0 ? '-' : ''}$${fmt(Math.abs(value), Number.isInteger(value) ? 0 : 2)}`;
    case 'pct':
      return `${fmt(value, Number.isInteger(value) ? 0 : 2)}%`;
    case 'days':
      return `${fmt(value, Number.isInteger(value) ? 0 : 1)} ${lang === 'th' ? 'วัน' : 'days'}`;
    case 'units':
      return `${fmt(value, Number.isInteger(value) ? 0 : 1)} ${lang === 'th' ? 'หน่วย' : 'units'}`;
    case 'x':
      return `${fmt(value, 2)}x`;
    case 'num':
      return fmt(value, Number.isInteger(value) ? 0 : 2);
    case 'months':
      return `${fmt(value, Number.isInteger(value) ? 0 : 1)} ${lang === 'th' ? 'เดือน' : 'months'}`;
    case 'years':
      return `${fmt(value, Number.isInteger(value) ? 0 : 2)} ${lang === 'th' ? 'ปี' : 'years'}`;
  }
}

export const money = (n: number): string =>
  `${n < 0 ? '-' : ''}$${Math.round(Math.abs(n)).toLocaleString('en-US')}`;

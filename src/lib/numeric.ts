export type Unit = 'usd' | 'pct' | 'days' | 'units' | 'x' | 'years' | 'months' | 'num';

export type NumericProblem = 'empty' | 'ambiguous-separator' | 'not-a-number';

/** Thai digits (๐-๙) and full-width digits (０-９) become ASCII digits; minus-like signs become "-"; zero-width characters are dropped. */
function toAsciiNumeric(raw: string): string {
  return raw
    .replace(/[​﻿]/g, '')
    .replace(/[๐-๙]/g, (c) => String(c.charCodeAt(0) - 0x0e50))
    .replace(/[０-９]/g, (c) => String(c.charCodeAt(0) - 0xff10))
    .replace(/[−‒–﹣－]/g, '-');
}

function readNumeric(raw: unknown): { value: number } | { problem: NumericProblem } {
  if (typeof raw !== 'string' || raw.trim() === '') return { problem: 'empty' };
  let s = toAsciiNumeric(raw).replace(/\$/g, '').trim().replace(/\s*%$/, '').replace(/\s*(days?|years?|yrs?|months?|x|units?|วัน|ปี|เดือน|หน่วย)$/i, '').trim();
  if (s === '') return { problem: 'not-a-number' };
  let negative = false;
  const bracketed = /^\((.*)\)$/.exec(s);
  if (bracketed) {
    negative = true;
    s = bracketed[1].trim();
    if (/^[+-]/.test(s)) return { problem: 'not-a-number' }; // "(-5)" would be a double negative: do not guess
  }
  const signed = /^([+-])\s*(.*)$/.exec(s); // "- 647,500" (a space after the sign) was accepted before and still is
  const sign = signed ? signed[1] : '';
  const body = signed ? signed[2] : s;
  let digits: string | null = null;
  if (/^(\d+\.?\d*|\.\d+)$/.test(body)) digits = body;
  // A comma or a space may only be a thousands separator in the usual groups of three: 1,234,567.5 or 1 234 567. Anything else
  // ("74,9", "1,23,456", "1.234,5") could mean a decimal comma or another grouping, so it is rejected rather than guessed.
  else if (/^\d{1,3}(,\d{3})+(\.\d*)?$/.test(body)) digits = body.replace(/,/g, '');
  else if (/^\d{1,3}(\s\d{3})+(\.\d*)?$/.test(body)) digits = body.replace(/\s/g, '');
  if (digits === null) return { problem: /^[\d.,\s]+$/.test(body) && /[,\s]/.test(body) ? 'ambiguous-separator' : 'not-a-number' };
  const n = Number(sign + digits);
  if (!Number.isFinite(n)) return { problem: 'not-a-number' };
  return { value: negative ? -n : n };
}

/**
 * Parses user input like "$1,234.50", "35%", " 60 days", "(25,000)", "−647,500" or "๖๔๗,๕๐๐" (Thai digits).
 * Returns null when the text is not a valid finite number, and also when it is ambiguous: "74,9" is never read as 749 or as 74.9.
 */
export function parseNumericInput(raw: string): number | null {
  const r = readNumeric(raw);
  return 'value' in r ? r.value : null;
}

/** Why parseNumericInput would return null (so a screen can ask the student to retype), or null when the text is a valid number. */
export function numericInputProblem(raw: string): NumericProblem | null {
  const r = readNumeric(raw);
  return 'problem' in r ? r.problem : null;
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

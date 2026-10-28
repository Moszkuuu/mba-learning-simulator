/**
 * Consulting Lab scoring and saving. Honest by design:
 *  - only numbers are checked automatically (25 of the 100 points);
 *  - the other 75 points are the student's own ratings against written descriptions, labelled as self-assessed;
 *  - the app never scores free text. It only runs mechanical completeness checks on it (length, quoted figures).
 */
import { isWithinTolerance, parseNumericInput } from './numeric';
import { CHECKS, CONSISTENCY, FIELDS, RATING_MAX, RUBRIC, VERIFIED_POINTS, Y2, cashFromDso, dso, type LabLevel } from '../lab/case';

export interface CheckResult { id: string; given: number | null; expected: number; correct: boolean; lessons: string[] }

/** Compares one typed answer with the expected value. Empty or unreadable input is simply "not correct". */
function grade(id: string, raw: string | undefined, expected: number, unit: Parameters<typeof isWithinTolerance>[2], tol: Parameters<typeof isWithinTolerance>[3], lessons: string[]): CheckResult {
  const given = raw ? parseNumericInput(raw) : null;
  return { id, given, expected, correct: given !== null && isWithinTolerance(given, expected, unit, tol), lessons };
}

/**
 * The sixth check of the Intermediate and Advanced levels: the student's own claim must follow from their own target.
 * answers.targetDso = the DSO they propose; answers.release = the cash they say that releases (Year 2 revenue, 365 days).
 */
export function checkConsistency(answers: Record<string, string>): CheckResult {
  const target = parseNumericInput(answers.targetDso ?? '');
  const expected = target !== null && target >= 0 && target < dso(Y2) ? cashFromDso(dso(Y2) - target) : 0;
  const given = parseNumericInput(answers.release ?? '');
  const ok = target !== null && target >= 0 && target < dso(Y2) && given !== null && isWithinTolerance(given, expected, 'usd', { abs: 1, rel: 0.03 });
  return { id: CONSISTENCY.id, given, expected, correct: ok, lessons: CONSISTENCY.lessons };
}

export function verifiedResults(level: LabLevel, answers: Record<string, string>): CheckResult[] {
  const out = CHECKS[level].map((c) => grade(c.id, answers[c.id], c.expected, c.unit, c.tol, c.lessons));
  if (level !== 'beginner') out.push(checkConsistency(answers));
  return out;
}

export const verifiedPoints = (results: CheckResult[]): number =>
  Math.round(((VERIFIED_POINTS * results.filter((r) => r.correct).length) / results.length) * 10) / 10;

/** Self-assessed points from ratings 0..RATING_MAX per criterion; missing or invalid ratings count as 0. */
export function selfPoints(ratings: Record<string, number>): number {
  const total = RUBRIC.reduce((sum, r) => {
    const v = ratings[r.id];
    const level = Number.isInteger(v) && v >= 0 && v <= RATING_MAX ? v : 0;
    return sum + (r.points * level) / RATING_MAX;
  }, 0);
  return Math.round(total * 10) / 10;
}

export const wordCount = (s: string): number => (s.trim() ? s.trim().split(/\s+/).length : 0);

/** Mechanical completeness checks only: enough words written in each field. These say nothing about quality. */
export function completeness(level: LabLevel, answers: Record<string, string>): { id: string; words: number; need: number; ok: boolean }[] {
  return FIELDS[level].map((f) => {
    const words = wordCount(answers[`text.${f.id}`] ?? '');
    return { id: f.id, words, need: f.minWords, ok: words >= f.minWords };
  });
}

/** How many distinct figures from the case documents the report quotes (mechanical match on numbers, e.g. 1,150,000 or 74.9). */
export function quotedFigures(text: string, known: number[]): number {
  const found = new Set<number>();
  for (const m of text.match(/\d[\d,]*(?:\.\d+)?/g) ?? []) {
    const n = parseFloat(m.replace(/,/g, ''));
    if (known.some((k) => Math.abs(k - n) <= Math.max(0.06, Math.abs(k) * 0.0005))) found.add(n);
  }
  return found.size;
}

// ---------------- saving (this browser only) ----------------
export interface LabSubmission {
  at: string;
  level: LabLevel;
  verified: number;
  self: number;
  total: number;
  correctIds: string[];
}
export interface LabDraft { answers: Record<string, string>; ratings: Record<string, number>; reflection: string }
export interface LabState { version: 1; drafts: Partial<Record<LabLevel, LabDraft>>; submissions: LabSubmission[] }

export const emptyLab = (): LabState => ({ version: 1, drafts: {}, submissions: [] });
export const labKey = (progressKey: string): string => `${progressKey}:lab`;

const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);

/** Never throws; unreadable or unknown data becomes an empty state (and is not written back until the student saves). */
export function loadLab(storage: Pick<Storage, 'getItem'> | undefined, key: string): LabState {
  try {
    const raw = storage?.getItem(key);
    if (!raw) return emptyLab();
    const d: unknown = JSON.parse(raw);
    if (!isRecord(d) || d.version !== 1 || !isRecord(d.drafts) || !Array.isArray(d.submissions)) return emptyLab();
    const levels: LabLevel[] = ['beginner', 'intermediate', 'advanced'];
    const drafts: LabState['drafts'] = {};
    for (const l of levels) {
      const dr = d.drafts[l];
      if (isRecord(dr) && isRecord(dr.answers) && isRecord(dr.ratings)) {
        drafts[l] = {
          answers: Object.fromEntries(Object.entries(dr.answers).filter(([, v]) => typeof v === 'string')) as Record<string, string>,
          ratings: Object.fromEntries(Object.entries(dr.ratings).filter(([, v]) => typeof v === 'number')) as Record<string, number>,
          reflection: typeof dr.reflection === 'string' ? dr.reflection : '',
        };
      }
    }
    const submissions = d.submissions.filter((s): s is LabSubmission =>
      isRecord(s) && typeof s.at === 'string' && levels.includes(s.level as LabLevel) && typeof s.verified === 'number' && typeof s.self === 'number' && typeof s.total === 'number' && Array.isArray(s.correctIds));
    return { version: 1, drafts, submissions };
  } catch {
    return emptyLab();
  }
}

/** Returns false when the browser refused to save (full or blocked storage), so the page can warn. */
export function saveLab(storage: Pick<Storage, 'setItem'> | undefined, key: string, state: LabState): boolean {
  try {
    if (!storage) return false;
    storage.setItem(key, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

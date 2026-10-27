/**
 * Merges two copies of one person's progress (e.g. this device and the cloud) without losing anything:
 * lists are unioned by id, per-item records keep the newer copy. Never used across different accounts.
 */
import { emptyProgress, type Progress } from '../progress';

const MAX_ATTEMPTS = 3000; // same cap the reducer applies
const MAX_ACTIVITY = 200;
const time = (iso: string): number => Date.parse(iso) || 0;

function unionById<T extends { id: string }>(a: T[], b: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const x of [...a, ...b]) if (!seen.has(x.id)) { seen.add(x.id); out.push(x); }
  return out;
}

function newerBy<T>(a: Record<string, T>, b: Record<string, T>, at: (v: T) => string): Record<string, T> {
  const out: Record<string, T> = { ...a };
  for (const [k, v] of Object.entries(b)) {
    const cur = out[k];
    if (!cur || time(at(v)) > time(at(cur))) out[k] = v;
  }
  return out;
}

/** `a` wins ties (pass the local copy first). */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const byTime = <T extends { at: string }>(list: T[]) => [...list].sort((x, y) => time(x.at) - time(y.at));
  const simState = a.simState && b.simState ? (b.simState.history.length > a.simState.history.length ? b.simState : a.simState) : a.simState ?? b.simState;
  return {
    ...emptyProgress(),
    completedLessons: [...new Set([...a.completedLessons, ...b.completedLessons])],
    lessonScores: newerBy(a.lessonScores, b.lessonScores, (s) => s.at),
    attempts: byTime(unionById(a.attempts, b.attempts)).slice(-MAX_ATTEMPTS),
    cards: newerBy(a.cards, b.cards, (c) => c.lastAt),
    exams: byTime(unionById(a.exams, b.exams)),
    simResults: byTime(unionById(a.simResults, b.simResults)),
    simState,
    activity: byTime(unionById(a.activity, b.activity)).reverse().slice(0, MAX_ACTIVITY),
  };
}

export const sameProgress = (a: Progress, b: Progress): boolean => JSON.stringify(a) === JSON.stringify(b);

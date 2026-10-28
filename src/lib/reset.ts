/**
 * Deletions that follow the person to every device. A reset leaves a small marker ("tombstone"):
 *   cutoff - everything created at or before this time is deleted wherever it is found;
 *   setAt  - when the marker was made. The newest marker wins, so a later restore (cutoff at the epoch) can supersede a reset.
 * Work done after the cutoff survives, so studying offline on another device after a reset elsewhere is not lost.
 * Markers live only in that person's own storage keys and in their own cloud row.
 */
import type { Progress } from './progress';

export interface Tombstone { cutoff: string; setAt: string }
export const EPOCH = '1970-01-01T00:00:00.000Z';

const time = (iso: string | undefined): number => (iso ? Date.parse(iso) || 0 : 0);

export function parseTombstone(x: unknown): Tombstone | undefined {
  if (typeof x !== 'object' || x === null) return undefined;
  const t = x as Record<string, unknown>;
  return typeof t.cutoff === 'string' && !Number.isNaN(Date.parse(t.cutoff)) && typeof t.setAt === 'string' && !Number.isNaN(Date.parse(t.setAt))
    ? { cutoff: t.cutoff, setAt: t.setAt }
    : undefined;
}

/** The marker that was made last; `a` wins a tie (pass the local one first). */
export function newerTombstone(a: Tombstone | undefined, b: Tombstone | undefined): Tombstone | undefined {
  if (!a || !b) return a ?? b;
  return time(b.setAt) > time(a.setAt) ? b : a;
}

export const sameTombstone = (a: Tombstone | undefined, b: Tombstone | undefined): boolean => a?.cutoff === b?.cutoff && a?.setAt === b?.setAt;

/** A marker that deletes nothing (used when the person deliberately restores a backup over an earlier reset). */
export const isRestore = (t: Tombstone): boolean => time(t.cutoff) <= 0;

export const resetMarker = (now = new Date()): Tombstone => ({ cutoff: now.toISOString(), setAt: now.toISOString() });
export const restoreMarker = (now = new Date()): Tombstone => ({ cutoff: EPOCH, setAt: now.toISOString() });

/**
 * Removes everything older than the cutoff from a progress object. A completed lesson is kept only if its score survives
 * (a completion always writes a score). A simulation in progress has no timestamp, so it is cleared only when `clearSim`
 * says this device is adopting the reset now.
 */
export function applyProgressReset(p: Progress, t: Tombstone | undefined, clearSim = false): Progress {
  if (!t || isRestore(t)) return p;
  const cut = time(t.cutoff);
  const after = (iso: string): boolean => time(iso) > cut;
  const lessonScores = Object.fromEntries(Object.entries(p.lessonScores).filter(([, s]) => after(s.at)));
  const next: Progress = {
    ...p,
    completedLessons: p.completedLessons.filter((id) => id in lessonScores),
    lessonScores,
    attempts: p.attempts.filter((a) => after(a.at)),
    cards: Object.fromEntries(Object.entries(p.cards).filter(([, c]) => after(c.lastAt))),
    exams: p.exams.filter((e) => after(e.at)),
    simResults: p.simResults.filter((r) => after(r.at)),
    simState: clearSim ? null : p.simState,
    activity: p.activity.filter((a) => after(a.at)),
  };
  const unchanged = JSON.stringify(next) === JSON.stringify(p);
  return unchanged ? p : next;
}

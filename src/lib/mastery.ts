/**
 * Competency mastery. Completing a lesson never grants mastery on its own.
 *
 * A competency is MASTERED when all of these hold:
 *  - at least 8 recorded attempts,
 *  - attempts at 2 or more difficulty levels,
 *  - level-weighted score over the last 10 attempts >= 80% (L1 x1, L2 x1.5, L3 x2; written answers count by rubric score),
 *  - at least one correct answer given >= 7 days after that question was first attempted (delayed retrieval),
 *  - the latest attempt is no more than 60 days old (otherwise status 'stale').
 */
import { COMPETENCIES, prerequisitesOf, competencyById } from '../curriculum/program';
import type { Level } from '../content/types';

export interface AttemptLike {
  questionId: string;
  competency: string;
  level: Level;
  correct: boolean;
  /** 0..1; 1 for a correct auto-graded answer, rubric fraction for written answers. */
  score: number;
  at: string;
}

export const LEVEL_WEIGHT: Record<Level, number> = { 1: 1, 2: 1.5, 3: 2 };
export const MASTERY = { minAttempts: 8, minLevels: 2, minAccuracy: 0.8, delayedDays: 7, staleDays: 60, weakBelow: 0.7, weakMinAttempts: 3 };
const DAY_MS = 86_400_000;

export type MasteryStatus = 'new' | 'learning' | 'weak' | 'mastered' | 'stale';

export interface CompetencyStat {
  competency: string;
  attempts: number;
  accuracy: number | null;
  levels: Level[];
  delayedCorrect: boolean;
  lastAt: string | null;
  status: MasteryStatus;
  /** 0-100 progress towards the mastery criteria (for display only). */
  progressPct: number;
}

export function competencyStat(all: AttemptLike[], competency: string, now: Date): CompetencyStat {
  const list = all.filter((a) => a.competency === competency).sort((a, b) => a.at.localeCompare(b.at));
  if (list.length === 0) {
    return { competency, attempts: 0, accuracy: null, levels: [], delayedCorrect: false, lastAt: null, status: 'new', progressPct: 0 };
  }
  const last10 = list.slice(-10);
  const wSum = last10.reduce((s, a) => s + LEVEL_WEIGHT[a.level], 0);
  const accuracy = last10.reduce((s, a) => s + LEVEL_WEIGHT[a.level] * a.score, 0) / wSum;
  const levels = [...new Set(list.map((a) => a.level))].sort() as Level[];

  const first = new Map<string, number>();
  for (const a of list) if (!first.has(a.questionId)) first.set(a.questionId, new Date(a.at).getTime());
  const delayedCorrect = list.some((a) => a.correct && new Date(a.at).getTime() - first.get(a.questionId)! >= MASTERY.delayedDays * DAY_MS);

  const lastAt = list[list.length - 1].at;
  const ageDays = (now.getTime() - new Date(lastAt).getTime()) / DAY_MS;
  const meets = list.length >= MASTERY.minAttempts && levels.length >= MASTERY.minLevels && accuracy >= MASTERY.minAccuracy && delayedCorrect;
  let status: MasteryStatus = 'learning';
  if (meets) status = ageDays > MASTERY.staleDays ? 'stale' : 'mastered';
  else if (list.length >= MASTERY.weakMinAttempts && accuracy < MASTERY.weakBelow) status = 'weak';

  const progressPct = Math.round(
    100 * (0.25 * Math.min(1, list.length / MASTERY.minAttempts) + 0.15 * Math.min(1, levels.length / MASTERY.minLevels) + 0.45 * Math.min(1, accuracy / MASTERY.minAccuracy) + 0.15 * (delayedCorrect ? 1 : 0)),
  );
  return { competency, attempts: list.length, accuracy, levels, delayedCorrect, lastAt, status, progressPct };
}

export function allCompetencyStats(attempts: AttemptLike[], now: Date): CompetencyStat[] {
  return COMPETENCIES.map((c) => competencyStat(attempts, c.id, now));
}

/** Available prerequisite competencies the student has not yet mastered. */
export function unmetPrerequisites(competencyId: string, stats: CompetencyStat[]): string[] {
  return prerequisitesOf(competencyId).filter((p) => {
    if (!competencyById(p)?.available) return false;
    return stats.find((s) => s.competency === p)?.status !== 'mastered';
  });
}

/** Weak competencies first (lowest accuracy), then stale ones. */
export function revisionPriorities(stats: CompetencyStat[]): CompetencyStat[] {
  return stats
    .filter((s) => s.status === 'weak' || s.status === 'stale')
    .sort((a, b) => (a.status === b.status ? (a.accuracy ?? 0) - (b.accuracy ?? 0) : a.status === 'weak' ? -1 : 1));
}

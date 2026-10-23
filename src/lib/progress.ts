import type { SimState, SimSummary } from './simulation';
import type { Level } from '../content/types';
import { ALL_LESSON_KEYS, questionKey } from '../content';
import { allCompetencyStats } from './mastery';
import { updateCard, type Card } from './srs';

export type AttemptContext = 'lesson' | 'practice' | 'review' | 'exam';

export interface Attempt {
  id: string;
  questionId: string;
  lessonId: string;
  competency: string;
  level: Level;
  correct: boolean;
  /** 0..1. Auto-graded answers are 0 or 1; written answers use the self-assessed rubric fraction. */
  score: number;
  given: string;
  at: string;
  context: AttemptContext;
}
export interface SimResult extends SimSummary {
  id: string;
  at: string;
}
/** Language-neutral so the history re-renders in whichever language is active. */
export interface Activity {
  id: string;
  at: string;
  kind: 'lesson' | 'simFinished' | 'simStarted' | 'exam' | 'review' | 'legacy';
  params: Record<string, string | number | boolean>;
}
export interface LessonScore {
  correct: number;
  total: number;
  at: string;
}
export interface ExamResult {
  id: string;
  at: string;
  correct: number;
  total: number;
  byCompetency: Record<string, { correct: number; total: number }>;
}
export interface Progress {
  version: 2;
  completedLessons: string[];
  lessonScores: Record<string, LessonScore>;
  attempts: Attempt[];
  /** Spaced-repetition state per question id. */
  cards: Record<string, Card>;
  exams: ExamResult[];
  simResults: SimResult[];
  simState: SimState | null;
  activity: Activity[];
}

export const STORAGE_KEY = 'mba-learning-simulator:v1';
export const PASS_SCORE = 0.7;
const MAX_ATTEMPTS = 3000;
const MAX_ACTIVITY = 200;

export const emptyProgress = (): Progress => ({
  version: 2, completedLessons: [], lessonScores: {}, attempts: [], cards: {}, exams: [], simResults: [], simState: null, activity: [],
});

const uid = (): string => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export type Action =
  | { type: 'attempt'; questionId: string; correct: boolean; score?: number; given: string; context: AttemptContext; now?: string }
  | { type: 'completeLesson'; lessonId: string; correct: number; total: number; now?: string }
  | { type: 'examResult'; correct: number; total: number; byCompetency: ExamResult['byCompetency']; now?: string }
  | { type: 'reviewDone'; correct: number; total: number; now?: string }
  | { type: 'saveSim'; state: SimState | null }
  | { type: 'finishSim'; result: SimSummary }
  | { type: 'simStarted' }
  | { type: 'replace'; progress: Progress }
  | { type: 'reset' };

const addActivity = (p: Progress, kind: Activity['kind'], params: Activity['params'], at = new Date().toISOString()): Activity[] =>
  [{ id: uid(), at, kind, params }, ...p.activity].slice(0, MAX_ACTIVITY);

export function reducer(p: Progress, a: Action): Progress {
  switch (a.type) {
    case 'attempt': {
      const key = questionKey(a.questionId);
      if (!key) return p; // unknown question id: ignore rather than corrupt statistics
      const at = a.now ?? new Date().toISOString();
      const score = a.score ?? (a.correct ? 1 : 0);
      const attempt: Attempt = { id: uid(), questionId: key.id, lessonId: key.lessonId, competency: key.competency, level: key.level, correct: a.correct, score, given: a.given, at, context: a.context };
      return {
        ...p,
        attempts: [...p.attempts, attempt].slice(-MAX_ATTEMPTS),
        cards: { ...p.cards, [key.id]: updateCard(p.cards[key.id], a.correct, at) },
      };
    }
    case 'completeLesson': {
      const first = !p.completedLessons.includes(a.lessonId);
      return {
        ...p,
        completedLessons: first ? [...p.completedLessons, a.lessonId] : p.completedLessons,
        lessonScores: { ...p.lessonScores, [a.lessonId]: { correct: a.correct, total: a.total, at: a.now ?? new Date().toISOString() } },
        activity: addActivity(p, 'lesson', { lessonId: a.lessonId, correct: a.correct, total: a.total, first }, a.now),
      };
    }
    case 'examResult':
      return {
        ...p,
        exams: [...p.exams, { id: uid(), at: a.now ?? new Date().toISOString(), correct: a.correct, total: a.total, byCompetency: a.byCompetency }],
        activity: addActivity(p, 'exam', { correct: a.correct, total: a.total }, a.now),
      };
    case 'reviewDone':
      return { ...p, activity: addActivity(p, 'review', { correct: a.correct, total: a.total }, a.now) };
    case 'saveSim':
      return { ...p, simState: a.state };
    case 'finishSim':
      return {
        ...p,
        simResults: [...p.simResults, { ...a.result, id: uid(), at: new Date().toISOString() }],
        activity: addActivity(p, 'simFinished', { status: a.result.status, equity: Math.round(a.result.finalEquity) }),
      };
    case 'simStarted':
      return { ...p, activity: addActivity(p, 'simStarted', {}) };
    case 'replace':
      return a.progress;
    case 'reset':
      return emptyProgress();
  }
}

// ---------- loading, migration ----------
interface V1Attempt { questionId: string; correct: boolean; given: string; at: string; context: 'lesson' | 'practice'; id?: string }

/** v1 -> v2: attach competency/level from the question bank and rebuild the spaced-repetition cards by replaying history. */
function migrateV1(d: Record<string, unknown>): Progress {
  const p = emptyProgress();
  p.completedLessons = Array.isArray(d.completedLessons) ? (d.completedLessons as string[]) : [];
  p.lessonScores = (d.lessonScores as Progress['lessonScores']) ?? {};
  p.simResults = Array.isArray(d.simResults) ? (d.simResults as SimResult[]) : [];
  p.simState = (d.simState as SimState | null) ?? null;
  p.activity = (Array.isArray(d.activity) ? (d.activity as { id: string; at: string; text: string }[]) : []).map((x) => ({ id: x.id, at: x.at, kind: 'legacy', params: { text: x.text } }));
  for (const old of (d.attempts as V1Attempt[]) ?? []) {
    const key = questionKey(old.questionId);
    if (!key) continue;
    p.attempts.push({ id: old.id ?? uid(), questionId: key.id, lessonId: key.lessonId, competency: key.competency, level: key.level, correct: !!old.correct, score: old.correct ? 1 : 0, given: String(old.given ?? ''), at: old.at, context: old.context });
    p.cards[key.id] = updateCard(p.cards[key.id], !!old.correct, old.at);
  }
  return p;
}

/** Defensive load: anything malformed falls back to an empty profile rather than crashing the app. */
export function parseProgress(raw: string | null): Progress {
  if (!raw) return emptyProgress();
  try {
    const d = JSON.parse(raw);
    if (!d || typeof d !== 'object' || !Array.isArray(d.attempts)) return emptyProgress();
    if (d.version === 1) return migrateV1(d);
    if (d.version !== 2) return emptyProgress();
    return { ...emptyProgress(), ...d };
  } catch {
    return emptyProgress();
  }
}

// ---------- derived statistics ----------
export const quizAccuracy = (p: Progress): number | null =>
  p.attempts.length ? (p.attempts.reduce((s, a) => s + a.score, 0) / p.attempts.length) * 100 : null;

export const competencyStats = (p: Progress, now = new Date()) => allCompetencyStats(p.attempts, now);

export function xp(p: Progress, now = new Date()): number {
  const mastered = competencyStats(p, now).filter((s) => s.status === 'mastered').length;
  return p.completedLessons.length * 100 + p.attempts.filter((a) => a.correct).length * 10 + p.simResults.filter((r) => r.status === 'completed').length * 300 + mastered * 200;
}

export const LEVELS = [
  { name: 'Newcomer', min: 0 },
  { name: 'Analyst', min: 150 },
  { name: 'Associate', min: 400 },
  { name: 'Manager', min: 800 },
  { name: 'Director', min: 1300 },
];
export function levelInfo(points: number) {
  let idx = 0;
  LEVELS.forEach((l, i) => { if (points >= l.min) idx = i; });
  const next = LEVELS[idx + 1];
  return {
    level: idx + 1,
    name: LEVELS[idx].name,
    xp: points,
    nextName: next?.name,
    toNext: next ? next.min - points : 0,
    pct: next ? ((points - LEVELS[idx].min) / (next.min - LEVELS[idx].min)) * 100 : 100,
  };
}

export const lessonProgressPct = (p: Progress): number =>
  (p.completedLessons.filter((id) => ALL_LESSON_KEYS.some((l) => l.id === id)).length / ALL_LESSON_KEYS.length) * 100;

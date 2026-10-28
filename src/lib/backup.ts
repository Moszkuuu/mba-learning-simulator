/**
 * Progress backup: export, strict validation of imports, and storage helpers that report failures
 * instead of swallowing them. The progress schema itself (see progress.ts) is unchanged; a backup is
 * the progress object wrapped in a small envelope. Raw progress JSON (the older export format, and
 * the v1 schema) is still accepted on import.
 */
import { emptyProgress, parseProgress, STORAGE_KEY, type Progress } from './progress';
import { hasLabContent, parseLab, withoutReset, type LabState } from './lab';

export const BACKUP_FORMAT = 'mba-lab-progress-backup';
export const BACKUP_FORMAT_VERSION = 1;

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  formatVersion: typeof BACKUP_FORMAT_VERSION;
  exportedAt: string;
  progress: Progress;
  /** Consulting Lab work. Optional, so older backup files stay valid and older app versions simply ignore it. */
  lab?: LabState;
}

export function createBackup(progress: Progress, now = new Date(), lab?: LabState): BackupFile {
  return { format: BACKUP_FORMAT, formatVersion: BACKUP_FORMAT_VERSION, exportedAt: now.toISOString(), progress, ...(lab && hasLabContent(lab) ? { lab: withoutReset(lab) } : {}) };
}

export const serializeBackup = (progress: Progress, now = new Date(), lab?: LabState): string => JSON.stringify(createBackup(progress, now, lab), null, 2);

export const backupFileName = (now = new Date()): string => `mba-lab-progress-${now.toISOString().slice(0, 10)}.json`;

export interface ProgressSummary {
  attempts: number;
  completedLessons: number;
  exams: number;
  simResults: number;
  reviewCards: number;
  activity: number;
  /** ISO time of the newest attempt, lesson score or activity entry; null when there is none. */
  lastActivity: string | null;
}

export function summarizeProgress(p: Progress): ProgressSummary {
  const stamps = [...p.attempts.map((a) => a.at), ...p.activity.map((a) => a.at), ...Object.values(p.lessonScores).map((s) => s.at)].filter((s) => typeof s === 'string' && !Number.isNaN(Date.parse(s)));
  return {
    attempts: p.attempts.length,
    completedLessons: p.completedLessons.length,
    exams: p.exams.length,
    simResults: p.simResults.length,
    reviewCards: Object.keys(p.cards).length,
    activity: p.activity.length,
    lastActivity: stamps.length ? stamps.reduce((a, b) => (Date.parse(a) >= Date.parse(b) ? a : b)) : null,
  };
}

export const hasProgress = (p: Progress): boolean =>
  p.attempts.length > 0 || p.completedLessons.length > 0 || p.exams.length > 0 || p.simResults.length > 0 || p.simState !== null || p.activity.length > 0;

export type BackupError = 'invalidJson' | 'notBackup' | 'unsupportedVersion' | 'malformed' | 'empty';
export type BackupResult =
  | { ok: true; progress: Progress; summary: ProgressSummary; exportedAt: string | null; upgraded: boolean; lab: LabState | null }
  | { ok: false; error: BackupError; detail?: string };

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isDate = (v: unknown): v is string => isStr(v) && !Number.isNaN(Date.parse(v));
const fail = (detail: string): BackupResult => ({ ok: false, error: 'malformed', detail });

/** Returns a description of the first problem found in a v2 progress object, or null when it is sound. */
function problemWith(d: Record<string, unknown>): string | null {
  if (!Array.isArray(d.completedLessons) || !d.completedLessons.every(isStr)) return 'completedLessons';
  if (!isObj(d.lessonScores) || !Object.values(d.lessonScores).every((s) => isObj(s) && isNum(s.correct) && isNum(s.total) && isDate(s.at))) return 'lessonScores';
  if (!Array.isArray(d.attempts)) return 'attempts';
  for (const [i, a] of d.attempts.entries()) {
    if (!isObj(a) || !isStr(a.questionId) || !isStr(a.lessonId) || !isStr(a.competency) || ![1, 2, 3].includes(a.level as number)
      || typeof a.correct !== 'boolean' || !isNum(a.score) || a.score < 0 || a.score > 1 || !isDate(a.at)) return `attempts[${i}]`;
  }
  if (!isObj(d.cards) || !Object.values(d.cards).every((c) => isObj(c) && isNum(c.box) && isDate(c.due) && isDate(c.firstAt) && isDate(c.lastAt) && isNum(c.seen))) return 'cards';
  if (!Array.isArray(d.exams) || !d.exams.every((e) => isObj(e) && isNum(e.correct) && isNum(e.total) && isDate(e.at))) return 'exams';
  if (!Array.isArray(d.simResults) || !d.simResults.every((r) => isObj(r) && isDate(r.at))) return 'simResults';
  if (d.simState !== null && !isObj(d.simState)) return 'simState';
  if (!Array.isArray(d.activity) || !d.activity.every((a) => isObj(a) && isDate(a.at) && isStr(a.kind))) return 'activity';
  return null;
}

/** Validates backup text without touching any stored progress. */
export function parseBackup(text: string): BackupResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'invalidJson' };
  }
  if (!isObj(data)) return { ok: false, error: 'notBackup' };

  let exportedAt: string | null = null;
  let raw: Record<string, unknown> = data;
  if (data.format !== undefined) {
    if (data.format !== BACKUP_FORMAT) return { ok: false, error: 'notBackup' };
    if (data.formatVersion !== BACKUP_FORMAT_VERSION) return { ok: false, error: 'unsupportedVersion', detail: String(data.formatVersion) };
    if (!isObj(data.progress)) return fail('progress');
    raw = data.progress;
    exportedAt = isDate(data.exportedAt) ? data.exportedAt : null;
  } else if (!Array.isArray(data.attempts) || data.version === undefined) {
    return { ok: false, error: 'notBackup' };
  }

  let progress: Progress;
  let upgraded = false;
  if (raw.version === 1) {
    if (!Array.isArray(raw.attempts)) return fail('attempts');
    progress = parseProgress(JSON.stringify(raw));
    upgraded = true;
  } else if (raw.version === 2) {
    const problem = problemWith(raw);
    if (problem) return fail(problem);
    const d = raw as unknown as Progress;
    progress = { ...emptyProgress(), completedLessons: d.completedLessons, lessonScores: d.lessonScores, attempts: d.attempts, cards: d.cards, exams: d.exams, simResults: d.simResults, simState: d.simState, activity: d.activity };
  } else {
    return { ok: false, error: 'unsupportedVersion', detail: String(raw.version) };
  }
  // Consulting Lab work travels next to the progress. Present-but-invalid Lab data rejects the file rather than being half-restored.
  let lab: LabState | null = null;
  if (data.lab !== undefined && data.lab !== null) {
    lab = parseLab(data.lab);
    if (!lab) return fail('lab');
    if (!hasLabContent(lab)) lab = null;
  }
  if (!hasProgress(progress) && !lab) return { ok: false, error: 'empty' };
  return { ok: true, progress, summary: summarizeProgress(progress), exportedAt, upgraded, lab };
}

// ---------- storage ----------
export type StorageIssue = 'unavailable' | 'writeFailed' | 'corrupt';
export const CORRUPT_COPY_KEY = `${STORAGE_KEY}:corrupt-copy`;

export function getStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export type SaveResult = { ok: true } | { ok: false; issue: 'unavailable' | 'writeFailed' };

export function saveProgress(progress: Progress, storage: Storage | null = getStorage(), key = STORAGE_KEY): SaveResult {
  if (!storage) return { ok: false, issue: 'unavailable' };
  try {
    storage.setItem(key, JSON.stringify(progress));
    return { ok: true };
  } catch {
    return { ok: false, issue: 'writeFailed' };
  }
}

/**
 * Loads saved progress exactly as before (parseProgress), but reports why it fell back to empty.
 * Stored text that cannot be read as progress is copied to CORRUPT_COPY_KEY (best effort) before the
 * app starts writing, so it is never silently destroyed.
 */
export function loadProgress(storage: Storage | null = getStorage(), key = STORAGE_KEY): { progress: Progress; issue: StorageIssue | null } {
  if (!storage) return { progress: emptyProgress(), issue: 'unavailable' };
  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return { progress: emptyProgress(), issue: 'unavailable' };
  }
  if (raw === null) return { progress: emptyProgress(), issue: null };
  const check = parseBackup(raw);
  if (!check.ok && check.error !== 'empty') {
    try {
      const copyKey = `${key}:corrupt-copy`;
      if (storage.getItem(copyKey) === null) storage.setItem(copyKey, raw);
    } catch { /* nothing more can be done; the banner still tells the user */ }
    return { progress: parseProgress(raw), issue: 'corrupt' };
  }
  return { progress: parseProgress(raw), issue: null };
}

/**
 * Persists a validated import. The caller must only replace the in-memory progress (and report success)
 * when this returns ok; on failure the previously stored progress is untouched.
 */
export function commitImport(progress: Progress, storage: Storage | null = getStorage(), key = STORAGE_KEY): SaveResult {
  return saveProgress(progress, storage, key);
}

import { describe, expect, it } from 'vitest';
import { emptyProgress, reducer, STORAGE_KEY, type Progress } from './progress';
import { ALL_QUESTION_KEYS } from '../content';
import {
  BACKUP_FORMAT, CORRUPT_COPY_KEY, backupFileName, commitImport, createBackup, hasProgress, loadProgress, parseBackup, saveProgress, serializeBackup, summarizeProgress,
} from './backup';

const T0 = '2026-01-10T09:00:00.000Z';
const T1 = '2026-01-20T09:00:00.000Z';

function sample(): Progress {
  const q = ALL_QUESTION_KEYS[0]!;
  let p = emptyProgress();
  p = reducer(p, { type: 'attempt', questionId: q.id, correct: true, given: 'x', context: 'lesson', now: T0 });
  p = reducer(p, { type: 'attempt', questionId: q.id, correct: false, given: 'y', context: 'practice', now: T1 });
  p = reducer(p, { type: 'completeLesson', lessonId: q.lessonId, correct: 7, total: 10, now: T1 });
  p = reducer(p, { type: 'examResult', correct: 6, total: 10, byCompetency: {}, now: T1 });
  return p;
}

/** In-memory Storage stand-in; `failWrites` / `failReads` simulate a full, blocked or unavailable store. */
class FakeStorage implements Storage {
  data = new Map<string, string>();
  failWrites = false;
  failReads = false;
  get length() { return this.data.size; }
  clear() { this.data.clear(); }
  key(i: number) { return [...this.data.keys()][i] ?? null; }
  removeItem(k: string) { this.data.delete(k); }
  getItem(k: string) { if (this.failReads) throw new Error('blocked'); return this.data.get(k) ?? null; }
  setItem(k: string, v: string) { if (this.failWrites) throw new DOMException('full', 'QuotaExceededError'); this.data.set(k, v); }
}

describe('export', () => {
  it('wraps the unchanged progress schema in a labelled envelope', () => {
    const p = sample();
    const file = JSON.parse(serializeBackup(p, new Date(T1)));
    expect(file.format).toBe(BACKUP_FORMAT);
    expect(file.formatVersion).toBe(1);
    expect(file.exportedAt).toBe(T1);
    expect(file.progress).toEqual(p);
    expect(file.progress.version).toBe(2);
  });
  it('names the file by date', () => {
    expect(backupFileName(new Date(T1))).toBe('mba-lab-progress-2026-01-20.json');
  });
  it('summarises counts and the latest activity', () => {
    const s = summarizeProgress(sample());
    expect(s).toMatchObject({ attempts: 2, completedLessons: 1, exams: 1, simResults: 0, reviewCards: 1 });
    expect(s.lastActivity).toBe(T1);
  });
});

describe('import', () => {
  it('accepts a valid backup and returns a preview summary', () => {
    const r = parseBackup(serializeBackup(sample(), new Date(T1)));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.summary.attempts).toBe(2);
      expect(r.exportedAt).toBe(T1);
      expect(r.upgraded).toBe(false);
    }
  });
  it('round-trips export -> import with identical progress', () => {
    const p = sample();
    const r = parseBackup(serializeBackup(p));
    expect(r.ok && r.progress).toEqual(p);
    const again = parseBackup(serializeBackup(r.ok ? r.progress : emptyProgress()));
    expect(again.ok && again.progress).toEqual(p);
  });
  it('still accepts the older raw-progress export', () => {
    const p = sample();
    const r = parseBackup(JSON.stringify(p));
    expect(r.ok && r.progress).toEqual(p);
  });
  it('upgrades a v1 backup through the existing migration', () => {
    const q = ALL_QUESTION_KEYS[0]!;
    const v1 = { version: 1, completedLessons: [q.lessonId], lessonScores: {}, attempts: [{ questionId: q.id, correct: true, given: 'a', at: T0, context: 'lesson' }], simResults: [], simState: null, activity: [] };
    const r = parseBackup(JSON.stringify(v1));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.upgraded).toBe(true);
      expect(r.progress.version).toBe(2);
      expect(r.progress.attempts[0]?.competency).toBe(q.competency);
      expect(Object.keys(r.progress.cards)).toEqual([q.id]);
    }
  });
  it('rejects invalid JSON', () => {
    expect(parseBackup('{not json')).toEqual({ ok: false, error: 'invalidJson' });
    expect(parseBackup('')).toEqual({ ok: false, error: 'invalidJson' });
  });
  it('rejects JSON that is not a progress backup', () => {
    for (const text of ['[]', '42', 'null', '{}', '{"hello":"world"}', JSON.stringify({ format: 'something-else' })]) {
      expect(parseBackup(text)).toMatchObject({ ok: false, error: 'notBackup' });
    }
  });
  it('rejects unsupported schema and envelope versions', () => {
    const p = sample();
    expect(parseBackup(JSON.stringify({ ...p, version: 3 }))).toMatchObject({ ok: false, error: 'unsupportedVersion', detail: '3' });
    expect(parseBackup(JSON.stringify({ ...p, version: 'two' }))).toMatchObject({ ok: false, error: 'unsupportedVersion' });
    expect(parseBackup(JSON.stringify({ ...createBackup(p), formatVersion: 2 }))).toMatchObject({ ok: false, error: 'unsupportedVersion', detail: '2' });
    expect(parseBackup(JSON.stringify(createBackup({ ...p, version: 9 } as unknown as Progress)))).toMatchObject({ ok: false, error: 'unsupportedVersion' });
  });
  it('rejects empty backups', () => {
    expect(parseBackup(serializeBackup(emptyProgress()))).toEqual({ ok: false, error: 'empty' });
    expect(parseBackup(JSON.stringify(emptyProgress()))).toEqual({ ok: false, error: 'empty' });
  });
  it('rejects damaged data instead of repairing it silently', () => {
    const p = sample();
    const bad = (mut: (d: Record<string, unknown>) => void) => {
      const d = JSON.parse(JSON.stringify(createBackup(p)));
      mut(d.progress);
      return parseBackup(JSON.stringify(d));
    };
    expect(bad((d) => { d.attempts = 'nope'; })).toMatchObject({ ok: false, error: 'malformed', detail: 'attempts' });
    expect(bad((d) => { (d.attempts as Record<string, unknown>[])[1]!.level = 7; })).toMatchObject({ ok: false, error: 'malformed', detail: 'attempts[1]' });
    expect(bad((d) => { (d.attempts as Record<string, unknown>[])[0]!.at = 'yesterday'; })).toMatchObject({ ok: false, error: 'malformed' });
    expect(bad((d) => { d.completedLessons = [1, 2]; })).toMatchObject({ ok: false, error: 'malformed', detail: 'completedLessons' });
    expect(bad((d) => { d.cards = []; })).toMatchObject({ ok: false, error: 'malformed', detail: 'cards' });
    expect(bad((d) => { delete d.exams; })).toMatchObject({ ok: false, error: 'malformed', detail: 'exams' });
  });
});

describe('existing progress protection', () => {
  it('parsing a backup never writes to storage or alters stored progress', () => {
    const store = new FakeStorage();
    const mine = sample();
    expect(saveProgress(mine, store).ok).toBe(true);
    const before = store.data.get(STORAGE_KEY);
    for (const text of ['{bad', '{}', serializeBackup(emptyProgress()), JSON.stringify({ ...mine, version: 3 }), serializeBackup(sample())]) parseBackup(text);
    expect(store.data.get(STORAGE_KEY)).toBe(before);
    expect(loadProgress(store).progress).toEqual(mine);
  });
  it('flags existing progress so the UI can demand confirmation', () => {
    expect(hasProgress(emptyProgress())).toBe(false);
    expect(hasProgress(sample())).toBe(true);
  });
  it('keeps unreadable stored data as a copy before the app overwrites it', () => {
    const store = new FakeStorage();
    store.data.set(STORAGE_KEY, '{"version":7,"attempts":[]}');
    const r = loadProgress(store);
    expect(r.issue).toBe('corrupt');
    expect(r.progress).toEqual(emptyProgress());
    expect(store.data.get(CORRUPT_COPY_KEY)).toBe('{"version":7,"attempts":[]}');
    store.data.set(STORAGE_KEY, 'garbage');
    loadProgress(store); // the first preserved copy is not overwritten by a later one
    expect(store.data.get(CORRUPT_COPY_KEY)).toBe('{"version":7,"attempts":[]}');
  });
});

describe('storage', () => {
  it('saves and loads progress unchanged', () => {
    const store = new FakeStorage();
    const p = sample();
    expect(saveProgress(p, store)).toEqual({ ok: true });
    expect(loadProgress(store)).toEqual({ progress: p, issue: null });
  });
  it('a first visit is not an error', () => {
    expect(loadProgress(new FakeStorage())).toEqual({ progress: emptyProgress(), issue: null });
    expect(loadProgress(new FakeStorage()).issue).toBeNull();
  });
  it('reports write failures (full or blocked storage)', () => {
    const store = new FakeStorage();
    store.failWrites = true;
    expect(saveProgress(sample(), store)).toEqual({ ok: false, issue: 'writeFailed' });
  });
  it('reports unavailable storage on save and load', () => {
    expect(saveProgress(sample(), null)).toEqual({ ok: false, issue: 'unavailable' });
    expect(loadProgress(null).issue).toBe('unavailable');
    const store = new FakeStorage();
    store.failReads = true;
    expect(loadProgress(store)).toEqual({ progress: emptyProgress(), issue: 'unavailable' });
  });
});

describe('regression: storage failure during import', () => {
  it('reports failure and leaves the previously stored progress intact', () => {
    const store = new FakeStorage();
    const mine = sample();
    saveProgress(mine, store);
    const incoming = parseBackup(serializeBackup(reducer(mine, { type: 'completeLesson', lessonId: 'other', correct: 1, total: 1, now: T1 })));
    expect(incoming.ok).toBe(true);
    store.failWrites = true;
    const r = commitImport(incoming.ok ? incoming.progress : emptyProgress(), store);
    expect(r).toEqual({ ok: false, issue: 'writeFailed' });
    store.failWrites = false;
    expect(loadProgress(store).progress).toEqual(mine);
  });
  it('reports failure when storage is unavailable', () => {
    expect(commitImport(sample(), null)).toEqual({ ok: false, issue: 'unavailable' });
  });
  it('stores a successful import so it survives a reload', () => {
    const store = new FakeStorage();
    saveProgress(emptyProgress(), store);
    const mine = sample();
    expect(commitImport(mine, store)).toEqual({ ok: true });
    expect(loadProgress(store).progress).toEqual(mine);
  });
  it('exporting does not touch stored data', () => {
    const store = new FakeStorage();
    const mine = sample();
    saveProgress(mine, store);
    const before = store.data.get(STORAGE_KEY);
    serializeBackup(loadProgress(store).progress);
    expect(store.data.get(STORAGE_KEY)).toBe(before);
    expect(store.data.size).toBe(1);
  });
});

/**
 * Consulting Lab scoring and saving. Honest by design:
 *  - only numbers are checked automatically (25 of the 100 points);
 *  - the other 75 points are the student's own ratings against written descriptions, labelled as self-assessed;
 *  - the app never scores free text. It only runs mechanical completeness checks on it (length, quoted figures).
 */
import { isWithinTolerance, parseNumericInput } from './numeric';
import { newerTombstone, parseTombstone, resetMarker, type Tombstone } from './reset';
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

// Word counting. Text without Thai is counted as before (runs of non-space characters), so English counts do not change.
// Thai is written without spaces between words, so text that contains Thai is split with Intl.Segmenter (the browser's Thai
// dictionary) and only word-like segments are counted (words, numbers such as 262,500, Latin terms such as DSO; not spaces or punctuation).
// Intl.Segmenter is not in the project's TypeScript lib (ES2020), hence the small local type.
interface WordSegmenter { segment(input: string): Iterable<{ segment: string; isWordLike?: boolean }> }
type SegmenterCtor = new (locales?: string | string[], options?: { granularity: 'word' }) => WordSegmenter;

const HAS_THAI = /\p{Script=Thai}/u;
const THAI_RUN = /\p{Script=Thai}+/gu;
const COMBINING_MARK = /\p{M}/u;
/** Thai base letters per word (about 2.8 on sample answers). Used only when Intl.Segmenter is unavailable. */
export const THAI_LETTERS_PER_WORD = 3;

let wordSegmenter: WordSegmenter | null | undefined;
function getWordSegmenter(): WordSegmenter | null {
  if (wordSegmenter === undefined) {
    const Ctor = (Intl as unknown as { Segmenter?: SegmenterCtor }).Segmenter;
    try { wordSegmenter = Ctor ? new Ctor('th', { granularity: 'word' }) : null; } catch { wordSegmenter = null; }
  }
  return wordSegmenter;
}

const spaceSeparatedCount = (s: string): number => (s.trim() ? s.trim().split(/\s+/).length : 0);

/** Estimate for runtimes without Intl.Segmenter: each Thai run counts its base letters (no vowel or tone marks) divided by 3, rounded up. */
export function thaiFallbackCount(text: string): number {
  let thai = 0;
  const rest = text.replace(THAI_RUN, (run) => {
    thai += Math.ceil([...run].filter((c) => !COMBINING_MARK.test(c)).length / THAI_LETTERS_PER_WORD);
    return ' ';
  });
  return thai + spaceSeparatedCount(rest);
}

export function wordCount(s: string): number {
  const text = s.normalize('NFC').trim();
  if (!text) return 0;
  if (!HAS_THAI.test(text)) return spaceSeparatedCount(text);
  const segmenter = getWordSegmenter();
  if (!segmenter) return thaiFallbackCount(text);
  let n = 0;
  for (const part of segmenter.segment(text)) if (part.isWordLike) n++;
  return n;
}

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

// ---------------- saving, merging and syncing ----------------
export interface LabSubmission {
  at: string;
  level: LabLevel;
  verified: number;
  self: number;
  total: number;
  correctIds: string[];
  /** When the self-ratings were last changed (a submission is edited after it is made). */
  updatedAt?: string;
}
export interface LabDraft { answers: Record<string, string>; ratings: Record<string, number>; reflection: string; updatedAt?: string }
/** An older version of a draft that lost a conflict between two devices. It is kept so nothing is silently lost. */
export interface EarlierDraft { level: LabLevel; savedAt: string; draft: LabDraft }
export interface LabState {
  version: 1;
  drafts: Partial<Record<LabLevel, LabDraft>>;
  submissions: LabSubmission[];
  earlier?: EarlierDraft[];
  /** Left by "Reset Consulting Lab work": work made at or before the cutoff is deleted on every device. */
  reset?: Tombstone;
}

export const emptyLab = (): LabState => ({ version: 1, drafts: {}, submissions: [] });
export const labKey = (progressKey: string): string => `${progressKey}:lab`;
const LEVELS: LabLevel[] = ['beginner', 'intermediate', 'advanced'];
const MAX_EARLIER_PER_LEVEL = 5;

const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const stamp = (s: string | undefined): number => (s ? Date.parse(s) || 0 : 0);

function parseDraft(dr: unknown): LabDraft | null {
  if (!isRecord(dr) || !isRecord(dr.answers) || !isRecord(dr.ratings)) return null;
  const d: LabDraft = {
    answers: Object.fromEntries(Object.entries(dr.answers).filter(([, v]) => typeof v === 'string')) as Record<string, string>,
    ratings: Object.fromEntries(Object.entries(dr.ratings).filter(([, v]) => typeof v === 'number')) as Record<string, number>,
    reflection: typeof dr.reflection === 'string' ? dr.reflection : '',
  };
  if (typeof dr.updatedAt === 'string' && !Number.isNaN(Date.parse(dr.updatedAt))) d.updatedAt = dr.updatedAt;
  return d;
}

/**
 * Reads Consulting Lab work from untrusted data (storage, a backup file or the cloud). Returns null when the data is not Lab
 * data at all; malformed entries inside it are dropped rather than trusted.
 */
export function parseLab(d: unknown): LabState | null {
  if (!isRecord(d) || d.version !== 1 || !isRecord(d.drafts) || !Array.isArray(d.submissions)) return null;
  const drafts: LabState['drafts'] = {};
  for (const l of LEVELS) { const dr = parseDraft(d.drafts[l]); if (dr) drafts[l] = dr; }
  const submissions = d.submissions.filter((s): s is LabSubmission =>
    isRecord(s) && typeof s.at === 'string' && LEVELS.includes(s.level as LabLevel) && typeof s.verified === 'number' && typeof s.self === 'number' && typeof s.total === 'number' && Array.isArray(s.correctIds)
    && (s.updatedAt === undefined || typeof s.updatedAt === 'string'));
  const earlier: EarlierDraft[] = [];
  if (Array.isArray(d.earlier)) {
    for (const e of d.earlier) {
      const dr = isRecord(e) ? parseDraft(e.draft) : null;
      if (isRecord(e) && dr && typeof e.savedAt === 'string' && LEVELS.includes(e.level as LabLevel)) earlier.push({ level: e.level as LabLevel, savedAt: e.savedAt, draft: dr });
    }
  }
  const reset = parseTombstone(d.reset);
  return { version: 1, drafts, submissions, ...(earlier.length ? { earlier } : {}), ...(reset ? { reset } : {}) };
}

/** Never throws; unreadable or unknown data becomes an empty state (and is not written back until the student saves). */
export function loadLab(storage: Pick<Storage, 'getItem'> | undefined, key: string): LabState {
  try {
    const raw = storage?.getItem(key);
    if (!raw) return emptyLab();
    return parseLab(JSON.parse(raw)) ?? emptyLab();
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

const draftIsEmpty = (d: LabDraft): boolean => Object.values(d.answers).every((v) => !v.trim()) && Object.keys(d.ratings).length === 0 && !d.reflection.trim();
const sameDraft = (a: LabDraft, b: LabDraft): boolean => JSON.stringify([a.answers, a.ratings, a.reflection]) === JSON.stringify([b.answers, b.ratings, b.reflection]);
const subKey = (s: LabSubmission): string => `${s.level}|${s.at}`;

export const hasLabContent = (l: LabState): boolean => l.submissions.length > 0 || Object.values(l.drafts).some((d) => d && !draftIsEmpty(d));

export function summarizeLab(l: LabState): { submissions: number; drafts: number } {
  return { submissions: l.submissions.length, drafts: Object.values(l.drafts).filter((d) => d && !draftIsEmpty(d)).length };
}

/**
 * Combines two copies of one person's Lab work without losing anything (`a` wins ties; pass the local copy first):
 *  - submissions are unioned; for the same submission the later edit of its self-ratings wins;
 *  - for each level the more recently edited draft becomes the draft, and the other one is kept under "earlier versions".
 */
export function mergeLab(a: LabState, b: LabState): LabState {
  // A reset on either side deletes older work on both. Work made after the cutoff survives.
  const reset = newerTombstone(a.reset, b.reset);
  const cut = reset ? stamp(reset.cutoff) : -1;
  const alive = (iso: string | undefined): boolean => !reset || stamp(iso) > cut;
  const subs = new Map<string, LabSubmission>();
  for (const s of [...a.submissions, ...b.submissions].filter((x) => alive(x.updatedAt ?? x.at))) {
    const cur = subs.get(subKey(s));
    if (!cur || stamp(s.updatedAt ?? s.at) > stamp(cur.updatedAt ?? cur.at)) subs.set(subKey(s), s);
  }
  const drafts: LabState['drafts'] = {};
  const earlier: EarlierDraft[] = [...(a.earlier ?? []), ...(b.earlier ?? [])].filter((e) => alive(e.savedAt));
  for (const l of LEVELS) {
    const live = (d: LabDraft | undefined): LabDraft | undefined => (d && !draftIsEmpty(d) && alive(d.updatedAt) ? d : undefined);
    const da = live(a.drafts[l]);
    const db = live(b.drafts[l]);
    if (!da || !db) { const only = da ?? db; if (only) drafts[l] = only; continue; }
    if (sameDraft(da, db)) { drafts[l] = stamp(db.updatedAt) > stamp(da.updatedAt) ? db : da; continue; }
    const bWins = stamp(db.updatedAt) > stamp(da.updatedAt);
    const [win, lose] = bWins ? [db, da] : [da, db];
    drafts[l] = win;
    earlier.push({ level: l, savedAt: lose.updatedAt ?? '', draft: lose });
  }
  // Keep the newest few earlier versions per level, without duplicates, and never one identical to the current draft.
  const seen = new Set<string>();
  const keptEarlier: EarlierDraft[] = [];
  for (const e of [...earlier].sort((x, y) => stamp(y.savedAt) - stamp(x.savedAt))) {
    const k = `${e.level}|${JSON.stringify([e.draft.answers, e.draft.ratings, e.draft.reflection])}`;
    const cur = drafts[e.level];
    if (seen.has(k) || (cur && sameDraft(cur, e.draft)) || keptEarlier.filter((x) => x.level === e.level).length >= MAX_EARLIER_PER_LEVEL) continue;
    seen.add(k);
    keptEarlier.push(e);
  }
  return {
    version: 1,
    drafts,
    submissions: [...subs.values()].sort((x, y) => stamp(x.at) - stamp(y.at)),
    ...(keptEarlier.length ? { earlier: keptEarlier } : {}),
    ...(reset ? { reset } : {}),
  };
}

/** "Reset Consulting Lab work": nothing left, and a marker so older copies on other devices cannot bring work back. */
export const resetLabState = (signedIn: boolean, now = new Date()): LabState => ({ ...emptyLab(), ...(signedIn ? { reset: resetMarker(now) } : {}) });

/** A copy without the deletion marker (backup files describe work, not deletions). */
export const withoutReset = (l: LabState): LabState => { const { reset: _reset, ...rest } = l; return rest; };

/**
 * Work that arrives from outside on purpose (a backup file, or guest work the student chose to copy in) is stamped as made now,
 * so an earlier reset does not delete it, and it never carries deletion markers of its own into someone else's account.
 */
export function adoptLab(lab: LabState, now = new Date()): LabState {
  const at = now.toISOString();
  const drafts: LabState['drafts'] = {};
  for (const l of LEVELS) { const d = lab.drafts[l]; if (d && !draftIsEmpty(d)) drafts[l] = { ...d, updatedAt: at }; }
  return {
    version: 1,
    drafts,
    submissions: lab.submissions.map((s) => ({ ...s, updatedAt: at })),
    ...(lab.earlier?.length ? { earlier: lab.earlier.map((e) => ({ ...e, savedAt: at })) } : {}),
  };
}

export const sameLab = (a: LabState | undefined, b: LabState | undefined): boolean => JSON.stringify(a ?? emptyLab()) === JSON.stringify(b ?? emptyLab());

/** Self-assessed points count only when every written field has its minimum length, so an empty answer cannot score. */
export function effectiveSelfPoints(level: LabLevel, answers: Record<string, string>, ratings: Record<string, number>): number {
  return completeness(level, answers).every((c) => c.ok) ? selfPoints(ratings) : 0;
}

/** Window events: the Lab page tells the sync code it changed, and the sync code tells the page it merged newer work. */
export const LAB_CHANGED = 'mba-lab:changed';
export const LAB_SYNCED = 'mba-lab:synced';
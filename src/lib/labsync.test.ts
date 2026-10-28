import { describe, expect, it } from 'vitest';
import { ALL_QUESTION_KEYS } from '../content';
import { emptyProgress, reducer, type Progress } from './progress';
import { createBackup, parseBackup, serializeBackup } from './backup';
import { CloudDataError, syncProgress, type CloudData, type CloudRow, type CloudStore } from './cloud/sync';
import { effectiveSelfPoints, emptyLab, hasLabContent, mergeLab, sameLab, type LabDraft, type LabState, type LabSubmission } from './lab';

const Q = ALL_QUESTION_KEYS[0]!;
const answered = (p: Progress, day: number) => reducer(p, { type: 'attempt', questionId: Q.id, correct: true, given: 'x', context: 'practice', now: `2026-05-${String(day).padStart(2, '0')}T09:00:00.000Z` });
const draft = (text: string, at: string): LabDraft => ({ answers: { 'text.why': text }, ratings: {}, reflection: '', updatedAt: at });
const lab = (drafts: LabState['drafts'] = {}, submissions: LabSubmission[] = [], earlier?: LabState['earlier']): LabState => ({ version: 1, drafts, submissions, ...(earlier ? { earlier } : {}) });
const sub = (at: string, self = 0, updatedAt?: string): LabSubmission => ({ at, level: 'beginner', verified: 25, self, total: 25 + self, correctIds: ['ocf'], ...(updatedAt ? { updatedAt } : {}) });

/** A fake cloud row with revision checking, like the real store. */
function cloud(initial: CloudData | null) {
  let row: CloudRow | null = initial ? { data: JSON.parse(JSON.stringify(initial)), revision: 1 } : null;
  const log: { kind: string; data: CloudData }[] = [];
  const store: CloudStore = {
    fetch: async () => (row ? { data: JSON.parse(JSON.stringify(row.data)), revision: row.revision } : null),
    insert: async (d) => { if (row) return 'conflict'; row = { data: JSON.parse(JSON.stringify(d)), revision: 1 }; log.push({ kind: 'insert', data: d }); return 'ok'; },
    update: async (d, rev) => { if (!row || row.revision !== rev) return 'conflict'; row = { data: JSON.parse(JSON.stringify(d)), revision: rev + 1 }; log.push({ kind: 'update', data: d }); return 'ok'; },
  };
  return { store, row: () => row, log, setRow: (r: CloudRow | null) => { row = r; } };
}

describe('Consulting Lab merging', () => {
  it('keeps every submission from both devices and the latest edit of a submission\'s ratings', () => {
    const a = lab({}, [sub('2026-05-01T10:00:00Z', 10, '2026-05-01T11:00:00Z'), sub('2026-05-02T10:00:00Z')]);
    const b = lab({}, [sub('2026-05-01T10:00:00Z', 40, '2026-05-01T12:00:00Z'), sub('2026-05-03T10:00:00Z')]);
    const m = mergeLab(a, b);
    expect(m.submissions.map((s) => s.at)).toEqual(['2026-05-01T10:00:00Z', '2026-05-02T10:00:00Z', '2026-05-03T10:00:00Z']);
    expect(m.submissions[0]!.self).toBe(40); // the later rating edit wins
  });

  it('never loses a draft when two devices edited the same level: the newer is current, the older is kept', () => {
    const a = lab({ beginner: draft('laptop text', '2026-05-01T10:00:00Z') });
    const b = lab({ beginner: draft('phone text', '2026-05-01T12:00:00Z') });
    const m = mergeLab(a, b);
    expect(m.drafts.beginner!.answers['text.why']).toBe('phone text');
    expect(m.earlier).toHaveLength(1);
    expect(m.earlier![0]!.draft.answers['text.why']).toBe('laptop text');
    // Merging the other way round reaches the same result, so two devices converge.
    const r = mergeLab(b, a);
    expect(r.drafts.beginner!.answers['text.why']).toBe('phone text');
    expect(r.earlier![0]!.draft.answers['text.why']).toBe('laptop text');
  });

  it('is idempotent and treats an empty draft as no draft (no false conflict)', () => {
    const a = lab({ beginner: draft('text', '2026-05-01T10:00:00Z') }, [sub('2026-05-01T10:00:00Z')]);
    expect(sameLab(mergeLab(a, a), a)).toBe(true);
    const empty = lab({ beginner: { answers: {}, ratings: {}, reflection: '', updatedAt: '2026-06-01T00:00:00Z' } });
    const m = mergeLab(a, empty);
    expect(m.drafts.beginner!.answers['text.why']).toBe('text');
    expect(m.earlier).toBeUndefined();
  });

  it('caps the earlier versions kept per level', () => {
    let m = lab({ beginner: draft('v0', '2026-05-01T00:00:00Z') });
    for (let i = 1; i <= 9; i++) m = mergeLab(m, lab({ beginner: draft(`v${i}`, `2026-05-0${i}T01:00:00Z`) }));
    expect(m.drafts.beginner!.answers['text.why']).toBe('v9');
    expect(m.earlier!.length).toBeLessThanOrEqual(5);
  });

  it('only counts self-assessed points when every written field is long enough', () => {
    const ratings = { diagnosis: 3, reasoning: 3, recommendations: 3, risk: 3, feasibility: 3, communication: 3 };
    expect(effectiveSelfPoints('beginner', {}, ratings)).toBe(0);
    const full = { 'text.why': 'a b c d e f g h i j', 'text.movers': 'a b c d e', 'text.options': 'a b c d e f g h i j k l', 'text.first': 'a b c d e f g h' };
    expect(effectiveSelfPoints('beginner', full, ratings)).toBe(75);
  });
});

describe('Consulting Lab cloud sync', () => {
  const dev = (n: number) => answered(emptyProgress(), n);

  it('restores Lab work on a second device that has none, and does not push when nothing changed', async () => {
    const c = cloud(null);
    const L = lab({ beginner: draft('written on the laptop', '2026-05-01T10:00:00Z') }, [sub('2026-05-01T09:00:00Z', 20)]);
    await syncProgress(dev(1), c.store, 'merge', L);
    const phone = await syncProgress(emptyProgress(), c.store, 'merge', emptyLab());
    expect(phone.lab!.drafts.beginner!.answers['text.why']).toBe('written on the laptop');
    expect(phone.lab!.submissions).toHaveLength(1);
    const again = await syncProgress(phone.progress, c.store, 'merge', phone.lab);
    expect(again.pushed).toBe(false);
  });

  it('keeps work from both devices when they sync one after the other', async () => {
    const c = cloud(null);
    await syncProgress(dev(1), c.store, 'merge', lab({}, [sub('2026-05-01T09:00:00Z')]));
    const b = await syncProgress(dev(2), c.store, 'merge', lab({}, [sub('2026-05-02T09:00:00Z')]));
    expect(b.lab!.submissions).toHaveLength(2);
    const a = await syncProgress(dev(1), c.store, 'merge', lab({}, [sub('2026-05-01T09:00:00Z')]));
    expect(a.lab!.submissions).toHaveLength(2);
  });

  it('retries after a stale write without dropping the Lab work', async () => {
    const c = cloud(null);
    await syncProgress(dev(1), c.store, 'merge', lab({}, [sub('2026-05-01T09:00:00Z')]));
    const realUpdate = c.store.update;
    let interfered = false;
    c.store.update = async (d, rev) => {
      if (!interfered) { interfered = true; await realUpdate({ ...dev(3), lab: lab({}, [sub('2026-05-03T09:00:00Z')]) }, rev); } // another device wins the race
      return realUpdate(d, rev);
    };
    const r = await syncProgress(dev(2), c.store, 'merge', lab({}, [sub('2026-05-02T09:00:00Z')]));
    expect(r.lab!.submissions.map((s) => s.at).sort()).toEqual(['2026-05-01T09:00:00Z', '2026-05-02T09:00:00Z', '2026-05-03T09:00:00Z']);
    expect((c.row()!.data as CloudData).lab!.submissions).toHaveLength(3);
  });

  it('carries the cloud Lab work over unchanged when a caller does not pass any (older code paths)', async () => {
    const c = cloud({ ...dev(1), lab: lab({}, [sub('2026-05-01T09:00:00Z')]) });
    await syncProgress(dev(5), c.store); // progress changed, no Lab argument
    expect((c.row()!.data as CloudData).lab!.submissions).toHaveLength(1);
  });

  it('heals itself if an older app version rewrote the row without the Lab work', async () => {
    const c = cloud(null);
    const L = lab({}, [sub('2026-05-01T09:00:00Z', 30)]);
    await syncProgress(dev(1), c.store, 'merge', L);
    // An old browser tab writes progress only (it cannot see the Lab data).
    c.setRow({ data: JSON.parse(JSON.stringify(dev(2))), revision: c.row()!.revision + 1 });
    expect((c.row()!.data as CloudData).lab).toBeUndefined();
    // The device that still has the Lab work saved locally puts it back on its next sync.
    const r = await syncProgress(dev(2), c.store, 'merge', L);
    expect(r.pushed).toBe(true);
    expect((c.row()!.data as CloudData).lab!.submissions).toHaveLength(1);
  });

  it('merges Lab work even when progress is deliberately overwritten (reset or import)', async () => {
    const c = cloud({ ...dev(1), lab: lab({}, [sub('2026-05-01T09:00:00Z')]) });
    const r = await syncProgress(emptyProgress(), c.store, 'overwrite', lab({}, [sub('2026-05-02T09:00:00Z')]));
    expect(r.progress.attempts).toHaveLength(0);
    expect(r.lab!.submissions).toHaveLength(2);
  });

  it('refuses to write over cloud Lab data it cannot read', async () => {
    const c = cloud({ ...dev(1), lab: { version: 99 } as unknown as LabState });
    await expect(syncProgress(dev(2), c.store, 'merge', lab({}, [sub('2026-05-02T09:00:00Z')]))).rejects.toBeInstanceOf(CloudDataError);
    expect(c.log).toHaveLength(0);
  });

  it('keeps one account\'s Lab work out of another account\'s row (each store addresses only its own row)', async () => {
    const alice = cloud(null), bob = cloud(null);
    await syncProgress(dev(1), alice.store, 'merge', lab({ beginner: draft('alice only', '2026-05-01T10:00:00Z') }));
    const b = await syncProgress(dev(1), bob.store, 'merge', emptyLab());
    expect(JSON.stringify(bob.row()?.data ?? {})).not.toContain('alice only');
    expect(b.lab === undefined || !hasLabContent(b.lab)).toBe(true);
  });

  it('does not store an empty Lab section', async () => {
    const c = cloud(null);
    await syncProgress(dev(1), c.store, 'merge', emptyLab());
    expect((c.row()!.data as CloudData).lab).toBeUndefined();
  });
});

describe('Consulting Lab in backups', () => {
  const L = lab({ beginner: draft('my draft', '2026-05-01T10:00:00Z') }, [sub('2026-05-01T09:00:00Z', 20)]);
  const P = answered(emptyProgress(), 1);

  it('round-trips through export and import, and older files without Lab data still import', () => {
    const r = parseBackup(serializeBackup(P, new Date('2026-05-02T00:00:00Z'), L));
    expect(r.ok && r.lab && r.lab.submissions.length).toBe(1);
    expect(r.ok && r.progress.attempts.length).toBe(1);
    const old = parseBackup(JSON.stringify({ format: 'mba-lab-progress-backup', formatVersion: 1, exportedAt: '2026-05-02T00:00:00Z', progress: P }));
    expect(old.ok && old.lab).toBeNull();
    expect(old.ok && old.progress.attempts.length).toBe(1);
  });

  it('leaves the file shape unchanged when there is no Lab work (older app versions read it as before)', () => {
    expect(Object.keys(createBackup(P, new Date(), emptyLab()))).not.toContain('lab');
    expect(Object.keys(createBackup(P, new Date(), L))).toContain('lab');
  });

  it('accepts a file holding only Lab work (progress then stays empty), and rejects an empty file', () => {
    const r = parseBackup(serializeBackup(emptyProgress(), new Date(), L));
    expect(r.ok && r.lab && hasLabContent(r.lab)).toBe(true);
    expect(parseBackup(serializeBackup(emptyProgress(), new Date())).ok).toBe(false);
  });

  it('rejects a file whose Lab section is damaged instead of half-restoring it', () => {
    const bad = JSON.stringify({ ...createBackup(P), lab: { version: 7 } });
    const r = parseBackup(bad);
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error).toBe('malformed');
  });
});

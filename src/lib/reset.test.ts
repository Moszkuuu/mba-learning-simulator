import { describe, expect, it } from 'vitest';
import { ALL_QUESTION_KEYS } from '../content';
import { emptyProgress, reducer, type Progress } from './progress';
import { parseBackup, serializeBackup } from './backup';
import { sessionReducer, type Session } from './cloud/owner';
import { syncProgress, type CloudData, type CloudRow, type CloudStore } from './cloud/sync';
import { adoptLab, emptyLab, hasLabContent, mergeLab, resetLabState, type LabDraft, type LabState, type LabSubmission } from './lab';
import { EPOCH, applyProgressReset, newerTombstone, resetMarker, restoreMarker, type Tombstone } from './reset';

const Q = ALL_QUESTION_KEYS[0]!;
const T = (iso: string): Tombstone => ({ cutoff: iso, setAt: iso });
const day = (d: number) => `2026-05-${String(d).padStart(2, '0')}T09:00:00.000Z`;
const answered = (p: Progress, d: number) => reducer(p, { type: 'attempt', questionId: Q.id, correct: true, given: 'x', context: 'practice', now: day(d) });
const done = (p: Progress, d: number) => reducer(p, { type: 'completeLesson', lessonId: 'l1-gross-profit', correct: 8, total: 10, now: day(d) });
const draft = (text: string, d: number): LabDraft => ({ answers: { 'text.why': text }, ratings: {}, reflection: '', updatedAt: day(d) });
const sub = (d: number): LabSubmission => ({ at: day(d), level: 'beginner', verified: 25, self: 0, total: 25, correctIds: ['ocf'] });
const lab = (drafts: LabState['drafts'] = {}, submissions: LabSubmission[] = [], reset?: Tombstone): LabState => ({ version: 1, drafts, submissions, ...(reset ? { reset } : {}) });
const days = (p: Progress) => p.attempts.map((a) => Number(a.at.slice(8, 10)));

function cloud(initial: CloudData | null = null) {
  let row: CloudRow | null = initial ? { data: JSON.parse(JSON.stringify(initial)), revision: 1 } : null;
  const store: CloudStore = {
    fetch: async () => (row ? { data: JSON.parse(JSON.stringify(row.data)), revision: row.revision } : null),
    insert: async (d) => { if (row) return 'conflict'; row = { data: JSON.parse(JSON.stringify(d)), revision: 1 }; return 'ok'; },
    update: async (d, rev) => { if (!row || row.revision !== rev) return 'conflict'; row = { data: JSON.parse(JSON.stringify(d)), revision: rev + 1 }; return 'ok'; },
  };
  return { store, data: () => row?.data as CloudData | undefined, overwrite: (d: CloudData) => { row = { data: JSON.parse(JSON.stringify(d)), revision: (row?.revision ?? 0) + 1 }; } };
}

describe('progress reset marker', () => {
  it('deletes everything at or before the cutoff and keeps later work', () => {
    const p = done(answered(answered(emptyProgress(), 1), 12), 2);
    const r = applyProgressReset(p, T(day(10)));
    expect(days(r)).toEqual([12]);
    expect(r.completedLessons).toEqual([]); // the completion (day 2) was before the cutoff
    expect(applyProgressReset(done(emptyProgress(), 12), T(day(10))).completedLessons).toEqual(['l1-gross-profit']);
  });

  it('clears a simulation in progress only when this device is adopting the reset now', () => {
    const p = { ...answered(emptyProgress(), 1), simState: { history: [{}] } as unknown as Progress['simState'] };
    expect(applyProgressReset(p, T(day(10)), false).simState).not.toBeNull();
    expect(applyProgressReset(p, T(day(10)), true).simState).toBeNull();
  });

  it('does nothing for a restore marker and returns the same object when nothing changes', () => {
    const p = answered(emptyProgress(), 1);
    expect(applyProgressReset(p, restoreMarker())).toBe(p);
    expect(applyProgressReset(p, T(EPOCH))).toBe(p);
    expect(applyProgressReset(p, T(day(0 + 1) /* before the answer */.replace('09', '08')))).toBe(p);
  });

  it('keeps the marker that was made last', () => {
    const a = { cutoff: day(5), setAt: day(5) }, b = { cutoff: EPOCH, setAt: day(9) };
    expect(newerTombstone(a, b)).toBe(b);
    expect(newerTombstone(b, a)).toBe(b);
    expect(newerTombstone(a, undefined)).toBe(a);
  });

  it('is applied by the session reducer to the current person only', () => {
    const s: Session = { owner: { kind: 'user', id: 'a', email: 'a@x' }, progress: answered(answered(emptyProgress(), 1), 12), issue: null };
    const n = sessionReducer(s, { type: 'applyReset', tombstone: T(day(10)), clearSim: false });
    expect(days(n.progress)).toEqual([12]);
    expect(n.owner).toBe(s.owner);
    expect(sessionReducer(n, { type: 'applyReset', tombstone: T(day(10)), clearSim: false })).toBe(n); // idempotent: no state change, no sync loop
  });
});

describe('reset on one device, restore on another', () => {
  it('an offline device that reconnects after a reset loses its older progress but keeps newer work', async () => {
    const c = cloud();
    const old = answered(answered(emptyProgress(), 1), 2);
    await syncProgress(old, c.store); // both devices had this
    // Device 1 resets (progress emptied, marker made after day 2).
    const m = T(day(10));
    await syncProgress(emptyProgress(), c.store, 'overwrite', undefined, m);
    expect(c.data()!.attempts).toHaveLength(0);
    expect(c.data()!.progressReset).toEqual(m);
    // Device 2 was offline all along, studied on day 12, and has never seen the reset.
    const dev2 = answered(old, 12);
    const r = await syncProgress(dev2, c.store, 'merge', undefined, undefined);
    expect(days(r.progress)).toEqual([12]);
    expect(r.adoptedReset).toBe(true);
    expect(r.reset).toEqual(m);
    expect(days(c.data()!)).toEqual([12]);
    // Device 1 syncs again: it sees device 2's new work and keeps it.
    const r1 = await syncProgress(emptyProgress(), c.store, 'merge', undefined, m);
    expect(days(r1.progress)).toEqual([12]);
    expect(r1.adoptedReset).toBe(false);
  });

  it('a reset device does not bring the old data back when it syncs again', async () => {
    const c = cloud({ ...answered(emptyProgress(), 1) });
    const m = T(day(10));
    const first = await syncProgress(emptyProgress(), c.store, 'overwrite', undefined, m);
    const again = await syncProgress(first.progress, c.store, 'merge', undefined, m);
    expect(again.progress.attempts).toHaveLength(0);
    expect(again.pushed).toBe(false);
  });

  it('restoring a backup over a reset supersedes the reset instead of being deleted by it', async () => {
    const c = cloud();
    const backup = answered(answered(emptyProgress(), 1), 2);
    await syncProgress(emptyProgress(), c.store, 'overwrite', undefined, T(day(10)));
    // Later the person imports an older backup on a device (import = overwrite + a restore marker made now).
    const restore: Tombstone = { cutoff: EPOCH, setAt: day(20) };
    const r = await syncProgress(backup, c.store, 'overwrite', undefined, restore);
    expect(days(r.progress)).toEqual([1, 2]);
    expect(c.data()!.progressReset).toEqual(restore);
    // Another device that knew the earlier reset adopts the restore marker and keeps the restored data.
    const other = await syncProgress(emptyProgress(), c.store, 'merge', undefined, T(day(10)));
    expect(days(other.progress)).toEqual([1, 2]);
    expect(other.adoptedReset).toBe(false); // a restore marker deletes nothing, so nothing is cleared on this device
  });

  it('heals when an older app version rewrites the row without the marker', async () => {
    const c = cloud();
    const m = T(day(10));
    await syncProgress(emptyProgress(), c.store, 'overwrite', undefined, m);
    c.overwrite({ ...answered(emptyProgress(), 1) }); // an old browser tab writes stale progress and drops the marker
    expect(c.data()!.progressReset).toBeUndefined();
    const r = await syncProgress(emptyProgress(), c.store, 'merge', undefined, m); // the device that reset syncs next
    expect(r.progress.attempts).toHaveLength(0);
    expect(c.data()!.progressReset).toEqual(m);
    expect(c.data()!.attempts).toHaveLength(0);
  });
});

describe('Consulting Lab reset', () => {
  it('deletes older drafts, submissions and earlier versions on every device, and keeps newer work', () => {
    const phoneOffline = lab({ beginner: draft('old draft', 2) }, [sub(1), sub(12)]);
    const afterReset = resetLabState(true, new Date(day(10)));
    const m = mergeLab(afterReset, phoneOffline);
    expect(m.drafts.beginner).toBeUndefined();
    expect(m.submissions.map((s) => s.at)).toEqual([day(12)]);
    expect(hasLabContent(mergeLab(afterReset, lab({ beginner: draft('new draft', 12) })))).toBe(true);
    // Order does not matter, so every device ends up the same.
    expect(JSON.stringify(mergeLab(phoneOffline, afterReset))).toBe(JSON.stringify(m));
  });

  it('carries the reset through the cloud to a device that was offline', async () => {
    const c = cloud();
    await syncProgress(emptyProgress(), c.store, 'merge', lab({ beginner: draft('v1', 1) }, [sub(1)]));
    await syncProgress(emptyProgress(), c.store, 'merge', resetLabState(true, new Date(day(10)))); // device 1 resets the Lab
    expect(c.data()!.lab!.drafts.beginner).toBeUndefined();
    expect(c.data()!.lab!.reset).toBeTruthy(); // the marker is stored even though no work is left
    const phone = await syncProgress(emptyProgress(), c.store, 'merge', lab({ beginner: draft('v1', 1) }, [sub(1)])); // offline phone returns
    expect(hasLabContent(phone.lab!)).toBe(false);
    expect(c.data()!.lab!.submissions).toHaveLength(0);
  });

  it('a guest reset leaves no marker (guests never sync), and guest work copied in cannot delete anything', () => {
    expect(resetLabState(false).reset).toBeUndefined();
    const account = lab({ beginner: draft('account work', 3) }, [sub(3)]);
    const guestAfterReset = lab({ beginner: draft('guest work', 5) }, [], T(day(8))); // even a stray marker must not travel
    const copied = adoptLab(guestAfterReset, new Date(day(20)));
    expect(copied.reset).toBeUndefined();
    const merged = mergeLab(account, copied);
    expect(merged.submissions).toHaveLength(1); // the account's submission survives
    expect(merged.drafts.beginner!.answers['text.why']).toBe('guest work');
    expect(merged.earlier![0]!.draft.answers['text.why']).toBe('account work'); // and the account's draft is kept, not deleted
  });

  it('a backup restored after a reset survives (it is stamped as made now) and carries no deletion marker', () => {
    const exported = serializeBackup(answered(emptyProgress(), 1), new Date(day(2)), lab({ beginner: draft('backed up', 2) }, [sub(2)], T(day(9))));
    const r = parseBackup(exported);
    expect(r.ok && r.lab && r.lab.reset).toBeUndefined();
    const afterReset = resetLabState(true, new Date(day(10)));
    const restored = mergeLab(afterReset, adoptLab(r.ok ? r.lab! : emptyLab(), new Date(day(11))));
    expect(restored.drafts.beginner!.answers['text.why']).toBe('backed up');
    expect(restored.submissions).toHaveLength(1);
    expect(restored.reset).toBeTruthy(); // the earlier reset still protects against stale copies elsewhere
  });
});

describe('isolation between people', () => {
  it('one account\'s reset marker lives only in that account\'s row', async () => {
    const bobs = answered(emptyProgress(), 1);
    const alice = cloud(), bob = cloud({ ...bobs });
    await syncProgress(emptyProgress(), alice.store, 'overwrite', resetLabState(true, new Date(day(10))), resetMarker(new Date(day(10))));
    const b = await syncProgress(bobs, bob.store, 'merge', undefined, undefined);
    expect(b.reset).toBeUndefined();
    expect(days(b.progress)).toEqual([1]);
    expect(bob.data()!.progressReset).toBeUndefined();
  });
});

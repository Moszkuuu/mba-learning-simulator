import { describe, expect, it } from 'vitest';
import { ALL_QUESTION_KEYS } from '../../content';
import { emptyProgress, reducer, STORAGE_KEY, type Progress } from '../progress';
import { saveProgress, loadProgress, commitImport } from '../backup';
import { mergeProgress, sameProgress } from './merge';
import { CloudDataError, syncProgress, type CloudRow, type CloudStore } from './sync';
import { GUEST, openOwner, ownerId, sessionReducer, storageKeyFor, type Owner } from './owner';

const Q = ALL_QUESTION_KEYS[0]!;
const day = (n: number) => `2026-02-${String(n).padStart(2, '0')}T09:00:00.000Z`;
const answer = (p: Progress, n: number, correct = true) => reducer(p, { type: 'attempt', questionId: Q.id, correct, given: 'x', context: 'practice', now: day(n) });
const withLesson = (p: Progress, id: string, n: number) => reducer(p, { type: 'completeLesson', lessonId: id, correct: 7, total: 10, now: day(n) });

class FakeStorage implements Storage {
  data = new Map<string, string>();
  get length() { return this.data.size; }
  clear() { this.data.clear(); }
  key(i: number) { return [...this.data.keys()][i] ?? null; }
  removeItem(k: string) { this.data.delete(k); }
  getItem(k: string) { return this.data.get(k) ?? null; }
  setItem(k: string, v: string) { this.data.set(k, v); }
}

/** Server stand-in with the same rules as the SQL table: one row per user, revision-checked updates. */
class FakeCloud {
  rows = new Map<string, CloudRow>();
  beforeUpdate: (() => void) | null = null;
  failFetch = false;
  storeFor(userId: string): CloudStore {
    return {
      fetch: async () => { if (this.failFetch) throw new Error('offline'); const r = this.rows.get(userId); return r ? { data: JSON.parse(JSON.stringify(r.data)), revision: r.revision } : null; },
      insert: async (data) => { if (this.rows.has(userId)) return 'conflict'; this.rows.set(userId, { data: JSON.parse(JSON.stringify(data)), revision: 1 }); return 'ok'; },
      update: async (data, rev) => {
        this.beforeUpdate?.(); this.beforeUpdate = null;
        const r = this.rows.get(userId);
        if (!r || r.revision !== rev) return 'conflict';
        this.rows.set(userId, { data: JSON.parse(JSON.stringify(data)), revision: rev + 1 });
        return 'ok';
      },
    };
  }
}

describe('mergeProgress', () => {
  it('keeps everything from both sides and does not duplicate', () => {
    const a = answer(answer(emptyProgress(), 1), 2);
    const b = answer(emptyProgress(), 3);
    const m = mergeProgress(a, b);
    expect(m.attempts).toHaveLength(3);
    expect(mergeProgress(m, a).attempts).toHaveLength(3);
    expect(mergeProgress(m, m)).toEqual(m);
    expect(sameProgress(mergeProgress(m, b), m)).toBe(true);
  });
  it('unions lessons and keeps the newer score and review card', () => {
    const a = withLesson(emptyProgress(), 'L1', 1);
    const b = reducer(withLesson(emptyProgress(), 'L1', 5), { type: 'completeLesson', lessonId: 'L2', correct: 1, total: 2, now: day(6) });
    const m = mergeProgress(a, b);
    expect(m.completedLessons.sort()).toEqual(['L1', 'L2']);
    expect(m.lessonScores.L1?.at).toBe(day(5));
    const c1 = answer(emptyProgress(), 2, false); const c2 = answer(emptyProgress(), 9, true);
    expect(mergeProgress(c1, c2).cards[Q.id]?.lastAt).toBe(day(9));
  });
  it('caps attempts at the same limit as the app, keeping the newest', () => {
    const many = (start: number) => ({ ...emptyProgress(), attempts: Array.from({ length: 2000 }, (_, i) => ({ id: `${start}-${i}`, questionId: Q.id, lessonId: Q.lessonId, competency: Q.competency, level: Q.level, correct: true, score: 1, given: '', at: new Date(Date.UTC(2026, 0, 1, 0, 0, start * 2000 + i)).toISOString(), context: 'practice' as const })) });
    const m = mergeProgress(many(0), many(1));
    expect(m.attempts).toHaveLength(3000);
    expect(m.attempts[2999]?.id).toBe('1-1999');
  });
});

describe('syncProgress', () => {
  it('uploads local progress when the account has no cloud copy yet (migration)', async () => {
    const cloud = new FakeCloud();
    const local = answer(emptyProgress(), 1);
    const r = await syncProgress(local, cloud.storeFor('alice'));
    expect(r.pushed).toBe(true);
    expect(cloud.rows.get('alice')?.revision).toBe(1);
    expect(r.progress).toEqual(local);
  });
  it('merges a second device without losing either side', async () => {
    const cloud = new FakeCloud();
    const phoneLocal = answer(emptyProgress(), 1);
    await syncProgress(phoneLocal, cloud.storeFor('alice')); // phone
    const laptop = await syncProgress(answer(emptyProgress(), 2), cloud.storeFor('alice'));
    expect(laptop.progress.attempts).toHaveLength(2);
    const phone = await syncProgress(phoneLocal, cloud.storeFor('alice'));
    expect(phone.progress.attempts).toHaveLength(2);
    expect(cloud.rows.get('alice')?.revision).toBeGreaterThanOrEqual(2);
  });
  it('does not write when nothing changed', async () => {
    const cloud = new FakeCloud();
    const p = answer(emptyProgress(), 1);
    await syncProgress(p, cloud.storeFor('alice'));
    expect((await syncProgress(p, cloud.storeFor('alice'))).pushed).toBe(false);
    expect(cloud.rows.get('alice')?.revision).toBe(1);
  });
  it('resolves a write conflict by merging the newer cloud copy and retrying', async () => {
    const cloud = new FakeCloud();
    const base = answer(emptyProgress(), 1);
    await syncProgress(base, cloud.storeFor('alice'));
    // while device A is about to write, device B writes first
    cloud.beforeUpdate = () => { cloud.rows.set('alice', { data: answer(base, 3), revision: 2 }); };
    const r = await syncProgress(answer(base, 2), cloud.storeFor('alice'));
    expect(r.progress.attempts).toHaveLength(3);
    expect((cloud.rows.get('alice')?.data as Progress).attempts).toHaveLength(3);
  });
  it('refuses to overwrite cloud data it cannot read', async () => {
    const cloud = new FakeCloud();
    const bad = { version: 99, attempts: [] };
    cloud.rows.set('alice', { data: bad, revision: 7 });
    await expect(syncProgress(answer(emptyProgress(), 1), cloud.storeFor('alice'))).rejects.toBeInstanceOf(CloudDataError);
    expect(cloud.rows.get('alice')).toEqual({ data: bad, revision: 7 });
  });
  it('overwrite mode makes a deliberate reset reach the cloud instead of merging old data back', async () => {
    const cloud = new FakeCloud();
    await syncProgress(answer(emptyProgress(), 1), cloud.storeFor('alice'));
    const merged = await syncProgress(emptyProgress(), cloud.storeFor('alice'), 'merge');
    expect(merged.progress.attempts).toHaveLength(1); // a plain sync never deletes
    const reset = await syncProgress(emptyProgress(), cloud.storeFor('alice'), 'overwrite');
    expect(reset.progress.attempts).toHaveLength(0);
    expect((cloud.rows.get('alice')?.data as Progress).attempts).toHaveLength(0);
  });
  it('leaves local progress untouched when the network fails', async () => {
    const cloud = new FakeCloud();
    cloud.failFetch = true;
    const local = answer(emptyProgress(), 1);
    await expect(syncProgress(local, cloud.storeFor('alice'))).rejects.toThrow('offline');
    expect(local.attempts).toHaveLength(1);
  });
});

describe('account isolation', () => {
  const alice: Owner = { kind: 'user', id: 'alice-id', email: 'a@example.com' };
  const bob: Owner = { kind: 'user', id: 'bob-id', email: 'b@example.com' };

  it('gives every owner a different storage key and keeps the original key for guests', () => {
    expect(storageKeyFor(GUEST)).toBe(STORAGE_KEY);
    expect(new Set([storageKeyFor(GUEST), storageKeyFor(alice), storageKeyFor(bob)]).size).toBe(3);
    expect(ownerId(alice)).not.toBe(ownerId(bob));
  });
  it("switching accounts on one browser never shows or saves the previous person's progress", () => {
    const store = new FakeStorage();
    saveProgress(answer(emptyProgress(), 1), store, storageKeyFor(alice));
    let s = openOwner(alice, store);
    expect(s.progress.attempts).toHaveLength(1);
    s = sessionReducer(s, { type: 'switchOwner', owner: bob, storage: store });
    expect(s.owner).toEqual(bob);
    expect(s.progress.attempts).toHaveLength(0); // Bob starts empty, Alice's attempt is not carried over
    saveProgress(s.progress, store, storageKeyFor(bob));
    expect(loadProgress(store, storageKeyFor(alice)).progress.attempts).toHaveLength(1); // Alice's copy is untouched
    expect(loadProgress(store, storageKeyFor(bob)).progress.attempts).toHaveLength(0);
  });
  it('cloud rows are addressed per account and cannot be reached through another account store', async () => {
    const cloud = new FakeCloud();
    await syncProgress(answer(emptyProgress(), 1), cloud.storeFor(alice.id));
    const bobResult = await syncProgress(emptyProgress(), cloud.storeFor(bob.id));
    expect(bobResult.progress.attempts).toHaveLength(0);
    expect((cloud.rows.get(alice.id)?.data as Progress).attempts).toHaveLength(1);
  });
  it('guest progress is copied into an account only on request, and the guest copy stays', () => {
    const store = new FakeStorage();
    const guest = answer(emptyProgress(), 1);
    saveProgress(guest, store);
    let s = sessionReducer(openOwner(GUEST, store), { type: 'switchOwner', owner: alice, storage: store });
    expect(s.progress.attempts).toHaveLength(0); // signing in does not silently import guest data
    s = sessionReducer(s, { type: 'mergeIn', progress: loadProgress(store, STORAGE_KEY).progress });
    expect(s.progress.attempts).toHaveLength(1);
    expect(loadProgress(store, STORAGE_KEY).progress).toEqual(guest);
    s = sessionReducer(s, { type: 'switchOwner', owner: GUEST, storage: store });
    expect(s.progress).toEqual(guest);
  });
  it('an import while signed in is saved to that account only, never over the guest copy', () => {
    const store = new FakeStorage();
    const guest = answer(emptyProgress(), 1);
    saveProgress(guest, store);
    const imported = answer(answer(emptyProgress(), 2), 3);
    expect(commitImport(imported, store, storageKeyFor(alice))).toEqual({ ok: true });
    expect(loadProgress(store, STORAGE_KEY).progress).toEqual(guest);
    expect(loadProgress(store, storageKeyFor(alice)).progress).toEqual(imported);
  });
  it('a merge that adds nothing returns the same state (prevents sync loops)', () => {
    const s = openOwner(GUEST, new FakeStorage());
    const t = sessionReducer(s, { type: 'mergeIn', progress: emptyProgress() });
    expect(t).toBe(s);
  });
});

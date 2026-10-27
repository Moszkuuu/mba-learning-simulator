import { describe, expect, it } from 'vitest';
import { ALL_QUESTION_KEYS } from '../../content';
import { emptyProgress, reducer, type Progress } from '../progress';
import { mergeProgress } from './merge';
import { createSyncRunner, type RunnerStatus } from './runner';
import { syncProgress, type CloudRow, type CloudStore } from './sync';
import type { Owner } from './owner';

const Q = ALL_QUESTION_KEYS[0]!;
const alice: Owner = { kind: 'user', id: 'alice', email: 'a@example.com' };
const bob: Owner = { kind: 'user', id: 'bob', email: 'b@example.com' };
const ans = (p: Progress, n: number) => reducer(p, { type: 'attempt', questionId: Q.id, correct: true, given: 'x', context: 'practice', now: `2026-04-${String(n).padStart(2, '0')}T09:00:00.000Z` });
const count = (p: unknown) => (p as Progress).attempts.length;

/** One deterministic scenario: a fake cloud whose fetch() can be held open until the test releases it. */
function harness(initialLocal: Progress, cloudData: Progress | null) {
  let row: CloudRow | null = cloudData ? { data: JSON.parse(JSON.stringify(cloudData)), revision: 1 } : null;
  let gate: Promise<void> | null = null;
  let release: () => void = () => {};
  const hold = () => { gate = new Promise<void>((r) => { release = r; }); };
  const store: CloudStore = {
    fetch: async () => { const g = gate; gate = null; if (g) await g; return row ? { data: JSON.parse(JSON.stringify(row.data)), revision: row.revision } : null; },
    insert: async (data) => { if (row) return 'conflict'; row = { data: JSON.parse(JSON.stringify(data)), revision: 1 }; return 'ok'; },
    update: async (data, rev) => { if (!row || row.revision !== rev) return 'conflict'; row = { data: JSON.parse(JSON.stringify(data)), revision: rev + 1 }; return 'ok'; },
  };
  const s = { owner: alice as Owner, progress: initialLocal, token: null as string | null, status: [] as RunnerStatus[], applied: [] as Progress[], online: true };
  let n = 0;
  const run = createSyncRunner({
    owner: () => s.owner,
    progress: () => s.progress,
    signedInAs: async () => (s.owner.kind === 'user' ? s.owner.id : null),
    overwriteToken: () => s.token,
    clearOverwrite: () => { s.token = null; },
    sync: (local, mode) => syncProgress(local, store, mode),
    apply: (p) => { s.applied.push(p); s.progress = mergeProgress(s.progress, p); },
    setStatus: (x) => s.status.push(x),
    isOnline: () => s.online,
  });
  return {
    s, run, hold, release: () => release(), cloud: () => row,
    /** What the app does for Reset / Import-replace: swap local progress and mark an overwrite as pending. */
    replaceLocal: (p: Progress) => { s.progress = p; s.token = `t${++n}`; },
  };
}
const tick = () => new Promise((r) => setTimeout(r, 0));

describe('reset/import during an in-flight sync', () => {
  it('reset: the stale result does not bring erased progress back, locally or in the cloud', async () => {
    const old = ans(ans(emptyProgress(), 1), 2);
    const h = harness(old, old);
    h.hold();
    const round = h.run(); // round 1 starts, held open at the cloud fetch
    await tick();
    h.replaceLocal(emptyProgress()); // user resets while it is in flight
    await releaseAndSettle(h, round);
    expect(count(h.s.progress)).toBe(0);
    expect(h.s.applied.every((p) => count(p) === 0)).toBe(true); // the stale 2-attempt result was never applied
    expect(count(h.cloud()!.data)).toBe(0);
    expect(h.s.token).toBeNull(); // the overwrite was completed
    expect(h.s.status[h.s.status.length - 1]).toBe('synced');
  });

  it('import-replace: the replacement wins, the old data is not merged back', async () => {
    const old = ans(ans(emptyProgress(), 1), 2);
    const h = harness(old, old);
    h.hold();
    const round = h.run();
    await tick();
    const imported = ans(ans(ans(emptyProgress(), 7), 8), 9);
    h.replaceLocal(imported);
    await releaseAndSettle(h, round);
    expect(h.s.progress.attempts.map((a) => a.id).sort()).toEqual(imported.attempts.map((a) => a.id).sort());
    expect(h.cloud()!.data).toEqual(JSON.parse(JSON.stringify(imported)));
    expect(h.s.applied.some((p) => p.attempts.some((a) => old.attempts.some((o) => o.id === a.id)))).toBe(false);
  });

  it('a second reset/import while the first overwrite round runs is not lost', async () => {
    const old = ans(emptyProgress(), 1);
    const h = harness(old, old);
    h.replaceLocal(emptyProgress()); // first reset, pending
    h.hold();
    const round = h.run(); // overwrite round held at fetch
    await tick();
    const second = ans(emptyProgress(), 5);
    h.replaceLocal(second); // user imports something else meanwhile
    await releaseAndSettle(h, round);
    expect(h.cloud()!.data).toEqual(JSON.parse(JSON.stringify(second)));
    expect(h.s.token).toBeNull();
  });

  it('an ordinary answer during a round is kept (merge, not overwrite)', async () => {
    const base = ans(emptyProgress(), 1);
    const h = harness(base, base);
    h.hold();
    const round = h.run();
    await tick();
    h.s.progress = ans(h.s.progress, 3); // student answers a question mid-sync
    await releaseAndSettle(h, round);
    expect(count(h.s.progress)).toBe(2);
    h.s.status.length = 0;
    await h.run();
    expect(count(h.cloud()!.data)).toBe(2);
  });
});

describe('other in-flight safety rules', () => {
  it('a result for one account is never applied after switching to another account', async () => {
    const a = ans(emptyProgress(), 1);
    const h = harness(a, a);
    h.hold();
    const round = h.run();
    await tick();
    h.s.owner = bob; // signed out of Alice, signed in as Bob
    h.s.progress = emptyProgress();
    await releaseAndSettle(h, round);
    expect(h.s.applied).toHaveLength(0);
    expect(count(h.s.progress)).toBe(0);
  });

  it('a failed overwrite keeps the pending marker so it is retried later (no silent merge-back)', async () => {
    const old = ans(emptyProgress(), 1);
    const h = harness(old, old);
    h.replaceLocal(emptyProgress());
    h.s.online = false;
    // a runner whose sync always fails (network down)
    const failing = createSyncRunner({
      owner: () => h.s.owner, progress: () => h.s.progress, signedInAs: async () => 'alice',
      overwriteToken: () => h.s.token, clearOverwrite: () => { h.s.token = null; },
      sync: async () => { throw new Error('network'); }, apply: () => { throw new Error('must not apply'); },
      setStatus: (x) => h.s.status.push(x), isOnline: () => false,
    });
    await failing();
    expect(h.s.token).not.toBeNull();
    expect(h.s.status[h.s.status.length - 1]).toBe('offline');
    expect(count(h.cloud()!.data)).toBe(1); // cloud untouched until the retry succeeds
  });

  it('extra triggers during a round coalesce into one follow-up round', async () => {
    const base = ans(emptyProgress(), 1);
    const h = harness(base, base);
    h.hold();
    const round = h.run();
    await tick();
    void h.run(); void h.run(); void h.run();
    await releaseAndSettle(h, round);
    expect(h.s.status.filter((x) => x === 'syncing')).toHaveLength(2);
  });
});

/** Releases the held fetch (if any) and waits for the whole chain of rounds to finish. */
async function releaseAndSettle(h: ReturnType<typeof harness>, first: Promise<void>) {
  h.release();
  await first;
  for (let i = 0; i < 20; i++) await tick();
}

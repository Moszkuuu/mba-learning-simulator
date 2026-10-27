/**
 * Runs sync rounds for the signed-in account. Kept free of React so the timing rules can be tested:
 *  - only one round runs at a time; extra triggers coalesce into one follow-up round;
 *  - a reset/import ("overwrite pending") that happens while a round is running makes that round's
 *    result stale, so it is dropped and a new round runs in overwrite mode;
 *  - a result is never applied if the signed-in account changed meanwhile.
 */
import type { Progress } from '../progress';
import type { Owner } from './owner';
import { CloudDataError } from './sync';

export type RunnerStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'needsLogin' | 'blocked' | 'error';

export interface RunnerDeps {
  owner(): Owner;
  progress(): Progress;
  signedInAs(): Promise<string | null>;
  /** Token of a pending reset/import for this account (changes on every new reset/import), or null. */
  overwriteToken(owner: Owner): string | null;
  clearOverwrite(owner: Owner): void;
  sync(local: Progress, mode: 'merge' | 'overwrite'): Promise<{ progress: Progress }>;
  apply(p: Progress): void;
  setStatus(s: RunnerStatus): void;
  isOnline(): boolean;
}

export function createSyncRunner(d: RunnerDeps): () => Promise<void> {
  let running = false;
  let again = false;

  async function run(): Promise<void> {
    const o = d.owner();
    if (o.kind !== 'user') return;
    if (running) { again = true; return; }
    running = true;
    d.setStatus('syncing');
    try {
      if ((await d.signedInAs()) !== o.id) { d.setStatus('needsLogin'); return; }
      const token = d.overwriteToken(o);
      const overwrite = token !== null;
      const result = await d.sync(d.progress(), overwrite ? 'overwrite' : 'merge');
      // A reset/import happened (or happened again) mid-round: this round's result is stale.
      if (d.overwriteToken(o) !== token) { again = true; return; }
      const now = d.owner();
      if (now.kind !== 'user' || now.id !== o.id) { d.setStatus('idle'); return; } // account changed mid-round
      d.apply(result.progress);
      if (overwrite) d.clearOverwrite(o);
      d.setStatus('synced');
    } catch (e) {
      d.setStatus(e instanceof CloudDataError ? 'blocked' : !d.isOnline() ? 'offline' : 'error');
    } finally {
      running = false;
      if (again) { again = false; void run(); }
    }
  }
  return run;
}

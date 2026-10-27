/**
 * One synchronisation round between this device's progress and the cloud copy of the SAME account.
 * Uses optimistic concurrency (a revision number) so two devices can never silently overwrite each other:
 * a stale write is rejected, the newer cloud copy is merged in, and the write is retried.
 */
import { parseBackup } from '../backup';
import { emptyProgress, type Progress } from '../progress';
import { mergeProgress, sameProgress } from './merge';

export interface CloudRow { data: unknown; revision: number }
/** A store is already bound to one signed-in account; it cannot address anyone else's row. */
export interface CloudStore {
  fetch(): Promise<CloudRow | null>;
  insert(data: Progress): Promise<'ok' | 'conflict'>;
  update(data: Progress, expectedRevision: number): Promise<'ok' | 'conflict'>;
}

export class CloudDataError extends Error {}

const MAX_TRIES = 4;

function readCloud(row: CloudRow | null): Progress | null {
  if (!row) return null;
  const r = parseBackup(JSON.stringify(row.data));
  if (r.ok) return r.progress;
  if (r.error === 'empty') return emptyProgress();
  // Never write over cloud data we cannot read: it may be newer or damaged and needs a human look.
  throw new CloudDataError(`cloud data unreadable (${r.error})`);
}

/**
 * mode 'merge' (default): union local and cloud. mode 'overwrite': the user deliberately replaced or reset
 * their progress on this device, so the cloud copy becomes exactly `local`.
 */
export async function syncProgress(local: Progress, store: CloudStore, mode: 'merge' | 'overwrite' = 'merge'): Promise<{ progress: Progress; pushed: boolean }> {
  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const row = await store.fetch();
    const cloud = readCloud(row);
    const next = cloud === null || mode === 'overwrite' ? local : mergeProgress(local, cloud);
    if (row && cloud && sameProgress(next, cloud)) return { progress: next, pushed: false };
    const result = row ? await store.update(next, row.revision) : await store.insert(next);
    if (result === 'ok') return { progress: next, pushed: true };
    local = mode === 'overwrite' ? local : next; // retry against the newer cloud copy
  }
  throw new Error('sync conflict: could not settle after several tries');
}

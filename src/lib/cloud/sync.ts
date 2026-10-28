/**
 * One synchronisation round between this device's progress and the cloud copy of the SAME account.
 * Uses optimistic concurrency (a revision number) so two devices can never silently overwrite each other:
 * a stale write is rejected, the newer cloud copy is merged in, and the write is retried.
 */
import { parseBackup } from '../backup';
import { emptyProgress, type Progress } from '../progress';
import { hasLabContent, mergeLab, parseLab, sameLab, type LabState } from '../lab';
import { applyProgressReset, isRestore, newerTombstone, parseTombstone, sameTombstone, type Tombstone } from '../reset';
import { mergeProgress, sameProgress } from './merge';

export interface CloudRow { data: unknown; revision: number }
/** What is stored in the account's one cloud row: the progress, plus (optionally) the Consulting Lab work. */
export type CloudData = Progress & { lab?: LabState; progressReset?: Tombstone };
export interface SyncResult { progress: Progress; lab?: LabState; reset?: Tombstone; /** true when a reset made elsewhere was adopted in this round: the caller must delete older local progress too */ adoptedReset: boolean; pushed: boolean }
/** A store is already bound to one signed-in account; it cannot address anyone else's row. */
export interface CloudStore {
  fetch(): Promise<CloudRow | null>;
  insert(data: CloudData): Promise<'ok' | 'conflict'>;
  update(data: CloudData, expectedRevision: number): Promise<'ok' | 'conflict'>;
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
 * The Lab work stored next to the progress. Absent is fine (an older app version wrote the row, or none was saved).
 * Present but unreadable is never overwritten, for the same reason as unreadable progress.
 */
function readCloudReset(row: CloudRow | null): Tombstone | undefined {
  const raw = row && typeof row.data === 'object' && row.data !== null ? (row.data as { progressReset?: unknown }).progressReset : undefined;
  return parseTombstone(raw);
}

function readCloudLab(row: CloudRow | null): LabState | undefined {
  const raw = row && typeof row.data === 'object' && row.data !== null ? (row.data as { lab?: unknown }).lab : undefined;
  if (raw === undefined || raw === null) return undefined;
  const lab = parseLab(raw);
  if (!lab) throw new CloudDataError('cloud Consulting Lab data unreadable');
  return lab;
}

/**
 * mode 'merge' (default): union local and cloud. mode 'overwrite': the user deliberately replaced or reset
 * their progress on this device, so the cloud progress becomes exactly `local`.
 * Lab work is ALWAYS merged, never overwritten: resetting progress must not erase Consulting Lab work, and a device
 * that has never seen the Lab (an older app version) must not erase it from the cloud. When `localLab` is not given the
 * cloud's Lab work is carried over unchanged.
 */
export async function syncProgress(local: Progress, store: CloudStore, mode: 'merge' | 'overwrite' = 'merge', localLab?: LabState, localReset?: Tombstone): Promise<SyncResult> {
  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const row = await store.fetch();
    const cloud = readCloud(row);
    const cloudLab = readCloudLab(row);
    const cloudReset = readCloudReset(row);
    // A reset made on any device deletes older progress on every device; newer work survives. The newest marker wins.
    const reset = newerTombstone(localReset, cloudReset);
    const adopted = !!reset && !sameTombstone(reset, localReset) && !isRestore(reset);
    const localKept = applyProgressReset(local, reset, adopted);
    const cloudKept = cloud ? applyProgressReset(cloud, reset) : null;
    const next = cloudKept === null || mode === 'overwrite' ? localKept : mergeProgress(localKept, cloudKept);
    const nextLab = localLab ? (cloudLab ? mergeLab(localLab, cloudLab) : localLab) : cloudLab;
    if (row && cloud && sameProgress(next, cloud) && sameLab(nextLab, cloudLab) && sameTombstone(reset, cloudReset)) return { progress: next, lab: nextLab, reset, adoptedReset: adopted, pushed: false };
    const payload: CloudData = {
      ...next,
      ...(nextLab && (hasLabContent(nextLab) || nextLab.reset) ? { lab: nextLab } : {}),
      ...(reset ? { progressReset: reset } : {}),
    };
    const result = row ? await store.update(payload, row.revision) : await store.insert(payload);
    if (result === 'ok') return { progress: next, lab: nextLab, reset, adoptedReset: adopted, pushed: true };
    local = mode === 'overwrite' ? local : next; // retry against the newer cloud copy
    if (nextLab) localLab = nextLab;
    localReset = reset;
  }
  throw new Error('sync conflict: could not settle after several tries');
}
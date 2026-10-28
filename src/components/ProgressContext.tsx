import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { type Action, type Progress, STORAGE_KEY } from '../lib/progress';
import { getStorage, hasProgress, loadProgress, saveProgress, summarizeProgress, type ProgressSummary, type StorageIssue } from '../lib/backup';
import { GUEST, LAST_USER_KEY, openOwner, sessionReducer, storageKeyFor, type Owner } from '../lib/cloud/owner';
import { cloudConfigured, getClient, storeFor } from '../lib/cloud/client';
import { syncProgress } from '../lib/cloud/sync';
import { createSyncRunner } from '../lib/cloud/runner';
import { startRecoverySession, takePendingRecovery } from '../lib/cloud/auth';
import { LAB_CHANGED, LAB_SYNCED, adoptLab, hasLabContent, labKey, loadLab, mergeLab, resetLabState, sameLab, saveLab, summarizeLab } from '../lib/lab';
import { isRestore, parseTombstone, resetMarker, restoreMarker, sameTombstone, type Tombstone } from '../lib/reset';

export type SyncStatus = 'off' | 'idle' | 'syncing' | 'synced' | 'offline' | 'needsLogin' | 'blocked' | 'error';

interface Ctx {
  progress: Progress;
  dispatch: (a: Action) => void;
  replace: (p: Progress) => void;
  storageIssue: StorageIssue | null;
  owner: Owner;
  syncStatus: SyncStatus;
  syncNow: () => void;
  /** Guest progress on this browser that has not been copied into the signed-in account yet (summary), else null. */
  guestOffer: ProgressSummary | null;
  copyGuest: () => void;
  /** Guest Consulting Lab work on this browser not yet copied into the signed-in account (counts), else null. */
  guestLabOffer: { submissions: number; drafts: number } | null;
  copyGuestLab: () => void;
  /** The three deliberate resets. Each affects only the current account (or the guest profile) and follows the account to its other devices. */
  resetProgress: () => void;
  resetLabWork: () => void;
  resetAll: () => void;
  /** Password-reset link state: 'ready' = choose a new password, 'failed' = the link did not work. */
  recovery: 'none' | 'ready' | 'expired' | 'invalid';
  endRecovery: () => void;
}
const C = createContext<Ctx | null>(null);

const pendingKey = (o: Owner) => `${storageKeyFor(o)}:pending-overwrite`;
const copiedKey = (id: string) => `${STORAGE_KEY}:guest-copied:${id}`;
const labCopiedKey = (id: string) => `${STORAGE_KEY}:guest-lab-copied:${id}`;
let overwriteCounter = 0;
/** The deletion marker for this person's progress, kept next to their progress in their own storage key. */
const tombKey = (o: Owner) => `${storageKeyFor(o)}:reset`;
const loadTomb = (o: Owner): Tombstone | undefined => { try { return parseTombstone(JSON.parse(getStorage()?.getItem(tombKey(o)) ?? 'null')); } catch { return undefined; } };
const saveTomb = (o: Owner, t: Tombstone) => { try { getStorage()?.setItem(tombKey(o), JSON.stringify(t)); } catch { /* the cloud copy still carries it */ } };
const safe = <T,>(fn: () => T, fallback: T): T => { try { return fn(); } catch { return fallback; } };

function rememberedOwner(): Owner {
  if (!cloudConfigured) return GUEST;
  return safe((): Owner => {
    const v = JSON.parse(getStorage()?.getItem(LAST_USER_KEY) ?? 'null');
    return v && typeof v.id === 'string' && typeof v.email === 'string' ? { kind: 'user', id: v.id, email: v.email } : GUEST;
  }, GUEST);
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [session, dispatchSession] = useReducer(sessionReducer, undefined, () => openOwner(rememberedOwner()));
  const [saveIssue, setSaveIssue] = useState<StorageIssue | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(cloudConfigured ? 'idle' : 'off');
  const [guestOffer, setGuestOffer] = useState<ProgressSummary | null>(null);
  const [guestLabOffer, setGuestLabOffer] = useState<{ submissions: number; drafts: number } | null>(null);
  const [recovery, setRecovery] = useState<'none' | 'ready' | 'expired' | 'invalid'>('none');
  const { owner, progress } = session;

  const latest = useRef(session);
  latest.current = session;

  // ---- local persistence (per owner) ----
  useEffect(() => {
    const r = saveProgress(progress, getStorage(), storageKeyFor(owner));
    setSaveIssue((cur) => (!r.ok ? r.issue : cur === 'writeFailed' || cur === 'unavailable' ? null : cur));
  }, [progress, owner]);

  // ---- who is signed in ----
  useEffect(() => {
    const c = getClient();
    if (!c) return;
    const adopt = (user: { id: string; email?: string | null } | undefined) => {
      if (!user) return;
      const o: Owner = { kind: 'user', id: user.id, email: user.email ?? '' };
      safe(() => getStorage()?.setItem(LAST_USER_KEY, JSON.stringify({ id: o.id, email: o.email })), undefined);
      dispatchSession({ type: 'switchOwner', owner: o });
    };
    // Returning from a password-reset email: the tokens were already removed from the address bar when auth.ts loaded.
    const link = takePendingRecovery();
    if (link) {
      window.location.hash = '#/reset'; // fires hashchange so the router opens the Reset Password page
      if (link.kind === 'error') setRecovery(link.reason);
      else void startRecoverySession(link).then((r) => setRecovery(r.ok ? 'ready' : 'invalid'));
    }
    void c.auth.getSession().then(({ data }) => adopt(data.session?.user)).catch(() => setSyncStatus('offline'));
    const { data: sub } = c.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') { setRecovery('ready'); adopt(s?.user); } else if (event === 'SIGNED_OUT') {
        safe(() => getStorage()?.removeItem(LAST_USER_KEY), undefined);
        dispatchSession({ type: 'switchOwner', owner: GUEST });
        setSyncStatus('idle');
      } else adopt(s?.user);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // ---- guest progress offer (never automatic, never deleted) ----
  useEffect(() => {
    if (owner.kind !== 'user') { setGuestOffer(null); return; }
    const copied = safe(() => getStorage()?.getItem(copiedKey(owner.id)) === '1', false);
    const guest = loadProgress(getStorage(), STORAGE_KEY).progress;
    setGuestOffer(!copied && hasProgress(guest) ? summarizeProgress(guest) : null);
    const labCopied = safe(() => getStorage()?.getItem(labCopiedKey(owner.id)) === '1', false);
    const guestLab = loadLab(getStorage() ?? undefined, labKey(STORAGE_KEY));
    setGuestLabOffer(!labCopied && hasLabContent(guestLab) ? summarizeLab(guestLab) : null);
  }, [owner]);

  // ---- cloud sync (signed-in only) ----
  const runSync = useRef(
    createSyncRunner({
      owner: () => latest.current.owner,
      progress: () => latest.current.progress,
      signedInAs: async () => (await getClient()?.auth.getSession())?.data.session?.user.id ?? null,
      overwriteToken: (o) => safe(() => getStorage()?.getItem(pendingKey(o)) ?? null, null),
      clearOverwrite: (o) => safe(() => getStorage()?.removeItem(pendingKey(o)), undefined),
      sync: (local, mode) => {
        const o = latest.current.owner;
        const c = getClient();
        if (!c || o.kind !== 'user') return Promise.reject(new Error('not signed in'));
        // Consulting Lab work rides along in the same cloud row. It is merged (never replaced), and what comes back is merged with
        // whatever the student typed while the round was running before it is saved, so no edit can be lost.
        const store = getStorage() ?? undefined;
        const key = labKey(storageKeyFor(o));
        const knownReset = loadTomb(o);
        return syncProgress(local, storeFor(c, o.id), mode, loadLab(store, key), knownReset).then((r) => {
          // A reset made on another device: remember it and delete the older progress here too (only if this is still the same person).
          if (r.reset && !sameTombstone(r.reset, knownReset)) {
            saveTomb(o, r.reset);
            const now = latest.current.owner;
            if (!isRestore(r.reset) && now.kind === 'user' && now.id === o.id) dispatchSession({ type: 'applyReset', tombstone: r.reset, clearSim: r.adoptedReset });
          }
          if (r.lab) {
            const current = loadLab(store, key);
            const merged = mergeLab(current, r.lab);
            if (!sameLab(merged, current) && saveLab(store, key, merged)) window.dispatchEvent(new Event(LAB_SYNCED));
          }
          return r;
        });
      },
      apply: (p) => dispatchSession({ type: 'mergeIn', progress: p }),
      setStatus: setSyncStatus,
      isOnline: () => typeof navigator === 'undefined' || navigator.onLine,
    }),
  ).current;

  const ownerKey = owner.kind === 'user' ? owner.id : '';
  useEffect(() => {
    if (!ownerKey) return;
    const t = setTimeout(() => void runSync(), 1500);
    return () => clearTimeout(t);
  }, [progress, ownerKey, runSync]);
  useEffect(() => {
    if (!ownerKey) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const onLab = () => { clearTimeout(t); t = setTimeout(() => void runSync(), 1500); };
    window.addEventListener(LAB_CHANGED, onLab);
    return () => { clearTimeout(t); window.removeEventListener(LAB_CHANGED, onLab); };
  }, [ownerKey, runSync]);
  useEffect(() => {
    if (!ownerKey) return;
    const go = () => void runSync();
    window.addEventListener('online', go);
    window.addEventListener('focus', go);
    return () => { window.removeEventListener('online', go); window.removeEventListener('focus', go); };
  }, [ownerKey, runSync]);

  // ---- actions ----
  const dispatch = useCallback((a: Action) => {
    // Reset and import-replace are deliberate: the cloud copy must follow, not merge the old data back in.
    if ((a.type === 'reset' || a.type === 'replace') && latest.current.owner.kind === 'user') {
      const o = latest.current.owner;
      safe(() => getStorage()?.setItem(pendingKey(o), `${Date.now()}-${++overwriteCounter}`), undefined);
      // A reset leaves a marker so other devices (even offline ones) delete their older copies instead of bringing them back.
      // Restoring a backup over a reset leaves a "restore" marker that deletes nothing and supersedes the earlier reset.
      saveTomb(o, a.type === 'reset' ? resetMarker() : restoreMarker());
    }
    dispatchSession(a);
  }, []);
  const replace = useCallback((p: Progress) => dispatch({ type: 'replace', progress: p }), [dispatch]);
  const copyGuest = useCallback(() => {
    const o = latest.current.owner;
    if (o.kind !== 'user') return;
    dispatchSession({ type: 'mergeIn', progress: loadProgress(getStorage(), STORAGE_KEY).progress });
    // If this account was reset, the student's explicit choice to copy guest progress in must not be deleted by that reset.
    const reset = loadTomb(o);
    if (reset && !isRestore(reset)) saveTomb(o, restoreMarker());
    safe(() => getStorage()?.setItem(copiedKey(o.id), '1'), undefined);
    setGuestOffer(null);
  }, []);

  /** Copies guest Consulting Lab work into the signed-in account (merged, never replacing). The guest copy stays on this browser. */
  const copyGuestLab = useCallback(() => {
    const o = latest.current.owner;
    if (o.kind !== 'user') return;
    const store = getStorage() ?? undefined;
    const key = labKey(storageKeyFor(o));
    // Stamped as made now (so an earlier Lab reset does not delete it) and without the guest's own deletion marker.
    const merged = mergeLab(loadLab(store, key), adoptLab(loadLab(store, labKey(STORAGE_KEY))));
    if (!saveLab(store, key, merged)) return; // not saved: keep the offer so the student can try again
    safe(() => getStorage()?.setItem(labCopiedKey(o.id), '1'), undefined);
    setGuestLabOffer(null);
    window.dispatchEvent(new Event(LAB_SYNCED));
    window.dispatchEvent(new Event(LAB_CHANGED));
  }, []);

  const resetProgress = useCallback(() => dispatch({ type: 'reset' }), [dispatch]);
  /** Deletes this person's Consulting Lab work. Signed in: a marker is left so it is also deleted on their other devices. */
  const resetLabWork = useCallback(() => {
    const o = latest.current.owner;
    if (!saveLab(getStorage() ?? undefined, labKey(storageKeyFor(o)), resetLabState(o.kind === 'user'))) return;
    window.dispatchEvent(new Event(LAB_SYNCED));
    window.dispatchEvent(new Event(LAB_CHANGED));
  }, []);
  const resetAll = useCallback(() => { resetProgress(); resetLabWork(); }, [resetProgress, resetLabWork]);

  const storageIssue = session.issue ?? saveIssue;
  return (
    <C.Provider value={{ progress, dispatch, replace, storageIssue, owner, syncStatus, syncNow: () => void runSync(), guestOffer, copyGuest, guestLabOffer, copyGuestLab, resetProgress, resetLabWork, resetAll, recovery, endRecovery: () => setRecovery('none') }}>
      {children}
    </C.Provider>
  );
}

export function useProgress() {
  const c = useContext(C);
  if (!c) throw new Error('useProgress must be used inside ProgressProvider');
  return c;
}

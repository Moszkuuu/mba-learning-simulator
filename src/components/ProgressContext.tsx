import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { type Action, type Progress, STORAGE_KEY } from '../lib/progress';
import { getStorage, hasProgress, loadProgress, saveProgress, summarizeProgress, type ProgressSummary, type StorageIssue } from '../lib/backup';
import { GUEST, LAST_USER_KEY, openOwner, sessionReducer, storageKeyFor, type Owner } from '../lib/cloud/owner';
import { cloudConfigured, getClient, storeFor } from '../lib/cloud/client';
import { syncProgress } from '../lib/cloud/sync';
import { createSyncRunner } from '../lib/cloud/runner';
import { exchangeRecoveryCode, recoveryCodeFromSearch } from '../lib/cloud/auth';

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
  /** Password-reset link state: 'ready' = choose a new password, 'failed' = the link did not work. */
  recovery: 'none' | 'ready' | 'failed';
  endRecovery: () => void;
  beginRecovery: () => void;
}
const C = createContext<Ctx | null>(null);

const pendingKey = (o: Owner) => `${storageKeyFor(o)}:pending-overwrite`;
const copiedKey = (id: string) => `${STORAGE_KEY}:guest-copied:${id}`;
let overwriteCounter = 0;
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
  const [recovery, setRecovery] = useState<'none' | 'ready' | 'failed'>('none');
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
    // Returning from a password-reset email: ?code=... (the code is single-use, so the URL is cleaned straight away).
    const code = recoveryCodeFromSearch(window.location.search);
    if (code) {
      window.history.replaceState(null, '', window.location.pathname);
      window.location.hash = '#/reset'; // fires hashchange so the router opens the Reset Password page
      void exchangeRecoveryCode(code).then((r) => { if (!r.ok) setRecovery('failed'); });
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
        return syncProgress(local, storeFor(c, o.id), mode);
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
    }
    dispatchSession(a);
  }, []);
  const replace = useCallback((p: Progress) => dispatch({ type: 'replace', progress: p }), [dispatch]);
  const copyGuest = useCallback(() => {
    const o = latest.current.owner;
    if (o.kind !== 'user') return;
    dispatchSession({ type: 'mergeIn', progress: loadProgress(getStorage(), STORAGE_KEY).progress });
    safe(() => getStorage()?.setItem(copiedKey(o.id), '1'), undefined);
    setGuestOffer(null);
  }, []);

  const storageIssue = session.issue ?? saveIssue;
  return (
    <C.Provider value={{ progress, dispatch, replace, storageIssue, owner, syncStatus, syncNow: () => void runSync(), guestOffer, copyGuest, recovery, endRecovery: () => setRecovery('none'), beginRecovery: () => setRecovery('ready') }}>
      {children}
    </C.Provider>
  );
}

export function useProgress() {
  const c = useContext(C);
  if (!c) throw new Error('useProgress must be used inside ProgressProvider');
  return c;
}

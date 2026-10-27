/**
 * Which person's progress is on screen. Guest progress keeps the original storage key (so nothing existing
 * moves); each signed-in account has its own key. Switching owners always loads that owner's own data,
 * so one account's progress is never written into another's storage or cloud row.
 */
import { loadProgress, getStorage } from '../backup';
import { reducer, STORAGE_KEY, type Action, type Progress } from '../progress';
import { mergeProgress, sameProgress } from './merge';

export type Owner = { kind: 'guest' } | { kind: 'user'; id: string; email: string };
export const GUEST: Owner = { kind: 'guest' };
export const LAST_USER_KEY = 'mba-lab:last-user';

export const storageKeyFor = (o: Owner): string => (o.kind === 'guest' ? STORAGE_KEY : `${STORAGE_KEY}:user:${o.id}`);
export const ownerId = (o: Owner): string => (o.kind === 'guest' ? 'guest' : o.id);

export interface Session { owner: Owner; progress: Progress; issue: ReturnType<typeof loadProgress>['issue'] }
/** 'mergeIn' unions another copy of the SAME person's progress (a cloud result, or guest progress they chose to copy). */
export type SessionAction = Action | { type: 'switchOwner'; owner: Owner; storage?: Storage | null } | { type: 'mergeIn'; progress: Progress };

export function openOwner(owner: Owner, storage: Storage | null = getStorage()): Session {
  const { progress, issue } = loadProgress(storage, storageKeyFor(owner));
  return { owner, progress, issue };
}

export function sessionReducer(s: Session, a: SessionAction): Session {
  if (a.type === 'switchOwner') return ownerId(a.owner) === ownerId(s.owner) ? s : openOwner(a.owner, a.storage);
  if (a.type === 'mergeIn') {
    const merged = mergeProgress(s.progress, a.progress);
    // Return the same state when nothing is new, otherwise every sync would trigger the next one.
    return sameProgress(merged, s.progress) ? s : { ...s, progress: merged };
  }
  const progress = reducer(s.progress, a);
  return progress === s.progress ? s : { ...s, progress };
}

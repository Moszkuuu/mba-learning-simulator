import { createContext, useCallback, useContext, useEffect, useReducer, useState, type Dispatch, type ReactNode } from 'react';
import { reducer, type Action, type Progress } from '../lib/progress';
import { loadProgress, saveProgress, type StorageIssue } from '../lib/backup';

const Ctx = createContext<{ progress: Progress; dispatch: Dispatch<Action>; replace: (p: Progress) => void; storageIssue: StorageIssue | null } | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => loadProgress());
  const [progress, dispatch] = useReducer(reducer, initial.progress);
  const [storageIssue, setStorageIssue] = useState<StorageIssue | null>(initial.issue);
  useEffect(() => {
    const result = saveProgress(progress);
    // A save problem is shown until a later save succeeds; a corrupt-data notice stays until the page is reloaded.
    if (!result.ok) setStorageIssue(result.issue);
    else setStorageIssue((cur) => (cur === 'writeFailed' || cur === 'unavailable' ? null : cur));
  }, [progress]);
  const replace = useCallback((p: Progress) => dispatch({ type: 'replace', progress: p }), []);
  return <Ctx.Provider value={{ progress, dispatch, replace, storageIssue }}>{children}</Ctx.Provider>;
}

export function useProgress() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useProgress must be used inside ProgressProvider');
  return c;
}

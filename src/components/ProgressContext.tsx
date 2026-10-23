import { createContext, useCallback, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import { STORAGE_KEY, parseProgress, reducer, type Action, type Progress } from '../lib/progress';

const Ctx = createContext<{ progress: Progress; dispatch: Dispatch<Action>; replace: (p: Progress) => void } | null>(null);

function load(): Progress {
  try {
    return parseProgress(localStorage.getItem(STORAGE_KEY));
  } catch {
    return parseProgress(null);
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      /* storage full or unavailable: progress simply lasts for this session */
    }
  }, [progress]);
  const replace = useCallback((p: Progress) => dispatch({ type: 'replace', progress: p }), []);
  return <Ctx.Provider value={{ progress, dispatch, replace }}>{children}</Ctx.Provider>;
}

export function useProgress() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useProgress must be used inside ProgressProvider');
  return c;
}

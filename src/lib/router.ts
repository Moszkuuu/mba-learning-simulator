import { useEffect, useState } from 'react';

export function useRoute(): string {
  const get = () => window.location.hash.replace(/^#/, '') || '/';
  const [path, setPath] = useState(get);
  useEffect(() => {
    const on = () => { setPath(get()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return path;
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { readLocal, writeLocal } from '../utils/storage';
import { nextReadingPage, previousReadingPage } from '../utils/bookGeometry';

const valid = (page: number, count: number) => Math.min(count, Math.max(1, Number.isFinite(page) ? Math.trunc(page) : 1));
const fromHash = () => { const match = location.hash.match(/^#pagina=(\d+)$/); return match ? Number(match[1]) : null; };

export function useReaderNavigation(count: number) {
  const [resumePage] = useState(() => valid(readLocal('page', 1), count));
  // A fresh visit starts on the physical cover; shared links still open exactly
  // the requested face. The cover offers an explicit resume-reading button.
  const [page, setPage] = useState(() => valid(fromHash() ?? 1, count));
  const current = useRef(page);
  const go = useCallback((next: number, replace = false) => {
    const normalized = valid(next, count);
    current.current = normalized;
    setPage(normalized);
    if (normalized > 1 && normalized < count) writeLocal('page', normalized);
    const hash = `#pagina=${normalized}`;
    if (location.hash !== hash) history[replace ? 'replaceState' : 'pushState'](null, '', hash);
  }, [count]);
  useEffect(() => {
    go(current.current, true);
    const onHash = () => { const next = valid(fromHash() ?? 1, count); current.current = next; setPage(next); if (next > 1 && next < count) writeLocal('page', next); };
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onHash);
    return () => { window.removeEventListener('hashchange', onHash); window.removeEventListener('popstate', onHash); };
  }, [count, go]);
  return { page, resumePage, go, previous: useCallback(() => go(previousReadingPage(current.current)), [go]), next: useCallback(() => go(nextReadingPage(current.current, count)), [go, count]) };
}

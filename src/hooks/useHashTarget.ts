import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useHashTarget(contentId?: string, loading = false) {
  const { hash } = useLocation();
  useEffect(() => {
    if (loading || !contentId || !hash) return;
    try { document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView?.({ block: 'center' }); } catch { /* Ignore malformed fragments. */ }
  }, [hash, contentId, loading]);
}

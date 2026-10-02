import { useCallback, useEffect, useRef, useState } from "react";

interface AsyncState<T> {
  data: T | undefined;
  isMock: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Runs an async loader (typically an api/*Service call returning
 * ApiResult<T>) and exposes loading/error/data state, re-running
 * whenever the dependency list changes. Every page uses this so
 * loading, error, and empty states are handled the same way everywhere.
 */
export function useAsync<T>(
  loader: () => Promise<{ data: T; isMock: boolean }>,
  deps: unknown[] = [],
) {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, isMock: false, loading: true, error: null });
  const loaderRef = useRef(loader);
  const requestSequence = useRef(0);
  loaderRef.current = loader;

  const reload = useCallback(() => {
    const sequence = ++requestSequence.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    loaderRef
      .current()
      .then((result) => {
        if (sequence !== requestSequence.current) return;
        setState({ data: result.data, isMock: result.isMock, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (sequence !== requestSequence.current) return;
        setState((s) => ({ ...s, loading: false, error: err instanceof Error ? err.message : "Something went wrong." }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
    return () => { requestSequence.current += 1; };
  }, [reload]);

  return { ...state, reload };
}

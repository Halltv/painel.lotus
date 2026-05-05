import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Generic hook for async data fetching with loading/error state.
 * @param {Function} fetcher - async function that returns data
 * @param {Array} deps - dependency array (re-runs when changed)
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current) setData(result);
    } catch (err) {
      if (mountedRef.current) setError(err.message || 'Erro desconhecido');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, deps); // eslint-disable-line

  useEffect(() => {
    mountedRef.current = true;
    run();
    return () => { mountedRef.current = false; };
  }, [run]);

  return { data, loading, error, refetch: run };
}

/**
 * Generic hook for mutations (create/update/delete) with loading/error state.
 */
export function useMutation(mutationFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutationFn(...args);
      return result;
    } catch (err) {
      const msg = err.message || 'Erro desconhecido';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  return { mutate, loading, error };
}

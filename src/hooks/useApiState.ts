import { useCallback, useRef, useState } from 'react';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

type ExecuteFn<TParams> = TParams extends void ? () => Promise<void> : (params: TParams) => Promise<void>;

interface ApiStateActions<T, TParams = void> {
  execute: ExecuteFn<TParams>;
  setData: (data: T | null) => void;
  reset: () => void;
}

type UseApiStateReturn<T, TParams = void> = ApiState<T> & ApiStateActions<T, TParams>;

/**
 * Generic hook for API state management
 * Reduces boilerplate for data/loading/error pattern
 * Includes request deduplication to prevent duplicate in-flight requests
 */
export function useApiState<T, TParams = void>(
  apiFn: TParams extends void ? () => Promise<T> : (params: TParams) => Promise<T>,
  errorMessage: string
): UseApiStateReturn<T, TParams> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track in-flight request to prevent duplicates
  const inFlightRef = useRef<Promise<T> | null>(null);

  const execute = useCallback(
    async (params?: TParams) => {
      // If there's already an in-flight request, skip
      if (inFlightRef.current) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const promise = (apiFn as (params?: TParams) => Promise<T>)(params);
        inFlightRef.current = promise;

        const result = await promise;
        setData(result);
      } catch (err) {
        setError(errorMessage);
        console.error(errorMessage, err);
      } finally {
        inFlightRef.current = null;
        setIsLoading(false);
      }
    },
    [apiFn, errorMessage]
  ) as ExecuteFn<TParams>;

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    setData,
    reset
  };
}

/**
 * Hook for cached API state (keyed by ID)
 */
interface CachedApiState<T> {
  cache: Record<string, T>;
  isLoading: boolean;
  error: string | null;
}

interface CachedApiStateActions<T> {
  get: (key: string) => Promise<T | null>;
  getFromCache: (key: string) => T | undefined;
  reset: () => void;
}

type UseCachedApiStateReturn<T> = CachedApiState<T> & CachedApiStateActions<T>;

export function useCachedApiState<T>(
  apiFn: (key: string) => Promise<T>,
  errorMessage: string
): UseCachedApiStateReturn<T> {
  const [cache, setCache] = useState<Record<string, T>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const get = useCallback(
    async (key: string): Promise<T | null> => {
      if (cache[key]) {
        return cache[key];
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await apiFn(key);
        setCache((prev) => ({ ...prev, [key]: result }));
        return result;
      } catch (err) {
        setError(`${errorMessage}: ${key}`);
        console.error(errorMessage, err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFn, cache, errorMessage]
  );

  const getFromCache = useCallback((key: string): T | undefined => cache[key], [cache]);

  const reset = useCallback(() => {
    setCache({});
    setError(null);
  }, []);

  return {
    cache,
    isLoading,
    error,
    get,
    getFromCache,
    reset
  };
}

import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_PREFIX = 'workspace-finder:cache:';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Hook for caching data in localStorage with TTL support
 * 
 * @param key - Cache key (without prefix, will be auto-prefixed)
 * @param fetcher - Function that returns Promise with data to cache
 * @param ttl - Time to live in milliseconds (default: 5 minutes)
 * @returns Object with data, loading, and error states
 */
export function useLocalStorageCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cacheKey = `${CACHE_PREFIX}${key}`;

  // Function to get data from cache
  const getCachedData = useCallback((): T | null => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) {
        console.log(`Cache miss for key: ${key}`);
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();
      const age = now - entry.timestamp;

      if (age > ttl) {
        console.log(`Cache expired for key: ${key} (age: ${age}ms, ttl: ${ttl}ms)`);
        localStorage.removeItem(cacheKey);
        return null;
      }

      console.log(`Cache hit for key: ${key} (age: ${age}ms)`);
      return entry.data;
    } catch (err) {
      console.error(`Error reading cache for key: ${key}`, err);
      return null;
    }
  }, [cacheKey, key, ttl]);

  // Function to save data to cache
  const setCacheData = useCallback((value: T): void => {
    try {
      // Check if data size exceeds 5MB
      const serialized = JSON.stringify({ data: value, timestamp: Date.now() });
      const sizeInBytes = new Blob([serialized]).size;
      const sizeInMB = sizeInBytes / (1024 * 1024);

      if (sizeInMB > 5) {
        console.warn(`Cache entry exceeds 5MB limit: ${sizeInMB.toFixed(2)}MB`);
        return;
      }

      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
      };

      localStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'QuotaExceededError') {
          console.warn(`localStorage quota exceeded for key: ${key}. Attempting cleanup...`);
          cleanupExpiredCache();
          // Retry after cleanup
          try {
            const entry: CacheEntry<T> = {
              data: value,
              timestamp: Date.now(),
            };
            localStorage.setItem(cacheKey, JSON.stringify(entry));
          } catch (retryErr) {
            console.error(`Failed to save to cache after cleanup: ${key}`, retryErr);
          }
        } else {
          console.error(`Error saving to cache for key: ${key}`, err);
        }
      }
    }
  }, [cacheKey, key]);

  // Function to clean up expired cache entries
  const cleanupExpiredCache = useCallback((): void => {
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const entry: CacheEntry<any> = JSON.parse(cached);
              if (now - entry.timestamp > ttl) {
                keysToRemove.push(key);
              }
            }
          } catch (err) {
            // If we can't parse, remove it
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Cleaned up expired cache: ${key}`);
      });
    } catch (err) {
      console.error('Error during cache cleanup', err);
    }
  }, [ttl]);

  // Load data on mount or when key/ttl changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to get from cache first
        const cached = getCachedData();
        if (cached !== null) {
          setData(cached);
          setLoading(false);

          // Fetch fresh data in background without showing spinner
          try {
            const fresh = await fetcher();
            setData(fresh);
            setCacheData(fresh);
          } catch (err) {
            console.warn(`Background fetch failed for key: ${key}, keeping cached data`, err);
            // Keep using cached data even if background fetch fails
          }
        } else {
          // No cache, fetch from server
          try {
            const fresh = await fetcher();
            setData(fresh);
            setCacheData(fresh);
            setLoading(false);
          } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            setLoading(false);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    };

    loadData();
  }, [key, ttl, fetcher, getCachedData, setCacheData]);

  useEffect(() => {
    cleanupExpiredCache();
  }, [cleanupExpiredCache]);

  return { data, loading, error };
}

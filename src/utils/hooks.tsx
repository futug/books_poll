import { useEffect, useState, useCallback } from 'react';

type DebouncedValue = {
  debouncedValue: string;
  pending: boolean;
};

export function useDebounce(value: string, delay: number): DebouncedValue {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    setPending(true);
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setPending(false);
    }, delay);
    return () => {
      setPending(false);
      clearTimeout(handler);
    };
  }, [value, delay]);
  return { debouncedValue, pending };
}

export function useFetch (url: string, method: string = 'GET', headers: HeadersInit, body: Record<string, unknown>[] | null = null) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  const fetchHandler = useCallback(async () => {
    setPending(true);
    try {
      const res = await fetch(url, { 
        method,
        headers,
       });
      if(body) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      setError(err);
    } finally {
      setPending(false);
    }
  }, [body, headers, method, url]);

  useEffect(() => {
    fetchHandler();
  }, [url, method, headers, body, fetchHandler]);
  return { data, error, pending };
}
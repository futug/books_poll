import { useEffect, useState } from 'react';

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
import { useEffect, useState } from 'react';

/**
 * Waits until `value` has stopped changing for `delay` milliseconds.
 *
 * Used by the search box so typing "react" fires one request instead of five.
 */
export function useDebounce<T>(value: T, delay = 350): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
import { useEffect, useState } from 'react';

/**
 * Returns a debounced copy of `value` that only updates after
 * `delay` ms of inactivity. Prevents rapid-fire API calls on keystroke.
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

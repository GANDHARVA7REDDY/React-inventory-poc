import { useCallback, useRef, useState } from 'react';

/** Prevents duplicate submissions: a second submit while the first is running is ignored. */
export default function useSubmitGuard() {
  const busy = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const guard = useCallback((fn) => {
    if (busy.current) return undefined;
    busy.current = true;
    setSubmitting(true);
    try {
      return fn();
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }, []);
  return { submitting, guard };
}

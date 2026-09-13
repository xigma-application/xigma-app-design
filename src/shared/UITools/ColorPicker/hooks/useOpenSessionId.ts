import { useRef } from 'react';

export const useOpenSessionId = (isOpen: boolean): number => {
  const sessionIdRef = useRef(0);
  const wasOpenRef = useRef(isOpen);

  if (isOpen && !wasOpenRef.current) {
    sessionIdRef.current += 1;
  }

  wasOpenRef.current = isOpen;

  return sessionIdRef.current;
};

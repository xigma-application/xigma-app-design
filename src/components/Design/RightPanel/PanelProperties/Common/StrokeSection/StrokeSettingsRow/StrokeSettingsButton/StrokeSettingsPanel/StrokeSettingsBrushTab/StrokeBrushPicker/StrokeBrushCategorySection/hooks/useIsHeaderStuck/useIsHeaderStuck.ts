import { RefObject, useCallback, useEffect, useState } from 'react';

export const useIsHeaderStuck = (headerRef: RefObject<HTMLDivElement | null>): boolean => {
  const [isStuck, setIsStuck] = useState(false);

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]): void => {
    setIsStuck(entries[0].intersectionRatio < 1);
  }, []);

  useEffect(() => {
    const header = headerRef.current;

    if (header && typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(handleIntersect, { threshold: [1] });

      observer.observe(header);

      return (): void => observer.disconnect();
    }
  }, [handleIntersect, headerRef]);

  return isStuck;
};

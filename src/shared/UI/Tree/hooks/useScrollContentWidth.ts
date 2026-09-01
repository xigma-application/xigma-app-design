import { RefObject, useEffect, useState } from 'react';

export const useScrollContentWidth = (scrollRef: RefObject<HTMLDivElement | null>, watch: unknown): number | undefined => {
  const [contentWidth, setContentWidth] = useState<number>();

  useEffect(() => {
    const scrollElement = scrollRef.current;

    if (scrollElement) {
      const updateContentWidth = (): void => setContentWidth(scrollElement.scrollWidth);
      const resizeObserver = new ResizeObserver(updateContentWidth);

      updateContentWidth();
      resizeObserver.observe(scrollElement);

      return (): void => resizeObserver.disconnect();
    }
  }, [scrollRef, watch]);

  return contentWidth;
};

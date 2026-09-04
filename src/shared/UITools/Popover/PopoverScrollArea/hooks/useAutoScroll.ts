import { RefObject, useRef } from 'react';

export type TScrollDirection = 'down' | 'up';

export type TUseAutoScroll = {
  startScrolling: (direction: TScrollDirection) => void;
  stopScrolling: () => void;
};

const SCROLL_STEP_PX = 5;

export const useAutoScroll = (ref: RefObject<HTMLDivElement | null>): TUseAutoScroll => {
  const frameRef = useRef<number | null>(null);

  const stopScrolling = (): void => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  };

  const startScrolling = (direction: TScrollDirection): void => {
    const step = (): void => {
      const element = ref.current;
      if (element) {
        element.scrollTop += direction === 'down' ? SCROLL_STEP_PX : -SCROLL_STEP_PX;
        frameRef.current = requestAnimationFrame(step);
      }
    };

    stopScrolling();
    frameRef.current = requestAnimationFrame(step);
  };

  return { startScrolling, stopScrolling };
};

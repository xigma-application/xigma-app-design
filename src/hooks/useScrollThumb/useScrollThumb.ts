import { PointerEvent as ReactPointerEvent, RefObject, useEffect, useRef, useState } from 'react';

// utils
import { clamp } from 'utils/math/clamp';

export type TUseScrollThumbResult = {
  onPointerDown: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  onPointerMove: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  onPointerUp: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  thumbHeightRatio: number;
  thumbTopRatio: number;
};

type TScrollMetrics = { heightRatio: number; topRatio: number };

const getScrollMetrics = (scrollElement: HTMLDivElement): TScrollMetrics => {
  const { clientHeight, scrollHeight, scrollTop } = scrollElement;
  const maxScrollTop = scrollHeight - clientHeight;

  return {
    heightRatio: scrollHeight > 0 ? clientHeight / scrollHeight : 1,
    topRatio: maxScrollTop > 0 ? scrollTop / maxScrollTop : 0,
  };
};

export const useScrollThumb = (scrollRef: RefObject<HTMLDivElement | null>): TUseScrollThumbResult => {
  const [{ heightRatio, topRatio }, setMetrics] = useState<TScrollMetrics>({ heightRatio: 1, topRatio: 0 });
  const dragStartRef = useRef({ scrollTop: 0, y: 0 });

  useEffect(() => {
    const scrollElement = scrollRef.current;

    if (scrollElement) {
      const updateMetrics = (): void => setMetrics(getScrollMetrics(scrollElement));
      const resizeObserver = new ResizeObserver(updateMetrics);

      updateMetrics();
      scrollElement.addEventListener('scroll', updateMetrics);
      resizeObserver.observe(scrollElement);

      if (scrollElement.firstElementChild) {
        resizeObserver.observe(scrollElement.firstElementChild);
      }

      return (): void => {
        scrollElement.removeEventListener('scroll', updateMetrics);
        resizeObserver.disconnect();
      };
    }
  }, [scrollRef]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const scrollElement = scrollRef.current;

    if (scrollElement) {
      event.currentTarget.setPointerCapture(event.pointerId);
      dragStartRef.current = { scrollTop: scrollElement.scrollTop, y: event.clientY };
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const scrollElement = scrollRef.current;

    if (scrollElement && event.buttons === 1) {
      const { clientHeight, scrollHeight } = scrollElement;
      const maxScrollTop = scrollHeight - clientHeight;
      const scrollDelta = ((event.clientY - dragStartRef.current.y) / clientHeight) * scrollHeight;

      scrollElement.scrollTop = clamp(dragStartRef.current.scrollTop + scrollDelta, 0, maxScrollTop);
    }
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return { onPointerDown, onPointerMove, onPointerUp, thumbHeightRatio: heightRatio, thumbTopRatio: topRatio };
};

import { PointerEvent as ReactPointerEvent, RefObject, useEffect, useRef, useState } from 'react';

// others
import { AXIS_PROPS } from './constants';

// types
import { TScrollAxis, TScrollMetrics, TUseScrollThumbResult } from './types';

// utils
import { clamp } from 'utils/math/clamp';
import { getScrollMetrics } from './utils/getScrollMetrics';

export const useScrollThumb = (scrollRef: RefObject<HTMLDivElement | null>, axis: TScrollAxis = 'y'): TUseScrollThumbResult => {
  const [{ sizeRatio, startRatio }, setMetrics] = useState<TScrollMetrics>({ sizeRatio: 1, startRatio: 0 });
  const dragStartRef = useRef({ coord: 0, scrollPos: 0 });
  const axisProps = AXIS_PROPS[axis];

  useEffect(() => {
    const scrollElement = scrollRef.current;

    if (scrollElement) {
      const updateMetrics = (): void => setMetrics(getScrollMetrics(scrollElement, axisProps));
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
  }, [scrollRef, axisProps]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const scrollElement = scrollRef.current;

    if (scrollElement) {
      event.currentTarget.setPointerCapture(event.pointerId);
      dragStartRef.current = { coord: event[axisProps.coord], scrollPos: scrollElement[axisProps.scrollPos] };
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const scrollElement = scrollRef.current;

    if (scrollElement && event.buttons === 1) {
      const client = scrollElement[axisProps.client];
      const scrollSize = scrollElement[axisProps.scrollSize];
      const maxScrollPos = scrollSize - client;
      const scrollDelta = ((event[axisProps.coord] - dragStartRef.current.coord) / client) * scrollSize;

      scrollElement[axisProps.scrollPos] = clamp(dragStartRef.current.scrollPos + scrollDelta, 0, maxScrollPos);
    }
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return { onPointerDown, onPointerMove, onPointerUp, thumbSizeRatio: sizeRatio, thumbStartRatio: startRatio };
};

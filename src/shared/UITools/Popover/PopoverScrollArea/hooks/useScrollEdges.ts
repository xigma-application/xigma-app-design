import { RefObject, useEffect, useState } from 'react';

export type TScrollEdges = {
  canScrollDown: boolean;
  canScrollUp: boolean;
};

const EDGE_THRESHOLD_PX = 1;

const getScrollEdges = (element: HTMLDivElement): TScrollEdges => ({
  canScrollDown: element.scrollTop + element.clientHeight < element.scrollHeight - EDGE_THRESHOLD_PX,
  canScrollUp: element.scrollTop > EDGE_THRESHOLD_PX,
});

export const useScrollEdges = (ref: RefObject<HTMLDivElement | null>): TScrollEdges => {
  const [edges, setEdges] = useState<TScrollEdges>({ canScrollDown: false, canScrollUp: false });

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return undefined;
    }

    const updateEdges = (): void => setEdges(getScrollEdges(element));

    updateEdges();

    element.addEventListener('scroll', updateEdges);
    const resizeObserver = new ResizeObserver(updateEdges);
    resizeObserver.observe(element);

    return (): void => {
      element.removeEventListener('scroll', updateEdges);
      resizeObserver.disconnect();
    };
  }, [ref]);

  return edges;
};

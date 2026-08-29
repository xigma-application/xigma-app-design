import { RefObject, useEffect } from 'react';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';

// others
import { VIRTUAL_LIST_OVERSCAN } from './constants';

export type TUseVirtualListOptions<TScrollElement extends Element> = {
  count: number;
  rowHeight: number;
  scrollRef: RefObject<TScrollElement | null>;
  scrollToIndex?: number;
};

export type TUseVirtualListResult = {
  items: VirtualItem[];
  totalSize: number;
};

export const useVirtualList = <TScrollElement extends Element>({
  count,
  rowHeight,
  scrollRef,
  scrollToIndex = -1,
}: TUseVirtualListOptions<TScrollElement>): TUseVirtualListResult => {
  const virtualizer = useVirtualizer<TScrollElement, Element>({
    count,
    estimateSize: () => rowHeight,
    getScrollElement: () => scrollRef.current,
    overscan: VIRTUAL_LIST_OVERSCAN,
  });

  useEffect(() => {
    if (scrollToIndex >= 0) {
      virtualizer.scrollToIndex(scrollToIndex);
    }
  }, [scrollToIndex, virtualizer]);

  return { items: virtualizer.getVirtualItems(), totalSize: virtualizer.getTotalSize() };
};

import { VirtualItem } from '@tanstack/react-virtual';

export type TSelectionBackgroundSegment = {
  isRoundedBottom: boolean;
  isRoundedTop: boolean;
  size: number;
  start: number;
};

type TOpenSegment = {
  endIndex: number;
  isRoundedTop: boolean;
  size: number;
  start: number;
};

const closeSegment = (segment: TOpenSegment, isRowSelected: (index: number) => boolean): TSelectionBackgroundSegment => ({
  isRoundedBottom: !isRowSelected(segment.endIndex + 1),
  isRoundedTop: segment.isRoundedTop,
  size: segment.size,
  start: segment.start,
});

export const getSelectionBackgroundSegments = (
  items: VirtualItem[],
  isRowSelected: (index: number) => boolean,
): TSelectionBackgroundSegment[] => {
  const segments: TSelectionBackgroundSegment[] = [];
  let openSegment: TOpenSegment | null = null;

  items.forEach((item) => {
    if (isRowSelected(item.index)) {
      openSegment = openSegment
        ? { ...openSegment, endIndex: item.index, size: openSegment.size + item.size }
        : { endIndex: item.index, isRoundedTop: !isRowSelected(item.index - 1), size: item.size, start: item.start };
    } else if (openSegment) {
      segments.push(closeSegment(openSegment, isRowSelected));
      openSegment = null;
    }
  });

  if (openSegment) {
    segments.push(closeSegment(openSegment, isRowSelected));
  }

  return segments;
};

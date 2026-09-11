// types
import { TFrameNode } from 'types/design/types';
import { TGridTrackAffordanceDragState } from 'types/design/canvas/types';
import { TGridTrackLayout } from './getGridTrackLayout';

// utils
import { getGridTrackOffset } from './getGridTrackOffset';

export const getGridTrackAffordanceDragOffset = (frame: TFrameNode, layout: TGridTrackLayout, dragState: TGridTrackAffordanceDragState): number => {
  const isColumn = dragState.axis === 'column';
  const sizes = isColumn ? layout.columnSizes : layout.rowSizes;
  const gap = isColumn ? layout.columnGap : layout.rowGap;
  const padding = isColumn ? layout.padding.paddingLeft : layout.padding.paddingTop;
  const framePosition = isColumn ? frame.x : frame.y;
  const minIndex = Math.min(...dragState.sourceIndices);
  const maxIndex = Math.max(...dragState.sourceIndices);
  const spanStart = getGridTrackOffset(sizes, gap, minIndex);
  const spanEnd = getGridTrackOffset(sizes, gap, maxIndex) + (sizes[maxIndex] ?? 0);
  const originalCenter = framePosition + padding + (spanStart + spanEnd) / 2;
  const ghostAxisPosition = isColumn ? dragState.ghostPosition.x : dragState.ghostPosition.y;

  return ghostAxisPosition - originalCenter;
};

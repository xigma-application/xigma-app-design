// types
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

export const createSelectionToolRefs = (overrides: Partial<TSelectionToolRefs> = {}): TSelectionToolRefs => ({
  dragStateRef: { current: null },
  endpointDragRef: { current: null },
  marqueeStartRef: { current: null },
  pathOffsetDragRef: { current: null },
  pendingVectorCornerHandleDragRef: { current: null },
  polygonVertexCountDragRef: { current: null },
  resizeDragRef: { current: null },
  starRatioDragRef: { current: null },
  starVertexCountDragRef: { current: null },
  vectorHandleDragRef: { current: null },
  vectorMarqueeModeRef: { current: null },
  vectorMarqueeStartRef: { current: null },
  vectorMultiDragRef: { current: null },
  vectorSegmentBendDragRef: { current: null },
  vectorVertexDragRef: { current: null },
  ...overrides,
});

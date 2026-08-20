// types
import { TCanvasRefs, TVectorHandleHover } from 'types/design/canvas/types';

export const setExclusiveVectorSelection = (
  canvasRefs: TCanvasRefs,
  selection: { vertexIds?: string[]; handles?: TVectorHandleHover[]; segmentIds?: string[] },
): void => {
  canvasRefs.selectedVectorVertexIdsRef.current = selection.vertexIds ?? [];
  canvasRefs.selectedVectorHandlesRef.current = selection.handles ?? [];
  canvasRefs.selectedVectorSegmentIdsRef.current = selection.segmentIds ?? [];
};

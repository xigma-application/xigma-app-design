// types
import { TCanvasRefs, TVectorHandleHover } from 'types/design/canvas/types';

export const setExclusiveVectorSelection = (
  canvasRefs: TCanvasRefs,
  selection: { vertexIds?: string[]; handles?: TVectorHandleHover[]; segmentIds?: string[] },
): void => {
  canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = selection.vertexIds ?? [];
  canvasRefs.vectorEdit.selectedVectorHandlesRef.current = selection.handles ?? [];
  canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = selection.segmentIds ?? [];
};

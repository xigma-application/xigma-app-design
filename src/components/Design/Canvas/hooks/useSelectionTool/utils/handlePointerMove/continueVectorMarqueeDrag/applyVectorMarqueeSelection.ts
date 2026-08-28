// types
import { TCanvasRefs, TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorMarqueeMode } from 'types/design/selectionTool/types';

export const applyVectorMarqueeSelection = (
  canvasRefs: TCanvasRefs,
  mode: TVectorMarqueeMode | null,
  vertexIds: string[],
  handleHits: TVectorHandleHover[],
  segmentHits: string[],
): void => {
  switch (mode) {
    case 'handles':
      canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = [];
      canvasRefs.vectorEdit.selectedVectorHandlesRef.current = handleHits;
      canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = [];
      break;
    case 'points':
      canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = vertexIds;
      canvasRefs.vectorEdit.selectedVectorHandlesRef.current = [];
      canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = [];
      break;
    case 'everything':
      canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = [];
      canvasRefs.vectorEdit.selectedVectorHandlesRef.current = [];
      canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = segmentHits;
      break;
    default:
      canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = [];
      canvasRefs.vectorEdit.selectedVectorHandlesRef.current = [];
      canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = [];
  }
};

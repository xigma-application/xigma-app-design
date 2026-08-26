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
      canvasRefs.selectedVectorVertexIdsRef.current = [];
      canvasRefs.selectedVectorHandlesRef.current = handleHits;
      canvasRefs.selectedVectorSegmentIdsRef.current = [];
      break;
    case 'points':
      canvasRefs.selectedVectorVertexIdsRef.current = vertexIds;
      canvasRefs.selectedVectorHandlesRef.current = [];
      canvasRefs.selectedVectorSegmentIdsRef.current = [];
      break;
    case 'everything':
      canvasRefs.selectedVectorVertexIdsRef.current = [];
      canvasRefs.selectedVectorHandlesRef.current = [];
      canvasRefs.selectedVectorSegmentIdsRef.current = segmentHits;
      break;
    default:
      canvasRefs.selectedVectorVertexIdsRef.current = [];
      canvasRefs.selectedVectorHandlesRef.current = [];
      canvasRefs.selectedVectorSegmentIdsRef.current = [];
  }
};

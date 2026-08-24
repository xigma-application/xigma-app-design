// types
import { TCanvasRefs, TVectorSelectionSnapshot } from 'types/design/canvas/types';

export const getVectorSelectionSnapshot = (refs: TCanvasRefs): TVectorSelectionSnapshot => ({
  selectedVectorHandles: [...refs.selectedVectorHandlesRef.current],
  selectedVectorSegmentIds: [...refs.selectedVectorSegmentIdsRef.current],
  selectedVectorVertexIds: [...refs.selectedVectorVertexIdsRef.current],
});

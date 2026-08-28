// types
import { TCanvasRefs, TVectorSelectionSnapshot } from 'types/design/canvas/types';

export const getVectorSelectionSnapshot = (refs: TCanvasRefs): TVectorSelectionSnapshot => ({
  selectedVectorHandles: [...refs.vectorEdit.selectedVectorHandlesRef.current],
  selectedVectorSegmentIds: [...refs.vectorEdit.selectedVectorSegmentIdsRef.current],
  selectedVectorVertexIds: [...refs.vectorEdit.selectedVectorVertexIdsRef.current],
});

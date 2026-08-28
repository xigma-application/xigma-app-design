// types
import { TCanvasRefs, TVectorSelectionSnapshot } from 'types/design/canvas/types';

export const applyVectorSelectionSnapshot = (refs: TCanvasRefs, snapshot: TVectorSelectionSnapshot): void => {
  refs.vectorEdit.selectedVectorHandlesRef.current = snapshot.selectedVectorHandles;
  refs.vectorEdit.selectedVectorSegmentIdsRef.current = snapshot.selectedVectorSegmentIds;
  refs.vectorEdit.selectedVectorVertexIdsRef.current = snapshot.selectedVectorVertexIds;
};

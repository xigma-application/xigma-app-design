// types
import { TCanvasRefs, TVectorSelectionSnapshot } from 'types/design/canvas/types';

export const applyVectorSelectionSnapshot = (refs: TCanvasRefs, snapshot: TVectorSelectionSnapshot): void => {
  refs.selectedVectorHandlesRef.current = snapshot.selectedVectorHandles;
  refs.selectedVectorSegmentIdsRef.current = snapshot.selectedVectorSegmentIds;
  refs.selectedVectorVertexIdsRef.current = snapshot.selectedVectorVertexIds;
};

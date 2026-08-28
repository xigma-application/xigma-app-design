// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const isPartOfVectorMultiSelection = (canvasRefs: TCanvasRefs, isHitItemSelected: boolean): boolean => {
  const totalSelected =
    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current.length +
    canvasRefs.vectorEdit.selectedVectorHandlesRef.current.length +
    canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current.length;

  return totalSelected > 1 && isHitItemSelected;
};

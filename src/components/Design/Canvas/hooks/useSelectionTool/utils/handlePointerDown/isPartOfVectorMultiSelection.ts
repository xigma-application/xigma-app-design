// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const isPartOfVectorMultiSelection = (canvasRefs: TCanvasRefs, isHitItemSelected: boolean): boolean => {
  const totalSelected =
    canvasRefs.selectedVectorVertexIdsRef.current.length +
    canvasRefs.selectedVectorHandlesRef.current.length +
    canvasRefs.selectedVectorSegmentIdsRef.current.length;

  return totalSelected > 1 && isHitItemSelected;
};

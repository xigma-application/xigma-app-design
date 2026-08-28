// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { armVectorHandleDrag } from '../../armVectorHandleDrag';
import { TVectorHandleHit } from '../../../../../../utils/getVectorHandleAtPoint';

export const selectAndArmVectorHandleDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
  nodeId: string,
  hit: TVectorHandleHit,
): void => {
  canvasRefs.vectorEdit.selectedVectorHandlesRef.current = [{ end: hit.end, segmentId: hit.segmentId }];
  canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = [];
  canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = [];
  armVectorHandleDrag(canvas, event, selectionRefs.vectorHandleDragRef, nodeId, hit);
};

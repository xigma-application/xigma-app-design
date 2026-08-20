// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';

// utils
import { armVectorVertexDrag } from './armVectorVertexDrag';

export const selectAndArmVectorVertexDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
  node: TVectorNode,
  vertexId: string,
  point: TPoint,
): void => {
  canvasRefs.selectedVectorVertexIdsRef.current = [vertexId];
  canvasRefs.selectedVectorHandlesRef.current = [];
  canvasRefs.selectedVectorSegmentIdsRef.current = [];
  armVectorVertexDrag(canvas, event, selectionRefs.vectorVertexDragRef, node, vertexId, point);
};

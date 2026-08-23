// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';

// utils
import { armVectorVertexDrag } from './armVectorVertexDrag';
import { getVectorFilledFacesTouchingVertexIds } from 'utils/canvas/vectorNetwork/getVectorFilledFacesTouchingVertexIds';

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
  const touchedFaceKeys = getVectorFilledFacesTouchingVertexIds(node, [vertexId]).map((face) => face.key);

  canvasRefs.draggedVectorFillFacesRef.current = touchedFaceKeys.length ? { [node.id]: touchedFaceKeys } : null;
  armVectorVertexDrag(canvas, event, selectionRefs.vectorVertexDragRef, node, vertexId, point);
};

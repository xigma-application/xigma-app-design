// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';

// utils
import { armVectorMultiDrag } from '../../armVectorMultiDrag';
import { getVectorSegmentVertexIds } from 'utils/canvas/vectorNetwork/getVectorSegmentVertexIds';

export const selectAndArmVectorSegmentDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
  node: TVectorNode,
  segmentId: string,
  point: TPoint,
): void => {
  canvasRefs.selectedVectorSegmentIdsRef.current = [segmentId];
  canvasRefs.selectedVectorVertexIdsRef.current = [];
  canvasRefs.selectedVectorHandlesRef.current = [];

  const vertexIds = getVectorSegmentVertexIds(node, [segmentId]);

  armVectorMultiDrag(canvas, event, selectionRefs.vectorMultiDragRef, node, vertexIds, [], point);
};

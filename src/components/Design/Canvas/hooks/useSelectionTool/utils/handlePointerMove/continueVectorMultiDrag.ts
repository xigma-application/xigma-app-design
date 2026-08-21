// others
import { VECTOR_ALIGNMENT_SNAP_TOLERANCE_PX } from 'constant/canvas';

// store
import { updateNode } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TVectorSegment } from 'types/design/types';

// utils
import { getAllVectorVertexPositions } from '../../../../utils/getAllVectorVertexPositions';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { getVectorGroupAlignmentGuide } from '../../../../utils/getVectorGroupAlignmentGuide';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { translateVectorVertices } from '../../../../utils/translateVectorVertices';

const translateVectorHandles = (
  segments: Record<string, TVectorSegment>,
  handleOrigins: Record<string, TPoint>,
  deltaX: number,
  deltaY: number,
): Record<string, TVectorSegment> =>
  Object.entries(handleOrigins).reduce((nextSegments, [key, origin]) => {
    const [end, segmentId] = key.split(':') as ['end' | 'start', string];
    const segment = nextSegments[segmentId];
    const field = end === 'start' ? 'tangentStart' : 'tangentEnd';

    return {
      ...nextSegments,
      [segmentId]: { ...segment, [field]: { x: Math.round(origin.x + deltaX), y: Math.round(origin.y + deltaY) } },
    };
  }, segments);

export const continueVectorMultiDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  const dragState = canvasRefs.vectorMultiDragRef.current;

  if (dragState) {
    const state = store.getState();
    const node = getVectorEditingNode(state.design.nodes, dragState.nodeId);

    if (node) {
      dragState.hasMoved = true;

      const viewport = selectViewport(state);
      const point = screenToWorld(getPointerPosition(canvas, event), viewport);
      const rawDeltaX = point.x - dragState.pointerStart.x;
      const rawDeltaY = point.y - dragState.pointerStart.y;
      const draggedVertexIds = Object.keys(dragState.vertexOrigins);
      const draggedPoints = draggedVertexIds.map((id) => ({
        x: dragState.vertexOrigins[id].x + rawDeltaX,
        y: dragState.vertexOrigins[id].y + rawDeltaY,
      }));
      const candidates = getAllVectorVertexPositions(state.design.nodes, draggedVertexIds);
      const alignmentTolerance = VECTOR_ALIGNMENT_SNAP_TOLERANCE_PX / viewport.zoom;
      const { deltaCorrection, guide } = getVectorGroupAlignmentGuide(draggedPoints, candidates, alignmentTolerance);
      const deltaX = rawDeltaX + deltaCorrection.x;
      const deltaY = rawDeltaY + deltaCorrection.y;
      const vertices = { ...node.vertices, ...translateVectorVertices(dragState.vertexOrigins, deltaX, deltaY) };
      const segments = translateVectorHandles(node.segments, dragState.handleOrigins, deltaX, deltaY);

      if (dragState.boxOrigin && canvasRefs.vectorMultiSelectBoxRef.current) {
        canvasRefs.vectorMultiSelectBoxRef.current = {
          ...canvasRefs.vectorMultiSelectBoxRef.current,
          bounds: { ...dragState.boxOrigin, x: dragState.boxOrigin.x + deltaX, y: dragState.boxOrigin.y + deltaY },
        };
      }

      dispatch(updateNode({ changes: { segments, vertices }, id: dragState.nodeId }));
      canvasRefs.vectorAlignmentGuideRef.current = guide;
      setClassName('move');
    }
  }
};

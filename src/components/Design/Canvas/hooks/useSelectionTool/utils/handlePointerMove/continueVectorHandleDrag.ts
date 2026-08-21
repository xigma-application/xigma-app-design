// store
import { updateNode } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';
import { TVectorTangent } from 'types/design/types';

// utils
import { applyVectorPointSnapping } from '../../../../utils/applyVectorPointSnapping';
import { getMirroredVectorSegments } from '../../../../utils/getMirroredVectorSegments';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const continueVectorHandleDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
  setClassName: (className: string | null) => void,
): void => {
  const dragState = selectionRefs.vectorHandleDragRef.current;

  if (dragState) {
    const state = store.getState();
    const node = getVectorEditingNode(state.design.nodes, dragState.nodeId);

    if (node) {
      const viewport = selectViewport(state);
      const point = screenToWorld(getPointerPosition(canvas, event), viewport);
      const vertex = node.vertices[dragState.vertexId];
      const {
        guide,
        isAngleSnapped,
        point: snappedPoint,
      } = applyVectorPointSnapping(vertex, point, viewport.zoom, event.shiftKey, state.design.nodes, dragState.vertexId);
      const tangent: TVectorTangent = { x: Math.round(snappedPoint.x - vertex.x), y: Math.round(snappedPoint.y - vertex.y) };
      const field = dragState.end === 'start' ? 'tangentStart' : 'tangentEnd';
      const mode = node.vertexHandleModes[dragState.vertexId] ?? 'corner';
      const segments = getMirroredVectorSegments(node.segments, dragState.vertexId, mode, dragState.segmentId, field, tangent);

      dispatch(updateNode({ changes: { segments }, id: dragState.nodeId }));
      canvasRefs.snappedVectorHandleRef.current = isAngleSnapped ? { end: dragState.end, segmentId: dragState.segmentId } : null;
      canvasRefs.vectorAlignmentGuideRef.current = guide;
      setClassName('move');
    }
  }
};

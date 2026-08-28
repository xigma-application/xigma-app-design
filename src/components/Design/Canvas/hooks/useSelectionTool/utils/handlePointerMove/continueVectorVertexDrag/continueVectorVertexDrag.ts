// others
import { VECTOR_ALIGNMENT_SNAP_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { updateNode } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { getAllVectorVertexPositions } from '../../../../../utils/getAllVectorVertexPositions';
import { getPointerPosition } from '../../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { getVectorGroupAlignmentGuide } from '../../../../../utils/getVectorGroupAlignmentGuide';
import { resolveVectorVertexMerge } from './resolveVectorVertexMerge';
import { scheduleThrottledDispatch } from 'components/Design/Canvas/utils/scheduleThrottledDispatch';
import { screenToWorld } from '../../../../../utils/screenToWorld';
import { translateVectorVertices } from '../../../../../utils/translateVectorVertices';

export const continueVectorVertexDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
  setClassName: (className: string | null) => void,
): void => {
  const dragState = selectionRefs.vectorVertexDragRef.current;

  if (dragState) {
    const state = store.getState();
    const node = getVectorEditingNode(state.design.nodes, dragState.nodeId);

    if (node) {
      const viewport = selectViewport(state);
      const point = screenToWorld(getPointerPosition(canvas, event), viewport);
      const deltaX = point.x - dragState.pointerStart.x;
      const deltaY = point.y - dragState.pointerStart.y;
      const draggedVertexIds = Object.keys(dragState.origins);
      const draggedPoints = draggedVertexIds.map((id) => ({ x: dragState.origins[id].x + deltaX, y: dragState.origins[id].y + deltaY }));
      const candidates = getAllVectorVertexPositions(state.design.nodes, draggedVertexIds);
      const alignmentTolerance = VECTOR_ALIGNMENT_SNAP_TOLERANCE_PX / viewport.zoom;
      const { deltaCorrection, guide } = getVectorGroupAlignmentGuide(draggedPoints, candidates, alignmentTolerance);
      const draggedVertices = translateVectorVertices(dragState.origins, deltaX + deltaCorrection.x, deltaY + deltaCorrection.y);

      if (draggedVertexIds.length === 1) {
        const mergeTolerance = VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom;
        resolveVectorVertexMerge(draggedVertices, dragState, state.design.nodes, guide, mergeTolerance, canvasRefs, setClassName);
      } else {
        canvasRefs.vectorEdit.vectorAlignmentGuideRef.current = guide;
        setClassName('move');
      }

      scheduleThrottledDispatch(dragState.dispatchThrottle, () =>
        dispatch(updateNode({ changes: { vertices: { ...node.vertices, ...draggedVertices } }, id: dragState.nodeId })),
      );
    }
  }
};

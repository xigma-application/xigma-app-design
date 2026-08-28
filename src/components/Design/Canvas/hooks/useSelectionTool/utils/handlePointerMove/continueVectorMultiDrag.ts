// others
import { VECTOR_ALIGNMENT_SNAP_TOLERANCE_PX } from 'constant/canvas';

// store
import { updateNode } from 'store/design/slice';
import { selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorSegment } from 'types/design/types';

// utils
import { dispatchAsOneGestureIfMultiNode } from '../../../../utils/dispatchAsOneGestureIfMultiNode';
import { getAllVectorVertexPositions } from '../../../../utils/getAllVectorVertexPositions';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { getVectorGroupAlignmentGuide } from '../../../../utils/getVectorGroupAlignmentGuide';
import { groupVectorMultiSelectOriginsByNode } from '../../../../utils/groupVectorMultiSelectOriginsByNode';
import { scheduleThrottledDispatch } from 'components/Design/Canvas/utils/scheduleThrottledDispatch';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { translateVectorVertices } from '../../../../utils/translateVectorVertices';

const pickOrigins = (origins: Record<string, TPoint>, ids: string[]): Record<string, TPoint> =>
  Object.fromEntries(ids.map((id) => [id, origins[id]]));

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
  const dragState = canvasRefs.vectorMultiSelect.vectorMultiDragRef.current;

  if (dragState) {
    const state = store.getState();
    const nodes: Record<string, TSceneNode> = state.design.nodes;
    const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
    const groups = groupVectorMultiSelectOriginsByNode(nodes, vectorEditingNodeIds, dragState.vertexOrigins, dragState.handleOrigins);

    if (Object.keys(groups).length !== 0) {
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
      const candidates = getAllVectorVertexPositions(nodes, draggedVertexIds);
      const alignmentTolerance = VECTOR_ALIGNMENT_SNAP_TOLERANCE_PX / viewport.zoom;
      const { deltaCorrection, guide } = getVectorGroupAlignmentGuide(draggedPoints, candidates, alignmentTolerance);
      const deltaX = rawDeltaX + deltaCorrection.x;
      const deltaY = rawDeltaY + deltaCorrection.y;

      scheduleThrottledDispatch(dragState.dispatchThrottle, () =>
        dispatchAsOneGestureIfMultiNode(dispatch, Object.keys(groups).length, () => {
          Object.entries(groups).forEach(([nodeId, group]) => {
            const node = getVectorEditingNode(nodes, nodeId);

            /* v8 ignore if -- groups only ever contains node ids groupVectorMultiSelectOriginsByNode already resolved against this same `nodes` object, so the lookup can't fail here */
            if (node) {
              const vertices = {
                ...node.vertices,
                ...translateVectorVertices(pickOrigins(dragState.vertexOrigins, group.vertexIds), deltaX, deltaY),
              };
              const segments = translateVectorHandles(
                node.segments,
                pickOrigins(dragState.handleOrigins, group.handleKeys),
                deltaX,
                deltaY,
              );

              dispatch(updateNode({ changes: { segments, vertices }, id: nodeId }));
            }
          });
        }),
      );

      if (dragState.boxOrigin && canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef.current) {
        canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef.current = {
          ...canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef.current,
          bounds: { ...dragState.boxOrigin, x: dragState.boxOrigin.x + deltaX, y: dragState.boxOrigin.y + deltaY },
        };
      }

      canvasRefs.vectorEdit.vectorAlignmentGuideRef.current = guide;
      setClassName('move');
    }
  }
};

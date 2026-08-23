// others
import { VECTOR_EDGE_HIT_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectActiveTool, selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorEdgeAtPointAcrossOpenNodes } from '../../../../utils/getVectorEdgeAtPointAcrossOpenNodes';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const resolveVectorCutHover = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  const state = store.getState();

  if (selectActiveTool(state) === ToolName.cut && event.buttons === 0) {
    setClassName('cut-off');

    const viewport = selectViewport(state);
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const edgeHit = getVectorEdgeAtPointAcrossOpenNodes(
      point,
      selectVectorEditingNodeIds(state),
      state.design.nodes,
      VECTOR_EDGE_HIT_TOLERANCE_PX / viewport.zoom,
      VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
    );

    canvasRefs.hoveredVectorCutSegmentRef.current = edgeHit ? { nodeId: edgeHit.node.id, segmentId: edgeHit.hit.segmentId } : null;
    canvasRefs.hoveredVectorCutPointRef.current = edgeHit ? edgeHit.hit.point : null;
  } else {
    canvasRefs.hoveredVectorCutSegmentRef.current = null;
    canvasRefs.hoveredVectorCutPointRef.current = null;
  }
};

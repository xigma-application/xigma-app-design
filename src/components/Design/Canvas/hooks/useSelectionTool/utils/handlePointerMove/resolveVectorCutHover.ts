// others
import { VECTOR_EDGE_HIT_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectActiveTool, selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';

// utils
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getVectorEdgeAtPointAcrossOpenNodes } from '../../../../utils/getVectorEdgeAtPointAcrossOpenNodes';
import { screenToWorld } from 'utils/transform/screenToWorld';

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
      state.design.pages[state.design.activePageId].nodes,
      VECTOR_EDGE_HIT_TOLERANCE_PX / viewport.zoom,
      VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
    );

    canvasRefs.hover.hoveredVectorCutSegmentRef.current = edgeHit ? { nodeId: edgeHit.node.id, segmentId: edgeHit.hit.segmentId } : null;
    canvasRefs.hover.hoveredVectorCutPointRef.current = edgeHit ? edgeHit.hit.point : null;
  } else {
    canvasRefs.hover.hoveredVectorCutSegmentRef.current = null;
    canvasRefs.hover.hoveredVectorCutPointRef.current = null;
  }
};

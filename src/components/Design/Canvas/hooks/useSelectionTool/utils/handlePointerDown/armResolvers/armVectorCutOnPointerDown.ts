// others
import { VECTOR_EDGE_HIT_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';
import { ToolName } from 'types/design/enums';

// utils
import { getVectorCutHitAcrossOpenNodes } from '../../../../../utils/getVectorCutHitAcrossOpenNodes';

export const armVectorCutOnPointerDown = ({
  activeTool,
  canvas,
  canvasRefs,
  event,
  point,
  selectionRefs,
  setClassName,
  viewport,
}: TArmContext): true | undefined => {
  const state = store.getState();
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);

  if (activeTool === ToolName.cut && vectorEditingNodeIds.length > 0) {
    const result = getVectorCutHitAcrossOpenNodes(
      point,
      vectorEditingNodeIds,
      state.design.nodes,
      VECTOR_EDGE_HIT_TOLERANCE_PX / viewport.zoom,
      VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
    );

    selectionRefs.vectorCutDragRef.current = {
      hit: result && { nodeId: result.node.id, segmentId: result.hit.segmentId, t: result.hit.t },
      lineStart: point,
      status: 'pending',
    };
    canvasRefs.vectorCutPreviewRef.current = { crossings: [], lineEnd: point, lineStart: point };
    canvas.setPointerCapture(event.pointerId);
    setClassName('cut-on');

    return true;
  }
};

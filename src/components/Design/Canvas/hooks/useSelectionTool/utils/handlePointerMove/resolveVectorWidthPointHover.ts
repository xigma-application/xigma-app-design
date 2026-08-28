// others
import { VECTOR_EDGE_HIT_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectActiveTool, selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';

// utils
import { getEligibleVectorWidthNodes } from '../../../../utils/getEligibleVectorWidthNodes';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getRotatedResizeCursorUrl } from 'utils/canvas/getRotatedResizeCursorUrl';
import { getVectorCutHitAcrossOpenNodes } from '../../../../utils/getVectorCutHitAcrossOpenNodes';
import { getVectorWidthPointHandleAtPoint } from '../../../../utils/getVectorWidthPointHandleAtPoint';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const resolveVectorWidthPointHover = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  const state = store.getState();
  const activeTool = selectActiveTool(state);
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);

  if (activeTool === ToolName.variableWidth && vectorEditingNodeIds.length > 0 && event.buttons === 0) {
    const viewport = selectViewport(state);
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const eligibleNodes = getEligibleVectorWidthNodes(vectorEditingNodeIds, state.design.pages[state.design.activePageId].nodes);
    const handleHit = getVectorWidthPointHandleAtPoint(point, eligibleNodes, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom);
    const strokeHit = handleHit
      ? null
      : getVectorCutHitAcrossOpenNodes(
          point,
          eligibleNodes.map((node) => node.id),
          state.design.pages[state.design.activePageId].nodes,
          VECTOR_EDGE_HIT_TOLERANCE_PX / viewport.zoom,
          VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
        );

    if (handleHit && handleHit.target !== 'point') {
      canvasRefs.hover.hoveredVectorWidthPointRef.current = {
        nodeId: handleHit.nodeId,
        segmentId: handleHit.segmentId,
        t: handleHit.t,
      };
      canvas.style.cursor = getRotatedResizeCursorUrl(handleHit.angle) ?? '';
      setClassName(null);
    } else if (handleHit) {
      canvasRefs.hover.hoveredVectorWidthPointRef.current = {
        nodeId: handleHit.nodeId,
        segmentId: handleHit.segmentId,
        t: handleHit.t,
      };
      canvas.style.cursor = '';
      setClassName('controller');
    } else if (strokeHit) {
      canvasRefs.hover.hoveredVectorWidthPointRef.current = {
        nodeId: strokeHit.node.id,
        segmentId: strokeHit.hit.segmentId,
        t: strokeHit.hit.t,
      };
      canvas.style.cursor = '';
      setClassName('controller');
    } else {
      canvasRefs.hover.hoveredVectorWidthPointRef.current = null;
      canvas.style.cursor = '';
      setClassName(null);
    }
  } else {
    canvasRefs.hover.hoveredVectorWidthPointRef.current = null;
  }
};

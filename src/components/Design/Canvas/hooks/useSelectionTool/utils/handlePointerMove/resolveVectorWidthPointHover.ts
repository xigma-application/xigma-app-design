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
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { getVectorCutHitAcrossOpenNodes } from '../../../../utils/getVectorCutHitAcrossOpenNodes';
import { getVectorWidthPointHandleAtPoint } from '../../../../utils/getVectorWidthPointHandleAtPoint';
import { screenToWorld } from 'utils/transform/screenToWorld';

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

    switch (true) {
      case handleHit !== null && handleHit.target !== 'point':
        canvasRefs.hover.hoveredVectorWidthPointRef.current = {
          nodeId: handleHit.nodeId,
          segmentId: handleHit.segmentId,
          t: handleHit.t,
        };
        canvas.style.cursor = getRotatedCursorUrl('resize', handleHit.angle) ?? '';
        setClassName(null);
        break;
      case handleHit !== null:
        canvasRefs.hover.hoveredVectorWidthPointRef.current = {
          nodeId: handleHit.nodeId,
          segmentId: handleHit.segmentId,
          t: handleHit.t,
        };
        canvas.style.cursor = '';
        setClassName('controller');
        break;
      case strokeHit !== null:
        canvasRefs.hover.hoveredVectorWidthPointRef.current = {
          nodeId: strokeHit.node.id,
          segmentId: strokeHit.hit.segmentId,
          t: strokeHit.hit.t,
        };
        canvas.style.cursor = '';
        setClassName('controller');
        break;
      default:
        canvasRefs.hover.hoveredVectorWidthPointRef.current = null;
        canvas.style.cursor = '';
        setClassName(null);
    }
  } else {
    canvasRefs.hover.hoveredVectorWidthPointRef.current = null;
  }
};

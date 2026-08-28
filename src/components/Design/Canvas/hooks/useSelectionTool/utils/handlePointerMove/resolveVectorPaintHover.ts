// store
import { selectActiveTool, selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorFaceAtPointAcrossOpenNodes } from '../../../../utils/getVectorFaceAtPointAcrossOpenNodes';
import { getVectorFillLoopKeyAtPoint } from 'utils/canvas/vectorNetwork/getVectorFillLoopKeyAtPoint';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const resolveVectorPaintHover = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  const state = store.getState();
  const activeTool = selectActiveTool(state);
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);

  if (activeTool === ToolName.paint && vectorEditingNodeIds.length > 0 && event.buttons === 0) {
    const viewport = selectViewport(state);
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const hit = getVectorFaceAtPointAcrossOpenNodes(point, vectorEditingNodeIds, state.design.pages[state.design.activePageId].nodes);
    const isFilled = Boolean(hit && getVectorFillLoopKeyAtPoint(hit.node, point));

    canvasRefs.hover.hoveredVectorPaintFaceKeyRef.current = hit ? { faceKey: hit.face.key, isFilled, nodeId: hit.node.id } : null;
    setClassName(hit ? (isFilled ? 'paint-remove' : 'paint-add') : 'paint');
  } else {
    canvasRefs.hover.hoveredVectorPaintFaceKeyRef.current = null;
  }
};

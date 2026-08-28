// store
import { selectActiveTool, selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorFaceAtPointAcrossOpenNodes } from '../../../../utils/getVectorFaceAtPointAcrossOpenNodes';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const resolveVectorFaceSelectHover = (canvas: HTMLCanvasElement, event: PointerEvent, canvasRefs: TCanvasRefs): void => {
  const state = store.getState();
  const activeTool = selectActiveTool(state);
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);

  if (activeTool === ToolName.move && vectorEditingNodeIds.length > 0 && event.buttons === 0) {
    const viewport = selectViewport(state);
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const hit = getVectorFaceAtPointAcrossOpenNodes(point, vectorEditingNodeIds, state.design.pages[state.design.activePageId].nodes);

    canvasRefs.hover.hoveredVectorFaceSelectRef.current = hit ? { faceKey: hit.face.key, nodeId: hit.node.id } : null;
  } else {
    canvasRefs.hover.hoveredVectorFaceSelectRef.current = null;
  }
};

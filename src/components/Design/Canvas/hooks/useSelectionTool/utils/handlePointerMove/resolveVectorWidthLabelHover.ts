// store
import { selectActivePage, selectActiveTool, selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorWidthLabelAtPoint } from '../../../../utils/getVectorWidthLabelAtPoint';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const resolveVectorWidthLabelHover = (canvas: HTMLCanvasElement, event: PointerEvent, canvasRefs: TCanvasRefs): void => {
  const state = store.getState();
  const activeTool = selectActiveTool(state);
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);

  if (activeTool === ToolName.variableWidth && vectorEditingNodeIds.length > 0 && event.buttons === 0) {
    const viewport = selectViewport(state);
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const { nodes } = selectActivePage(state);

    canvasRefs.hover.hoveredVectorWidthLabelRef.current = getVectorWidthLabelAtPoint(point, nodes, canvasRefs, viewport.zoom);
  } else {
    canvasRefs.hover.hoveredVectorWidthLabelRef.current = null;
  }
};

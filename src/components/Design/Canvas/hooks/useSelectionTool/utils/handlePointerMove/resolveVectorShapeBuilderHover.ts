// store
import { selectActiveTool, selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';

// utils
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getVectorFaceAtPointAcrossOpenNodes } from '../../../../utils/getVectorFaceAtPointAcrossOpenNodes';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const resolveVectorShapeBuilderHover = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  const state = store.getState();
  const activeTool = selectActiveTool(state);
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);

  if (activeTool === ToolName.shapeBuilder && vectorEditingNodeIds.length > 0 && event.buttons === 0) {
    const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
    const hit = getVectorFaceAtPointAcrossOpenNodes(point, vectorEditingNodeIds, state.design.pages[state.design.activePageId].nodes);

    canvasRefs.hover.hoveredVectorShapeBuilderFaceRef.current = hit ? { faceKey: hit.face.key, nodeId: hit.node.id } : null;
    canvasRefs.shapeBuilder.isVectorShapeBuilderSubtractRef.current = event.altKey;
    setClassName(event.altKey ? 'remove' : 'add');
  } else {
    canvasRefs.hover.hoveredVectorShapeBuilderFaceRef.current = null;
  }
};

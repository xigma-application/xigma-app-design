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
    const hit = getVectorFaceAtPointAcrossOpenNodes(point, vectorEditingNodeIds, state.design.nodes);

    canvasRefs.hoveredVectorShapeBuilderFaceRef.current = hit ? { faceKey: hit.face.key, nodeId: hit.node.id } : null;
    canvasRefs.isVectorShapeBuilderSubtractRef.current = event.altKey;
    setClassName(event.altKey ? 'remove' : 'add');
  } else {
    canvasRefs.hoveredVectorShapeBuilderFaceRef.current = null;
  }
};

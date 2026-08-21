// store
import { selectActiveTool, selectVectorEditingNodeId, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';

// utils
import { bakeVectorNodeRotation } from '../../../../utils/bakeVectorNodeRotation';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { getVectorFaceAtPoint } from '../../../../utils/getVectorFaceAtPoint';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const resolveVectorPaintHover = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  const state = store.getState();
  const activeTool = selectActiveTool(state);
  const node = getVectorEditingNode(state.design.nodes, selectVectorEditingNodeId(state));

  if (activeTool === ToolName.paint && node && event.buttons === 0) {
    const viewport = selectViewport(state);
    const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const faceKey = getVectorFaceAtPoint(point, bakedNode);

    canvasRefs.hoveredVectorPaintFaceKeyRef.current = faceKey;
    setClassName(faceKey ? (node.filledFaceKeys.includes(faceKey) ? 'paint-remove' : 'paint-add') : 'paint');
  } else {
    canvasRefs.hoveredVectorPaintFaceKeyRef.current = null;
  }
};

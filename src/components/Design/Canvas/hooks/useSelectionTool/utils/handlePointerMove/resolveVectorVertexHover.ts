import { RefObject } from 'react';

// others
import { VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectActiveTool, selectVectorEditingNodeId, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { bakeVectorNodeRotation } from '../../../../utils/bakeVectorNodeRotation';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { getVectorVertexAtPoint } from '../../../../utils/getVectorVertexAtPoint';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const resolveVectorVertexHover = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  hoveredVectorVertexIdRef: RefObject<string | null>,
): void => {
  const state = store.getState();
  const node = getVectorEditingNode(state.design.nodes, selectVectorEditingNodeId(state));

  if (node && selectActiveTool(state) !== ToolName.paint) {
    const viewport = selectViewport(state);
    const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const hit = getVectorVertexAtPoint(point, bakedNode, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom);

    hoveredVectorVertexIdRef.current = hit?.vertexId ?? null;
  } else {
    hoveredVectorVertexIdRef.current = null;
  }
};

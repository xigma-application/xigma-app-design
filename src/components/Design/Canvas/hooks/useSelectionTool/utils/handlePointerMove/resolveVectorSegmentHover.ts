import { RefObject } from 'react';

// others
import { VECTOR_EDGE_HIT_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectVectorEditingNodeId, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// utils
import { bakeVectorNodeRotation } from '../../../../utils/bakeVectorNodeRotation';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorEdgeAtPoint } from '../../../../utils/getVectorEdgeAtPoint';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const resolveVectorSegmentHover = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  hoveredVectorSegmentIdRef: RefObject<string | null>,
): void => {
  const state = store.getState();
  const node = getVectorEditingNode(state.design.nodes, selectVectorEditingNodeId(state));

  if (node) {
    const viewport = selectViewport(state);
    const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const hit = getVectorEdgeAtPoint(
      point,
      bakedNode,
      VECTOR_EDGE_HIT_TOLERANCE_PX / viewport.zoom,
      VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
    );

    hoveredVectorSegmentIdRef.current = hit?.segmentId ?? null;
  } else {
    hoveredVectorSegmentIdRef.current = null;
  }
};

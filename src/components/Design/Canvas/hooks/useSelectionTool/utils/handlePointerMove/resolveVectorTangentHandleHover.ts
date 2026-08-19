import { RefObject } from 'react';

// others
import { VECTOR_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectVectorEditingNodeId, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TVectorHandleHover } from 'types/design/canvas/types';

// utils
import { bakeVectorNodeRotation } from '../../../../utils/bakeVectorNodeRotation';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { getVectorHandleAtPoint } from '../../../../utils/getVectorHandleAtPoint';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const resolveVectorTangentHandleHover = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  hoveredVectorHandleRef: RefObject<TVectorHandleHover | null>,
): void => {
  const state = store.getState();
  const node = getVectorEditingNode(state.design.nodes, selectVectorEditingNodeId(state));

  if (node) {
    const viewport = selectViewport(state);
    const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const hit = getVectorHandleAtPoint(point, bakedNode, VECTOR_HANDLE_HIT_RADIUS_PX / viewport.zoom);

    hoveredVectorHandleRef.current = hit ? { end: hit.end, segmentId: hit.segmentId } : null;
  } else {
    hoveredVectorHandleRef.current = null;
  }
};

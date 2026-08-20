// others
import { VECTOR_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectPenActiveVertexId, selectVectorEditingNodeId, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { bakeVectorNodeRotation } from '../../../../utils/bakeVectorNodeRotation';
import { getOneHopVectorVertexIds } from 'utils/canvas/vectorNetwork/getOneHopVectorVertexIds';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { getVectorHandleAtPoint } from '../../../../utils/getVectorHandleAtPoint';
import { getVisualSelectedVectorVertexIds } from 'utils/canvas/vectorNetwork/getVisualSelectedVectorVertexIds';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const resolveVectorTangentHandleHover = (canvas: HTMLCanvasElement, event: PointerEvent, canvasRefs: TCanvasRefs): void => {
  const state = store.getState();
  const node = getVectorEditingNode(state.design.nodes, selectVectorEditingNodeId(state));

  if (node) {
    const viewport = selectViewport(state);
    const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const visualSelectedVertexIds = getVisualSelectedVectorVertexIds(
      canvasRefs.selectedVectorVertexIdsRef.current,
      selectPenActiveVertexId(state),
    );
    const oneHopVertexIds = getOneHopVectorVertexIds(node, visualSelectedVertexIds);
    const hit = getVectorHandleAtPoint(
      point,
      bakedNode,
      VECTOR_HANDLE_HIT_RADIUS_PX / viewport.zoom,
      visualSelectedVertexIds,
      oneHopVertexIds,
      canvasRefs.selectedVectorHandlesRef.current,
      canvasRefs.selectedVectorSegmentIdsRef.current,
    );

    canvasRefs.hoveredVectorHandleRef.current = hit ? { end: hit.end, segmentId: hit.segmentId } : null;
  } else {
    canvasRefs.hoveredVectorHandleRef.current = null;
  }
};

// others
import { VECTOR_EDGE_HIT_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { store } from 'store';

// types
import { TArmContext } from '../../types';

// utils
import { getVectorEdgeAtPointAcrossOpenNodes } from '../../../../../../utils/getVectorEdgeAtPointAcrossOpenNodes';

export const hitsSelectedSegment = (context: TArmContext, vectorEditingNodeIds: string[]): boolean => {
  const { canvasRefs, point, viewport } = context;
  const state = store.getState();
  const hit = getVectorEdgeAtPointAcrossOpenNodes(
    point,
    vectorEditingNodeIds,
    state.design.nodes,
    VECTOR_EDGE_HIT_TOLERANCE_PX / viewport.zoom,
    VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
  );

  return Boolean(hit && canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current.includes(hit.hit.segmentId));
};

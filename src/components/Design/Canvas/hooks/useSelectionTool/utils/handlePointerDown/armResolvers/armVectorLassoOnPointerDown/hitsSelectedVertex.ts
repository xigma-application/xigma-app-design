// others
import { VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { store } from 'store';

// types
import { TArmContext } from '../../types';

// utils
import { getVectorVertexAtPointAcrossOpenNodes } from '../../../../../../utils/getVectorVertexAtPointAcrossOpenNodes';

export const hitsSelectedVertex = (context: TArmContext, vectorEditingNodeIds: string[]): boolean => {
  const { canvasRefs, point, viewport } = context;
  const state = store.getState();
  const hit = getVectorVertexAtPointAcrossOpenNodes(
    point,
    vectorEditingNodeIds,
    state.design.pages[state.design.activePageId].nodes,
    VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
  );

  return Boolean(hit && canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current.includes(hit.vertexId));
};

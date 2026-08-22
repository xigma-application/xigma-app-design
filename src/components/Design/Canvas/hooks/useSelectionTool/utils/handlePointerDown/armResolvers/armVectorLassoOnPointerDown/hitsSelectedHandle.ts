// others
import { VECTOR_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectPenActiveVertexId } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../../types';

// utils
import { getVectorHandleAtPointAcrossOpenNodes } from '../../../../../../utils/getVectorHandleAtPointAcrossOpenNodes';
import { getVisualSelectedVectorVertexIds } from 'utils/canvas/vectorNetwork/getVisualSelectedVectorVertexIds';

export const hitsSelectedHandle = (context: TArmContext, vectorEditingNodeIds: string[]): boolean => {
  const { canvasRefs, point, viewport } = context;
  const state = store.getState();
  const visualSelectedVertexIds = getVisualSelectedVectorVertexIds(
    canvasRefs.selectedVectorVertexIdsRef.current,
    selectPenActiveVertexId(state),
  );
  const hit = getVectorHandleAtPointAcrossOpenNodes(
    point,
    vectorEditingNodeIds,
    state.design.nodes,
    VECTOR_HANDLE_HIT_RADIUS_PX / viewport.zoom,
    visualSelectedVertexIds,
    canvasRefs.selectedVectorHandlesRef.current,
    canvasRefs.selectedVectorSegmentIdsRef.current,
  );

  return Boolean(
    hit &&
    canvasRefs.selectedVectorHandlesRef.current.some((handle) => handle.end === hit.hit.end && handle.segmentId === hit.hit.segmentId),
  );
};

// others
import { VECTOR_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectPenActiveVertexId, selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../../types';

// utils
import { armVectorHandleClick } from './armVectorHandleClick';
import { getVectorHandleAtPointAcrossOpenNodes } from '../../../../../../utils/getVectorHandleAtPointAcrossOpenNodes';
import { getVisualSelectedVectorVertexIds } from 'utils/canvas/vectorNetwork/getVisualSelectedVectorVertexIds';

export const armVectorHandleOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectionRefs,
  viewport,
}: TArmContext): true | undefined => {
  const state = store.getState();
  const visualSelectedVertexIds = getVisualSelectedVectorVertexIds(
    canvasRefs.selectedVectorVertexIdsRef.current,
    selectPenActiveVertexId(state),
  );
  const result = getVectorHandleAtPointAcrossOpenNodes(
    point,
    selectVectorEditingNodeIds(state),
    state.design.nodes,
    VECTOR_HANDLE_HIT_RADIUS_PX / viewport.zoom,
    visualSelectedVertexIds,
    canvasRefs.selectedVectorHandlesRef.current,
    canvasRefs.selectedVectorSegmentIdsRef.current,
  );

  if (result) {
    armVectorHandleClick(canvas, event, canvasRefs, selectionRefs, result.node, result.hit, point);
    return true;
  }
};

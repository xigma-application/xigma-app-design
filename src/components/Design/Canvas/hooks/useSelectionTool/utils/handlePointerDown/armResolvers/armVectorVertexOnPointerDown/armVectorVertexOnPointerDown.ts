// others
import { VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../../types';

// utils
import { armVectorVertexClick } from './armVectorVertexClick';
import { getVectorVertexAtPointAcrossOpenNodes } from '../../../../../../utils/getVectorVertexAtPointAcrossOpenNodes';

export const armVectorVertexOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectionRefs,
  viewport,
}: TArmContext): true | undefined => {
  const state = store.getState();
  const result = getVectorVertexAtPointAcrossOpenNodes(
    point,
    selectVectorEditingNodeIds(state),
    state.design.pages[state.design.activePageId].nodes,
    VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
  );

  if (result) {
    armVectorVertexClick(canvas, event, canvasRefs, selectionRefs, result.node, { vertexId: result.vertexId }, point);
    return true;
  }
};

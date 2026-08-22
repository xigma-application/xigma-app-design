// others
import { VECTOR_EDGE_HIT_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../../types';

// utils
import { armVectorSegmentClick } from './armVectorSegmentClick';
import { getVectorEdgeAtPointAcrossOpenNodes } from '../../../../../../utils/getVectorEdgeAtPointAcrossOpenNodes';
import { getVectorSegmentMidpointAtPoint } from 'utils/canvas/vectorNetwork/getVectorSegmentMidpointAtPoint';

export const armVectorSegmentOnPointerDown = ({ canvas, canvasRefs, event, point, viewport }: TArmContext): true | undefined => {
  const state = store.getState();
  const result = getVectorEdgeAtPointAcrossOpenNodes(
    point,
    selectVectorEditingNodeIds(state),
    state.design.nodes,
    VECTOR_EDGE_HIT_TOLERANCE_PX / viewport.zoom,
    VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
  );

  if (result) {
    const midpointHit = getVectorSegmentMidpointAtPoint(point, result.node, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom);
    const canSplit = midpointHit?.segmentId === result.hit.segmentId;

    armVectorSegmentClick(canvas, event, canvasRefs, result.node, result.hit.segmentId, canSplit, point);

    return true;
  }
};

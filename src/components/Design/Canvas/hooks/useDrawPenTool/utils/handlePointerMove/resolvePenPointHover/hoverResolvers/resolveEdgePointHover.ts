// others
import { VECTOR_EDGE_HIT_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { TPenPointHoverContext, TPenPointHoverResult } from '../types';

// utils
import { getVectorEdgeAtPoint } from '../../../../../../utils/getVectorEdgeAtPoint';

export const resolveEdgePointHover = ({ node, point, viewport }: TPenPointHoverContext): TPenPointHoverResult | undefined => {
  const edgeHover = getVectorEdgeAtPoint(
    point,
    node,
    VECTOR_EDGE_HIT_TOLERANCE_PX / viewport.zoom,
    VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
  );

  if (edgeHover) {
    return { hoverKind: edgeHover.snapped ? 'edge-snap' : 'edge', point: edgeHover.point, segmentId: edgeHover.segmentId };
  }
};

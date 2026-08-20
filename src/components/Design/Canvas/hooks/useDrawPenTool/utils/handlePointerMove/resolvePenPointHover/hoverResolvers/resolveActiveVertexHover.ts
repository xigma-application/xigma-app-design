// others
import { VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { TPenPointHoverContext, TPenPointHoverResult } from '../types';

// utils
import { isPointNearVertex } from '../../../../../../utils/isPointNearVertex';

export const resolveActiveVertexHover = ({
  excludeVertexId,
  node,
  point,
  viewport,
}: TPenPointHoverContext): TPenPointHoverResult | undefined => {
  const activeVertex = excludeVertexId ? node.vertices[excludeVertexId] : null;

  if (activeVertex && isPointNearVertex(point, activeVertex, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom)) {
    return { hoverKind: 'active-vertex', point: activeVertex, segmentId: null };
  }
};
